// The developer-facing REST API described in docs/api.md, authenticated
// via API key rather than user session. Thin wrappers around the same
// services the dashboard uses, scoped strictly to the caller's organization.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireApiKey, type AuthedRequest } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { verificationRequestsRouter } from "./verificationRequests.js";
import { verificationsRouter } from "./verifications.js";

export const apiV1Router = Router();

const apiRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 120, // 120 req/min per key, in-memory store — swap for a Redis
              // store behind a load balancer in production.
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthedRequest) => req.apiKeyId ?? req.ip ?? "anonymous",
});

apiV1Router.use(requireApiKey, apiRateLimit);

// Organization is implied by the API key; requireOrgRole("DEVELOPER")
// still runs to keep a single authorization code path, matching req.orgId
// set by requireApiKey.
apiV1Router.use("/verification-requests", verificationRequestsRouter);
apiV1Router.use("/verifications", verificationsRouter);

apiV1Router.get("/credentials/:id/status", async (req: AuthedRequest, res) => {
  // Verifiers only ever see credential *status*, scoped to credentials
  // that were actually disclosed via a completed verification with this org.
  const result = await prisma.verificationResult.findFirst({
    where: {
      verificationRequest: { organizationId: req.orgId },
    },
    orderBy: { verifiedAt: "desc" },
  });
  if (!result) return res.status(404).json({ error: "not_found" });
  return res.json({ status: result.status, claimResults: result.claimResults });
});
