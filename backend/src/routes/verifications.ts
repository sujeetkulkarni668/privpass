import { Router } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "../lib/prisma.js";
import { requireUser, type AuthedRequest } from "../middleware/auth.js";
import { verifyAccessToken } from "../services/authService.js";
import { writeAuditLog } from "../services/auditService.js";
import { dispatchWebhookEvent } from "../services/webhookService.js";
import { generateProofForClaims } from "../services/proofService.js";

export const verificationsRouter = Router();

// Step 1: user reviews + explicitly approves disclosure for a pending
// request. This records CONSENT before any proof is generated.
verificationsRouter.post("/:requestId/consent", requireUser, async (req: AuthedRequest, res) => {
  const schema = z.object({
    approvedClaims: z.array(
      z.enum(["PAN_VALID", "AADHAAR_VERIFIED", "AGE_OVER_18", "IDENTITY_VERIFIED", "RESIDENCY_VALID"])
    ).min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const request = await prisma.verificationRequest.findUnique({ where: { id: req.params.requestId } });
  if (!request) return res.status(404).json({ error: "not_found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: "request_not_pending" });
  if (request.expiresAt < new Date()) {
    await prisma.verificationRequest.update({ where: { id: request.id }, data: { status: "EXPIRED" } });
    return res.status(410).json({ error: "request_expired" });
  }

  // Every approved claim must be one that was actually requested
  // (required or optional) — a verifier can never receive more than it asked for.
  const allowed = new Set([...request.requestedClaims, ...request.optionalClaims]);
  const invalid = parsed.data.approvedClaims.filter((c) => !allowed.has(c as any));
  if (invalid.length > 0) {
    return res.status(400).json({ error: "claim_not_requested", invalid });
  }

  await prisma.consent.upsert({
    where: { verificationRequestId: request.id },
    create: {
      verificationRequestId: request.id,
      userId: req.userId!,
      disclosedClaims: parsed.data.approvedClaims as any,
    },
    update: { disclosedClaims: parsed.data.approvedClaims as any, approvedAt: new Date() },
  });

  await prisma.verificationRequest.update({
    where: { id: request.id },
    data: { status: "APPROVED", subjectUserId: req.userId },
  });

  await writeAuditLog({
    organizationId: request.organizationId,
    actorUserId: req.userId,
    action: "verification.consent_given",
    targetType: "verification_request",
    targetId: request.id,
    metadata: { approvedClaims: parsed.data.approvedClaims },
  });

  return res.json({ status: "APPROVED" });
});

// Step 2: generate + verify the zero-knowledge proof for the approved
// claims, using the user's stored credential commitments and the private
// witness values supplied by their wallet in this request body only
// (never persisted).
verificationsRouter.post("/:requestId/prove", requireUser, async (req: AuthedRequest, res) => {
  const schema = z.object({
    // credentialId -> { salt, rawValue } supplied transiently by the
    // wallet for proof generation. Never written to the database.
    witnesses: z.record(z.string(), z.object({ salt: z.string(), rawValue: z.string() })),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const request = await prisma.verificationRequest.findUnique({ where: { id: req.params.requestId } });
  if (!request) return res.status(404).json({ error: "not_found" });
  if (request.status !== "APPROVED" || request.subjectUserId !== req.userId) {
    return res.status(409).json({ error: "consent_required_first" });
  }

  const consent = await prisma.consent.findUnique({ where: { verificationRequestId: request.id } });
  if (!consent) return res.status(409).json({ error: "consent_required_first" });

  const credentials = await prisma.credential.findMany({ where: { userId: req.userId } });

  const { claimResults, proofValid, proofRef } = await generateProofForClaims(
    consent.disclosedClaims as string[],
    credentials,
    parsed.data.witnesses
  );

  const resultStatus = proofValid ? "VERIFIED" : "FAILED";

  await prisma.verificationResult.create({
    data: {
      verificationRequestId: request.id,
      status: resultStatus,
      claimResults: claimResults as any,
      proofValid,
      proofRef,
    },
  });

  await prisma.verificationRequest.update({
    where: { id: request.id },
    data: { status: "COMPLETED" },
  });

  await writeAuditLog({
    organizationId: request.organizationId,
    actorUserId: req.userId,
    action: "verification.proof_verified",
    targetType: "verification_request",
    targetId: request.id,
    metadata: { claimResults, proofValid },
  });

  await dispatchWebhookEvent(
    request.organizationId,
    proofValid ? "VERIFICATION_VERIFIED" : "VERIFICATION_FAILED",
    { requestId: request.id, claimResults, proofValid }
  );

  // Response contains ONLY booleans per claim + proof validity — this is
  // exactly what the verifier dashboard will also see. No private
  // identity value is ever included.
  return res.json({ status: resultStatus, claimResults, proofValid });
});

// Verifier-facing read of the result. Requires proof of membership in the
// owning organization — either an API key scoped to it, or a dashboard
// session for a user with a role in it. This used to be fully
// unauthenticated ("simplified for brevity"), which let anyone who knew
// or guessed a verification id read that subject's claim results
// (VERIFIED/FAILED for age/PAN/etc.) — a real privacy leak even though no
// raw PII was included, and a violation of organization isolation.
verificationsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const result = await prisma.verificationResult.findUnique({
    where: { verificationRequestId: req.params.id },
    include: { verificationRequest: { select: { organizationId: true } } },
  });
  if (!result) return res.status(404).json({ error: "not_found" });

  const orgId = result.verificationRequest.organizationId;
  const authorized = await isAuthorizedForOrg(req, orgId);
  if (!authorized) return res.status(403).json({ error: "forbidden" });

  return res.json({
    status: result.status,
    claimResults: result.claimResults,
    proofValid: result.proofValid,
    verifiedAt: result.verifiedAt,
  });
});

async function isAuthorizedForOrg(req: AuthedRequest, orgId: string): Promise<boolean> {
  // API-key path: requireApiKey wasn't run as route middleware here (this
  // endpoint accepts either auth mode), so check the header directly via
  // the same helper it uses would require refactoring requireApiKey into
  // a non-middleware form; instead, run it as middleware-style inline.
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer pp_")) {
    const rawKey = authHeader.slice("Bearer ".length);
    const prefix = rawKey.slice(0, 12);
    const candidates = await prisma.apiKey.findMany({ where: { keyPrefix: prefix, revokedAt: null } });
    for (const candidate of candidates) {
      if (candidate.organizationId !== orgId) continue;
      if (await argon2.verify(candidate.keyHash, rawKey).catch(() => false)) return true;
    }
    return false;
  }

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { sub } = verifyAccessToken(authHeader.slice("Bearer ".length));
      const membership = await prisma.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: orgId, userId: sub } },
      });
      return !!membership;
    } catch {
      return false;
    }
  }

  return false;
}
