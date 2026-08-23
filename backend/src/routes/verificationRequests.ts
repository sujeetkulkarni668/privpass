import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createHash } from "node:crypto";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma.js";
import { requireUser, requireOrgRole, requireApiKey, type AuthedRequest } from "../middleware/auth.js";
import { writeAuditLog } from "../services/auditService.js";
import { dispatchWebhookEvent } from "../services/webhookService.js";

export const verificationRequestsRouter = Router();

const claimEnum = z.enum(["PAN_VALID", "AADHAAR_VERIFIED", "AGE_OVER_18", "IDENTITY_VERIFIED", "RESIDENCY_VALID"]);

const createSchema = z.object({
  organizationId: z.string().uuid(),
  requestedClaims: z.array(claimEnum).min(1).max(8),
  optionalClaims: z.array(claimEnum).max(8).default([]),
  expiresInMinutes: z.number().int().positive().max(10080).default(60), // default 1h, max 7 days
});

// POST /api/v1/verification-requests — verifier creates a request.
// Available both to dashboard users (session auth) and API-key callers.
verificationRequestsRouter.post(
  "/",
  requireOrgRole("DEVELOPER"),
  async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });

    const { organizationId, requestedClaims, optionalClaims, expiresInMinutes } = parsed.data;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60_000);

    const request = await prisma.verificationRequest.create({
      data: {
        organizationId,
        createdByUserId: req.userId,
        requestedClaims,
        optionalClaims,
        expiresAt,
        status: "PENDING",
      },
    });

    // The verification link/QR encodes only the opaque request ID — never
    // any identity data — and a hash of that link is stored for
    // tamper-detection.
    const verifyUrl = `${process.env.PUBLIC_APP_URL ?? "http://localhost:5173"}/verify/${request.id}`;
    const qrPayloadHash = createHash("sha256").update(verifyUrl).digest("hex");
    await prisma.verificationRequest.update({
      where: { id: request.id },
      data: { qrPayloadHash },
    });

    const qrDataUrl = await QRCode.toDataURL(verifyUrl);

    await writeAuditLog({
      organizationId,
      actorUserId: req.userId,
      action: "verification.created",
      targetType: "verification_request",
      targetId: request.id,
      metadata: { requestedClaims, optionalClaims },
    });

    await dispatchWebhookEvent(organizationId, "VERIFICATION_CREATED", {
      requestId: request.id,
      requestedClaims,
      expiresAt,
    });

    return res.status(201).json({
      id: request.id,
      verifyUrl,
      qrDataUrl,
      requestedClaims,
      optionalClaims,
      expiresAt,
      status: request.status,
    });
  }
);

verificationRequestsRouter.get("/:id", async (req, res) => {
  const request = await prisma.verificationRequest.findUnique({
    where: { id: req.params.id },
    include: { organization: { select: { name: true, id: true } } },
  });
  if (!request) return res.status(404).json({ error: "not_found" });

  const isExpired = request.status === "PENDING" && request.expiresAt < new Date();
  if (isExpired) {
    await prisma.verificationRequest.update({ where: { id: request.id }, data: { status: "EXPIRED" } });
  }

  // Public-safe view: what the USER sees when opening a QR/link. No
  // sensitive data is present in this payload by construction.
  return res.json({
    id: request.id,
    organization: request.organization,
    requestedClaims: request.requestedClaims,
    optionalClaims: request.optionalClaims,
    status: isExpired ? "EXPIRED" : request.status,
    expiresAt: request.expiresAt,
  });
});

verificationRequestsRouter.post("/:id/cancel", requireOrgRole("DEVELOPER"), async (req: AuthedRequest, res) => {
  const request = await prisma.verificationRequest.findFirst({
    where: { id: req.params.id, organizationId: req.orgId },
  });
  if (!request) return res.status(404).json({ error: "not_found" });
  if (request.status !== "PENDING") return res.status(409).json({ error: "not_cancellable" });

  const updated = await prisma.verificationRequest.update({
    where: { id: request.id },
    data: { status: "CANCELLED" },
  });

  await writeAuditLog({
    organizationId: request.organizationId,
    actorUserId: req.userId,
    action: "verification.cancelled",
    targetType: "verification_request",
    targetId: request.id,
  });

  return res.json({ id: updated.id, status: updated.status });
});
