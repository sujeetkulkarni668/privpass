import { Router } from "express";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
import { requireUser, requireOrgRole, type AuthedRequest } from "../middleware/auth.js";
import { writeAuditLog } from "../services/auditService.js";
import { encryptSecret } from "../lib/secretBox.js";

export const organizationsRouter = Router();

organizationsRouter.post("/", requireUser, async (req: AuthedRequest, res) => {
  const schema = z.object({ name: z.string().min(2).max(100) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + randomBytes(3).toString("hex");

  const org = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      slug,
      members: { create: { userId: req.userId!, role: "OWNER" } },
    },
  });

  await writeAuditLog({ organizationId: org.id, actorUserId: req.userId, action: "organization.created" });
  return res.status(201).json({ organization: org });
});

organizationsRouter.get("/", requireUser, async (req: AuthedRequest, res) => {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: req.userId },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json({
    organizations: memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
    })),
  });
});

organizationsRouter.get("/:orgId", requireOrgRole("VIEWER"), async (req: AuthedRequest, res) => {
  const org = await prisma.organization.findUnique({ where: { id: req.orgId } });
  return res.json({ organization: org });
});

organizationsRouter.get("/:orgId/members", requireOrgRole("ANALYST"), async (req: AuthedRequest, res) => {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: req.orgId },
    include: { user: { select: { id: true, username: true, displayName: true } } },
  });
  return res.json({ members });
});

organizationsRouter.post("/:orgId/members", requireOrgRole("ADMIN"), async (req: AuthedRequest, res) => {
  const schema = z.object({
    userId: z.string().uuid(),
    role: z.enum(["OWNER", "ADMIN", "DEVELOPER", "ANALYST", "VIEWER"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  // Only an OWNER can grant OWNER, preventing privilege self-escalation by admins.
  if (parsed.data.role === "OWNER" && req.orgRole !== "OWNER") {
    return res.status(403).json({ error: "only_owner_can_grant_owner" });
  }

  const member = await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: req.orgId!, userId: parsed.data.userId } },
    create: { organizationId: req.orgId!, userId: parsed.data.userId, role: parsed.data.role },
    update: { role: parsed.data.role },
  });

  await writeAuditLog({
    organizationId: req.orgId,
    actorUserId: req.userId,
    action: "organization.member_role_changed",
    targetType: "user",
    targetId: parsed.data.userId,
    metadata: { role: parsed.data.role },
  });

  return res.json({ member });
});

// --- API keys ---

organizationsRouter.post("/:orgId/api-keys", requireOrgRole("ADMIN"), async (req: AuthedRequest, res) => {
  const schema = z.object({
    name: z.string().min(1).max(100),
    scopes: z.array(z.string()).default(["verification-requests:write", "verifications:read"]),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const rawKey = "pp_live_" + randomBytes(24).toString("hex");
  const keyPrefix = rawKey.slice(0, 12);
  const keyHash = await argon2.hash(rawKey, { type: argon2.argon2id });

  const apiKey = await prisma.apiKey.create({
    data: {
      organizationId: req.orgId!,
      name: parsed.data.name,
      keyPrefix,
      keyHash,
      scopes: parsed.data.scopes,
    },
  });

  await writeAuditLog({
    organizationId: req.orgId,
    actorUserId: req.userId,
    action: "api_key.created",
    targetType: "api_key",
    targetId: apiKey.id,
  });

  // Full key shown exactly once.
  return res.status(201).json({ id: apiKey.id, name: apiKey.name, key: rawKey, scopes: apiKey.scopes });
});

organizationsRouter.get("/:orgId/api-keys", requireOrgRole("DEVELOPER"), async (req: AuthedRequest, res) => {
  const keys = await prisma.apiKey.findMany({
    where: { organizationId: req.orgId },
    select: { id: true, name: true, keyPrefix: true, scopes: true, lastUsedAt: true, revokedAt: true, createdAt: true },
  });
  return res.json({ apiKeys: keys });
});

organizationsRouter.delete("/:orgId/api-keys/:keyId", requireOrgRole("ADMIN"), async (req: AuthedRequest, res) => {
  await prisma.apiKey.updateMany({
    where: { id: req.params.keyId, organizationId: req.orgId },
    data: { revokedAt: new Date() },
  });
  await writeAuditLog({
    organizationId: req.orgId,
    actorUserId: req.userId,
    action: "api_key.revoked",
    targetType: "api_key",
    targetId: req.params.keyId,
  });
  return res.status(204).send();
});

// --- Webhooks ---

organizationsRouter.post("/:orgId/webhooks", requireOrgRole("ADMIN"), async (req: AuthedRequest, res) => {
  const schema = z.object({
    url: z.string().url(),
    eventTypes: z.array(z.enum([
      "VERIFICATION_CREATED", "VERIFICATION_PENDING", "VERIFICATION_VERIFIED",
      "VERIFICATION_FAILED", "VERIFICATION_EXPIRED", "CREDENTIAL_REVOKED", "CREDENTIAL_EXPIRED",
    ])).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const secret = randomBytes(32).toString("hex");
  const secretEnc = encryptSecret(secret);

  const webhook = await prisma.webhook.create({
    data: { organizationId: req.orgId!, url: parsed.data.url, eventTypes: parsed.data.eventTypes, secretEnc },
  });

  await writeAuditLog({
    organizationId: req.orgId,
    actorUserId: req.userId,
    action: "webhook.created",
    targetType: "webhook",
    targetId: webhook.id,
  });

  return res.status(201).json({ id: webhook.id, url: webhook.url, secret, eventTypes: webhook.eventTypes });
});

organizationsRouter.get("/:orgId/webhooks/:id/deliveries", requireOrgRole("DEVELOPER"), async (req: AuthedRequest, res) => {
  // IDOR fix: requireOrgRole only checks the caller's role within :orgId —
  // it does not know whether the :id in the URL actually belongs to that
  // org. Without this check, any DEVELOPER-role member of *any*
  // organization could read another organization's webhook delivery logs
  // (which include verification payload data) by supplying a foreign
  // webhook id.
  const webhook = await prisma.webhook.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
    select: { id: true },
  });
  if (!webhook) return res.status(404).json({ error: "not_found" });

  const deliveries = await prisma.webhookDelivery.findMany({
    where: { webhookId: req.params.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return res.json({ deliveries });
});
