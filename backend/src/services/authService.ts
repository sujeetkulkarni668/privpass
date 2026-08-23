import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../lib/prisma.js";

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 min
const REFRESH_TOKEN_TTL_DAYS = 30;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export async function hashPassword(password: string): Promise<string> {
  // argon2id: current OWASP-recommended default for password hashing.
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function issueAccessToken(userId: string): string {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  return jwt.sign({ sub: userId, typ: "access" }, secret, {
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): { sub: string } {
  const secret = requireEnv("JWT_ACCESS_SECRET");
  const payload = jwt.verify(token, secret) as jwt.JwtPayload;
  if (payload.typ !== "access" || typeof payload.sub !== "string") {
    throw new Error("invalid token type");
  }
  return { sub: payload.sub };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueRefreshSession(
  userId: string,
  meta: { userAgent?: string; ipAddress?: string }
): Promise<string> {
  const rawToken = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: hashToken(rawToken),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
      expiresAt,
    },
  });

  // The raw token is returned once, to be set as an httpOnly cookie. Only
  // its hash is ever persisted.
  return rawToken;
}

export async function rotateRefreshSession(
  rawToken: string,
  meta: { userAgent?: string; ipAddress?: string }
): Promise<{ userId: string; newRawToken: string } | null> {
  const tokenHash = hashToken(rawToken);
  const session = await prisma.session.findFirst({
    where: { refreshTokenHash: tokenHash, revokedAt: null },
  });

  if (!session || session.expiresAt < new Date()) return null;

  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });

  const newRawToken = await issueRefreshSession(session.userId, meta);
  return { userId: session.userId, newRawToken };
}

export async function revokeSession(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await prisma.session.updateMany({
    where: { refreshTokenHash: tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
