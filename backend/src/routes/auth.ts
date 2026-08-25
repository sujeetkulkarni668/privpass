import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import {
  hashPassword,
  verifyPassword,
  issueAccessToken,
  issueRefreshSession,
  rotateRefreshSession,
  revokeSession,
} from "../services/authService.js";
import { requireUser, type AuthedRequest } from "../middleware/auth.js";
import { writeAuditLog } from "../services/auditService.js";
import { regeneratePreprodExport } from "../services/preprodExport.js";

export const authRouter = Router();

// The global 300/min limiter in server.ts is a backstop, not a brute-force
// defense — login attempts specifically need a much tighter, per-endpoint
// limit. Keyed on IP; username-keyed limiting is intentionally NOT layered
// on top since that itself creates an account-lockout DoS vector against a
// known victim username.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_attempts" },
});

// Username: 3–50 chars, alphanumeric + dots/underscores/hyphens, no spaces.
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,50}$/;

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "username must be at least 3 characters")
    .max(50, "username must be at most 50 characters")
    .regex(USERNAME_RE, "username may only contain letters, numbers, dots, underscores, and hyphens"),
  password: z.string().min(12, "password must be at least 12 characters"),
  displayName: z.string().min(1).max(100),
});

authRouter.post("/register", loginRateLimit, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const { username, password, displayName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    // Do not leak which field failed beyond a generic message.
    return res.status(409).json({ error: "account_exists" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, displayName },
  });

  await writeAuditLog({ actorUserId: user.id, action: "user.registered" });

  // Fire-and-forget: update the preprod Excel export on GitHub
  regeneratePreprodExport().catch(() => {});

  return res.status(201).json({ id: user.id, username: user.username, displayName: user.displayName });
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string(),
});

authRouter.post("/login", loginRateLimit, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });

  // Constant-shape response whether or not the user exists, to avoid
  // account enumeration via timing/response differences.
  const ok = user ? await verifyPassword(user.passwordHash, password) : false;
  if (!user || !ok) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const accessToken = issueAccessToken(user.id);
  const refreshToken = await issueRefreshSession(user.id, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  res.cookie("privpass_refresh", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  await writeAuditLog({ actorUserId: user.id, action: "user.login", ipAddress: req.ip });

  // Fire-and-forget: update the preprod Excel export on GitHub after every login
  regeneratePreprodExport().catch(() => {});

  return res.json({
    accessToken,
    user: { id: user.id, username: user.username, displayName: user.displayName },
  });
});

authRouter.post("/refresh", async (req, res) => {
  const rawToken = req.cookies?.privpass_refresh;
  if (!rawToken) return res.status(401).json({ error: "missing_refresh_token" });

  const rotated = await rotateRefreshSession(rawToken, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  if (!rotated) return res.status(401).json({ error: "invalid_refresh_token" });

  const accessToken = issueAccessToken(rotated.userId);
  res.cookie("privpass_refresh", rotated.newRawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.json({ accessToken });
});

authRouter.post("/logout", async (req, res) => {
  const rawToken = req.cookies?.privpass_refresh;
  if (rawToken) await revokeSession(rawToken);
  res.clearCookie("privpass_refresh");
  return res.status(204).send();
});

// Link a connected Midnight wallet address to the authenticated user account.
// Called by the frontend after a successful wallet connection. Stores the
// wallet address for audit purposes. Does NOT make wallet mandatory for login.
authRouter.put("/wallet", requireUser, async (req: AuthedRequest, res) => {
  const schema = z.object({
    walletAddress: z.string().min(10).max(256),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: { walletAddress: parsed.data.walletAddress },
  });

  await writeAuditLog({
    actorUserId: req.userId,
    action: "user.wallet_linked",
    metadata: { walletAddress: parsed.data.walletAddress },
  });

  return res.json({
    id: user.id,
    username: user.username,
    walletAddress: user.walletAddress,
  });
});

// Get the current user's profile (used by the frontend to check wallet linkage).
authRouter.get("/me", requireUser, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, username: true, displayName: true, walletAddress: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: "not_found" });
  return res.json({ user });
});
