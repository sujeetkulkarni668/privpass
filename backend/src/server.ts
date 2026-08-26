import "dotenv/config";
import express from "express";
import helmetModule from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimitModule from "express-rate-limit";
import { pinoHttp } from "pino-http";

import { authRouter } from "./routes/auth.js";
import { credentialsRouter } from "./routes/credentials.js";
import { organizationsRouter } from "./routes/organizations.js";
import { verificationRequestsRouter } from "./routes/verificationRequests.js";
import { verificationsRouter } from "./routes/verifications.js";
import { apiV1Router } from "./routes/apiV1.js";
import { adminRouter } from "./routes/admin.js";
import { requireUser } from "./middleware/auth.js";

const helmet = helmetModule as any;
const rateLimit = rateLimitModule as any;

const app = express();

app.set("trust proxy", 1);
/* -------------------------------------------------------------------------- */
/* Security                                                                   */
/* -------------------------------------------------------------------------- */

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

app.use(
  cors({
    origin: (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use(
  pinoHttp({
    redact: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.body.password",
    ],
  })
);

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                              */
/* -------------------------------------------------------------------------- */

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* -------------------------------------------------------------------------- */
/* Health checks                                                              */
/* -------------------------------------------------------------------------- */

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/healthz", (_req, res) => {
  res.json({ ok: true });
});

/* -------------------------------------------------------------------------- */
/* API routes                                                                 */
/* -------------------------------------------------------------------------- */

/* Authentication */
app.use("/auth", authRouter);
app.use("/api/auth", authRouter);

/* Credentials */
app.use("/credentials", requireUser, credentialsRouter);
app.use("/api/credentials", requireUser, credentialsRouter);

/* Organizations */
app.use("/organizations", organizationsRouter);
app.use("/api/organizations", organizationsRouter);

/* Verification requests */
app.use(
  "/verification-requests",
  requireUser,
  verificationRequestsRouter
);

app.use(
  "/api/verification-requests",
  requireUser,
  verificationRequestsRouter
);

/* Verifications */
app.use("/verifications", verificationsRouter);
app.use("/api/verifications", verificationsRouter);

/* API v1 */
app.use("/api/v1", apiV1Router);

/* Admin */
app.use("/admin", adminRouter);
app.use("/api/admin", adminRouter);

/* -------------------------------------------------------------------------- */
/* Error handler                                                              */
/* -------------------------------------------------------------------------- */

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    req.log?.error({ err }, "unhandled_error");

    res.status(500).json({
      error: "internal_error",
    });
  }
);

/* -------------------------------------------------------------------------- */
/* Server                                                                     */
/* -------------------------------------------------------------------------- */

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`PrivPass API listening on :${port}`);
});

/*
 * Vercel Node runtime expects the default export to be the server/function.
 */
export default app;
