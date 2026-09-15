import crypto from "crypto";

export interface WebhookPayload {
  event: "verification.completed" | "verification.failed" | "credential.revoked" | "credential.issued";
  requestId: string;
  verifierAddress?: string;
  subjectAddress?: string;
  status: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface WebhookDeliveryAttempt {
  attemptNumber: number;
  statusCode?: number;
  error?: string;
  deliveredAt: string;
  durationMs: number;
}

export interface WebhookJob {
  id: string;
  url: string;
  secret: string;
  payload: WebhookPayload;
  maxRetries: number;
  currentAttempts: number;
  status: "pending" | "success" | "failed" | "retrying";
  history: WebhookDeliveryAttempt[];
  createdAt: string;
  nextRetryAt?: string;
}

export class WebhookDeliveryService {
  /**
   * Generates HMAC-SHA256 signature for the webhook payload
   */
  public static generateSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }

  /**
   * Calculates backoff delay in milliseconds for attempt n
   */
  public static calculateBackoff(attempt: number, baseMs = 1000, maxMs = 30000): number {
    const delay = Math.min(baseMs * Math.pow(2, attempt - 1), maxMs);
    const jitter = Math.floor(Math.random() * (delay * 0.1));
    return delay + jitter;
  }

  /**
   * Dispatches a webhook payload with HMAC header and records attempt
   */
  public static async deliver(job: WebhookJob): Promise<WebhookJob> {
    const payloadStr = JSON.stringify(job.payload);
    const signature = this.generateSignature(payloadStr, job.secret);
    const startTime = Date.now();

    job.currentAttempts += 1;

    try {
      const response = await fetch(job.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PrivPass-Signature": `sha256=${signature}`,
          "X-PrivPass-Event": job.payload.event,
          "X-PrivPass-Delivery-Id": job.id,
        },
        body: payloadStr,
        signal: AbortSignal.timeout(10000),
      });

      const durationMs = Date.now() - startTime;

      if (response.ok) {
        job.status = "success";
        job.history.push({
          attemptNumber: job.currentAttempts,
          statusCode: response.status,
          deliveredAt: new Date().toISOString(),
          durationMs,
        });
      } else {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      job.history.push({
        attemptNumber: job.currentAttempts,
        error: err.message,
        deliveredAt: new Date().toISOString(),
        durationMs,
      });

      if (job.currentAttempts < job.maxRetries) {
        job.status = "retrying";
        const delay = this.calculateBackoff(job.currentAttempts);
        job.nextRetryAt = new Date(Date.now() + delay).toISOString();
      } else {
        job.status = "failed";
      }
    }

    return job;
  }
}
