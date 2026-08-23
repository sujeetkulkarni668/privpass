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
import { writeAuditLog } from "../services/auditService.js";

export const authRouter = Router();

// The global 300/min limiter in server.ts is a backstop, not a brute-force
// defense — login attempts specifically need a much tighter, per-endpoint
// limit. Keyed on IP; email-keyed limiting is intentionally NOT layered on
// top since that itself creates an account-lockout DoS vector against a
// known victim email.
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_attempts" },
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12, "password must be at least 12 characters"),
  displayName: z.string().min(1).max(100),
});

authRouter.post("/register", loginRateLimit, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  }
  const { email, password, displayName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Do not leak which field failed beyond a generic message.
    return res.status(409).json({ error: "account_exists" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName },
  });

  await writeAuditLog({ actorUserId: user.id, action: "user.registered" });

  return res.status(201).json({ id: user.id, email: user.email, displayName: user.displayName });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post("/login", loginRateLimit, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

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

  return res.json({ accessToken, user: { id: user.id, email: user.email, displayName: user.displayName } });
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
