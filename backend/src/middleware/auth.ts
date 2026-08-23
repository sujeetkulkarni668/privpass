import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/authService.js";
import { prisma } from "../lib/prisma.js";
import argon2 from "argon2";

export interface AuthedRequest extends Request {
  userId?: string;
  orgId?: string;
  orgRole?: "OWNER" | "ADMIN" | "DEVELOPER" | "ANALYST" | "VIEWER";
  apiKeyId?: string;
}

// Session-based auth (dashboard / user app), via bearer access token.
export function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing_authorization" });
  }
  try {
    const { sub } = verifyAccessToken(header.slice("Bearer ".length));
    req.userId = sub;
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_or_expired_token" });
  }
}

// API-key auth (server-to-server / verifier integrations).
export async function requireApiKey(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer pp_")) {
    return res.status(401).json({ error: "missing_api_key" });
  }
  const rawKey = header.slice("Bearer ".length);
  const prefix = rawKey.slice(0, 12);

  const candidates = await prisma.apiKey.findMany({
    where: { keyPrefix: prefix, revokedAt: null },
  });

  for (const candidate of candidates) {
    if (await argon2.verify(candidate.keyHash, rawKey).catch(() => false)) {
      req.orgId = candidate.organizationId;
      req.apiKeyId = candidate.id;
      await prisma.apiKey.update({
        where: { id: candidate.id },
        data: { lastUsedAt: new Date() },
      });
      return next();
    }
  }

  return res.status(401).json({ error: "invalid_api_key" });
}

const ROLE_RANK: Record<string, number> = {
  VIEWER: 0,
  ANALYST: 1,
  DEVELOPER: 2,
  ADMIN: 3,
  OWNER: 4,
};

// Loads the caller's membership + role for :orgId in the route, and
// enforces a minimum role. Organizations are strictly isolated: a member
// of org A can never act on org B's resources through this middleware.
export function requireOrgRole(minRole: keyof typeof ROLE_RANK) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const orgId = req.params.orgId ?? req.body?.organizationId ?? req.orgId;
    if (!orgId) return res.status(400).json({ error: "missing_organization" });

    if (!req.userId) {
      // API-key path already resolved orgId + implicit DEVELOPER-level scope.
      if (req.orgId === orgId) return next();
      return res.status(403).json({ error: "forbidden" });
    }

    const membership = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId: req.userId } },
    });

    if (!membership || ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
      return res.status(403).json({ error: "insufficient_role" });
    }

    req.orgId = orgId;
    req.orgRole = membership.role;
    return next();
  };
}
