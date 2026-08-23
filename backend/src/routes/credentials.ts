import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthedRequest } from "../middleware/auth.js";
import { getConfiguredProvider, computeCommitment } from "../services/identityProviders.js";
import { writeAuditLog } from "../services/auditService.js";
import { isMidnightConfigured, getMidnightClient } from "../services/midnightClient.js";

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  return out;
}

export const credentialsRouter = Router();

// Issue a new (synthetic, in this build) credential for the logged-in
// user. Only the commitment is persisted; the salt is returned once to
// the caller for wallet-side storage and is never saved server-side.
credentialsRouter.post("/issue", requireUser, async (req: AuthedRequest, res) => {
  const schema = z.object({
    type: z.enum(["PAN", "AADHAAR", "AGE", "RESIDENCY", "IDENTITY_COMPOSITE"]),
    expiresInDays: z.number().int().positive().max(3650).default(365),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  // Enforce limit: maximum 1 active credential per type per user account
  const existingActive = await prisma.credential.findFirst({
    where: {
      userId: req.userId!,
      type: parsed.data.type,
      status: "ACTIVE",
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });
  if (existingActive) {
    return res.status(409).json({
      error: "credential_already_exists",
      message: `You already have an active ${parsed.data.type} credential in this account. Only 1 credential per type is allowed. Revoke the existing credential before issuing a new one.`,
    });
  }

  const provider = getConfiguredProvider();
  const attrs = await provider.fetchAttributes(req.userId!);

  const valueByType: Record<string, string> = {
    PAN: attrs.pan,
    AADHAAR: attrs.aadhaar,
    AGE: String(attrs.dobUnixSeconds),
    RESIDENCY: attrs.address,
    IDENTITY_COMPOSITE: `${attrs.pan}|${attrs.aadhaar}`,
  };

  const { commitment, salt } = computeCommitment(valueByType[parsed.data.type]);
  const expiresAt = new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000);

  const credential = await prisma.credential.create({
    data: {
      userId: req.userId!,
      type: parsed.data.type,
      issuer: provider.name,
      commitment,
      status: "ACTIVE",
      expiresAt,
    },
  });

  await prisma.credentialStatusEvent.create({
    data: { credentialId: credential.id, toStatus: "ACTIVE", reason: "issued" },
  });

  // Best-effort on-chain anchoring. This never blocks credential issuance
  // on-chain availability (Preprod may be unreachable, unfunded, or simply
  // not configured yet in this environment) — it records the tx hash when
  // it succeeds and logs+continues otherwise, same posture as the rest of
  // this codebase toward unavailable external dependencies (see
  // proofService.ts). If this write is missing, `onChainRef` stays null
  // and the credential is DB-only until reconciled.
  if (isMidnightConfigured()) {
    try {
      const client = await getMidnightClient();
      const { txHash } = await client.registerCredential({
        commitment: hexToBytes(commitment),
        credentialType: parsed.data.type,
        issuedAt: BigInt(Math.floor(credential.issuedAt.getTime() / 1000)),
        expiresAt: BigInt(Math.floor(expiresAt.getTime() / 1000)),
      });
      await prisma.credential.update({ where: { id: credential.id }, data: { onChainRef: txHash } });
    } catch (err) {
      req.log?.warn({ err, credentialId: credential.id }, "on-chain credential anchoring failed");
    }
  }

  await writeAuditLog({
    actorUserId: req.userId,
    action: "credential.issued",
    targetType: "credential",
    targetId: credential.id,
    metadata: { type: parsed.data.type, synthetic: provider.isSynthetic },
  });

  // `salt` is returned ONCE for the client-side wallet to store (e.g. in
  // encrypted local storage / a hardware-backed keystore in production).
  // It is never persisted by the backend.
  return res.status(201).json({
    credential: {
      id: credential.id,
      type: credential.type,
      status: credential.status,
      issuer: credential.issuer,
      commitment: credential.commitment,
      issuedAt: credential.issuedAt,
      expiresAt: credential.expiresAt,
    },
    walletSecret: { salt },
    demoNotice: provider.isSynthetic ? "DEMO CREDENTIAL — NOT A REAL GOVERNMENT ID" : undefined,
  });
});

credentialsRouter.get("/", requireUser, async (req: AuthedRequest, res) => {
  const credentials = await prisma.credential.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ credentials });
});

credentialsRouter.get("/history", requireUser, async (req: AuthedRequest, res) => {
  const credentials = await prisma.credential.findMany({
    where: { userId: req.userId },
    include: {
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ credentials });
});

credentialsRouter.get("/:id", requireUser, async (req: AuthedRequest, res) => {
  const credential = await prisma.credential.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { statusHistory: { orderBy: { createdAt: "desc" } } },
  });
  if (!credential) return res.status(404).json({ error: "not_found" });
  return res.json({ credential });
});

// Public-safe status check used by the /api/v1/credentials/:id/status
// external endpoint too — returns status only, never the commitment
// preimage or any private attribute.
credentialsRouter.get("/:id/status", requireUser, async (req: AuthedRequest, res) => {
  const credential = await prisma.credential.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!credential) return res.status(404).json({ error: "not_found" });

  const effectiveStatus =
    credential.status === "REVOKED"
      ? "REVOKED"
      : credential.expiresAt && credential.expiresAt < new Date()
      ? "EXPIRED"
      : credential.status;

  return res.json({ id: credential.id, status: effectiveStatus });
});

credentialsRouter.post("/:id/revoke", requireUser, async (req: AuthedRequest, res) => {
  const schema = z.object({ reason: z.string().max(200).optional() });
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const credential = await prisma.credential.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!credential) return res.status(404).json({ error: "not_found" });
  if (credential.status === "REVOKED") {
    return res.status(409).json({ error: "already_revoked" });
  }

  const updated = await prisma.credential.update({
    where: { id: credential.id },
    data: { status: "REVOKED", revokedAt: new Date(), revocationReason: parsed.data.reason },
  });

  await prisma.credentialStatusEvent.create({
    data: {
      credentialId: credential.id,
      fromStatus: credential.status,
      toStatus: "REVOKED",
      reason: parsed.data.reason,
    },
  });

  if (isMidnightConfigured()) {
    try {
      const client = await getMidnightClient();
      const { txHash } = await client.revokeCredential(hexToBytes(credential.commitment));
      await prisma.credential.update({ where: { id: credential.id }, data: { onChainRef: txHash } });
    } catch (err) {
      req.log?.warn({ err, credentialId: credential.id }, "on-chain credential revocation failed");
    }
  }

  await writeAuditLog({
    actorUserId: req.userId,
    action: "credential.revoked",
    targetType: "credential",
    targetId: credential.id,
    metadata: { reason: parsed.data.reason },
  });

  return res.json({ credential: updated });
});
