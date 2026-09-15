import { describe, it, expect } from "vitest";
import { WebhookDeliveryService, type WebhookJob } from "../services/webhookDelivery.js";

describe("WebhookDeliveryService", () => {
  it("should generate deterministic HMAC signatures", () => {
    const payload = JSON.stringify({ hello: "world" });
    const secret = "test-secret-key-123";
    const sig1 = WebhookDeliveryService.generateSignature(payload, secret);
    const sig2 = WebhookDeliveryService.generateSignature(payload, secret);

    expect(sig1).toBe(sig2);
    expect(sig1.length).toBe(64); // SHA-256 hex length
  });

  it("should calculate backoff with exponential increase", () => {
    const b1 = WebhookDeliveryService.calculateBackoff(1, 1000, 30000);
    const b2 = WebhookDeliveryService.calculateBackoff(2, 1000, 30000);
    const b3 = WebhookDeliveryService.calculateBackoff(3, 1000, 30000);

    expect(b1).toBeGreaterThanOrEqual(1000);
    expect(b2).toBeGreaterThanOrEqual(2000);
    expect(b3).toBeGreaterThanOrEqual(4000);
  });
});
