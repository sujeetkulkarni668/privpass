import { createHmac } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { decryptSecret } from "../lib/secretBox.js";

type WebhookEventType =
  | "VERIFICATION_CREATED"
  | "VERIFICATION_PENDING"
  | "VERIFICATION_VERIFIED"
  | "VERIFICATION_FAILED"
  | "VERIFICATION_EXPIRED"
  | "CREDENTIAL_REVOKED"
  | "CREDENTIAL_EXPIRED";

const MAX_ATTEMPTS = 5;
const BACKOFF_BASE_MS = 2000;

function signPayload(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

export async function dispatchWebhookEvent(
  organizationId: string,
  eventType: WebhookEventType,
  payload: Record<string, unknown>
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: { organizationId, isActive: true, eventTypes: { has: eventType } },
  });

  for (const webhook of webhooks) {
    const delivery = await prisma.webhookDelivery.create({
      data: { webhookId: webhook.id, eventType, payload: payload as any, status: "PENDING" },
    });
    void attemptDelivery(delivery.id);
  }
}

async function attemptDelivery(deliveryId: string, attempt = 1): Promise<void> {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { webhook: true },
  });
  if (!delivery) return;

  const body = JSON.stringify({
    id: delivery.id,
    type: delivery.eventType,
    createdAt: delivery.createdAt,
    data: delivery.payload,
  });

  // Decrypt the signing secret (AES-256-GCM; see lib/secretBox.ts) so the
  // HMAC below is computed over the same raw value the customer was shown
  // once at webhook-creation time, and can therefore actually verify it.
  const rawSecret = decryptSecret(delivery.webhook.secretEnc);
  const signature = signPayload(rawSecret, body);

  try {
    const response = await fetch(delivery.webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PrivPass-Signature": signature,
        "PrivPass-Event": delivery.eventType,
      },
      body,
    });

    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: response.ok ? "SUCCEEDED" : "FAILED",
        attempts: attempt,
        lastAttemptAt: new Date(),
        responseCode: response.status,
      },
    });

    if (!response.ok && attempt < MAX_ATTEMPTS) {
      scheduleRetry(deliveryId, attempt);
    }
  } catch {
    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: { status: "FAILED", attempts: attempt, lastAttemptAt: new Date() },
    });
    if (attempt < MAX_ATTEMPTS) scheduleRetry(deliveryId, attempt);
  }
}

function scheduleRetry(deliveryId: string, previousAttempt: number) {
  const delayMs = BACKOFF_BASE_MS * 2 ** (previousAttempt - 1);
  setTimeout(() => {
    void prisma.webhookDelivery
      .update({ where: { id: deliveryId }, data: { status: "RETRYING" } })
      .then(() => attemptDelivery(deliveryId, previousAttempt + 1));
  }, delayMs);
}
