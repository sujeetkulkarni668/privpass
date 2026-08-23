import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthedRequest } from "../middleware/auth.js";

export const adminRouter = Router();

// Simple allowlist-based admin gate for this reference build. Production
// should use a dedicated `isPlatformAdmin` column + break-glass audit
// logging rather than an env var allowlist.
function requirePlatformAdmin(req: AuthedRequest, res: any, next: any) {
  const allowlist = (process.env.PLATFORM_ADMIN_USER_IDS ?? "").split(",").filter(Boolean);
  if (!req.userId || !allowlist.includes(req.userId)) {
    return res.status(403).json({ error: "admin_only" });
  }
  return next();
}

adminRouter.use(requireUser, requirePlatformAdmin);

adminRouter.get("/stats", async (_req, res) => {
  const [users, organizations, credentials, verificationRequests, verificationResults] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.credential.count(),
    prisma.verificationRequest.count(),
    prisma.verificationResult.count(),
  ]);

  const verifiedCount = await prisma.verificationResult.count({ where: { status: "VERIFIED" } });
  const failedCount = await prisma.verificationResult.count({ where: { status: "FAILED" } });

  return res.json({
    users,
    organizations,
    credentials,
    verificationRequests,
    verificationResults: { total: verificationResults, verified: verifiedCount, failed: failedCount },
  });
});

adminRouter.get("/organizations", async (_req, res) => {
  const orgs = await prisma.organization.findMany({
    include: { _count: { select: { members: true, verificationRequests: true, apiKeys: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ organizations: orgs });
});

adminRouter.get("/audit-logs", async (req, res) => {
  const take = Math.min(Number(req.query.limit ?? 100), 500);
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take });
  return res.json({ auditLogs: logs });
});

// Suspicious-activity heuristic: orgs with an unusually high proportion of
// FAILED verifications in the last 24h, which may indicate proof spoofing
// attempts or credential-stuffing style probing.
adminRouter.get("/suspicious-activity", async (_req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentResults = await prisma.verificationResult.findMany({
    where: { verifiedAt: { gte: since } },
    include: { verificationRequest: { select: { organizationId: true } } },
  });

  const byOrg = new Map<string, { total: number; failed: number }>();
  for (const r of recentResults) {
    const orgId = r.verificationRequest.organizationId;
    const entry = byOrg.get(orgId) ?? { total: 0, failed: 0 };
    entry.total += 1;
    if (r.status === "FAILED") entry.failed += 1;
    byOrg.set(orgId, entry);
  }

  const flagged = [...byOrg.entries()]
    .filter(([, v]) => v.total >= 5 && v.failed / v.total > 0.5)
    .map(([organizationId, v]) => ({ organizationId, ...v, failureRate: v.failed / v.total }));

  return res.json({ flagged });
});
