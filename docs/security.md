# Security

## Transport & headers
`helmet` sets CSP (`default-src 'self'`, no inline scripts, `frame-ancestors 'none'`),
CORS is allowlist-based via `CORS_ALLOWED_ORIGINS`, cookies are
`httpOnly`, `sameSite: strict`, and `secure` in production.

## AuthN/AuthZ
- Passwords hashed with argon2id (`authService.ts`).
- Access tokens are short-lived (15 min) JWTs; refresh tokens are random
  48-byte values, stored server-side only as a SHA-256 hash, rotated on
  every use (`rotateRefreshSession`), so a stolen refresh cookie is
  useless once it's next legitimately used.
- API keys: shown once at creation, stored as argon2id hashes, scoped and
  revocable, rate-limited per key.
- RBAC enforced server-side on every organization-scoped route
  (`requireOrgRole`), not just hidden in the UI.

## Input validation
Every route validates its body with `zod` before touching the database.

## Rate limiting
Global backstop (300 req/min), a stricter per-API-key limit
(120 req/min) on `/api/v1`, and a dedicated brute-force limiter
(10 req/15min per IP) on `/auth/login` and `/auth/register`.

## Secrets handling
- `.env.example` ships with no real values; `.env` is gitignored.
- Webhook signing secrets and API keys are never returned again after
  creation.
- Webhook secrets are encrypted at rest with AES-256-GCM
  (`backend/src/lib/secretBox.ts`), keyed by `WEBHOOK_ENCRYPTION_KEY`, and
  decrypted only at delivery time to compute the outgoing HMAC signature.
  In production, `WEBHOOK_ENCRYPTION_KEY` should come from a KMS/HSM
  unwrap rather than a bare env var — swap `getEncryptionKey()`'s env read
  for that call; nothing else needs to change.

## SQL injection / XSS
Prisma parameterizes all queries (no raw SQL in this codebase). React
escapes all rendered content by default; no `dangerouslySetInnerHTML` is
used anywhere in `frontend/`.

## IDOR / organization isolation
Every organization-scoped route re-checks that the resource in the URL
actually belongs to the caller's authorized organization, not just that
the caller has *some* role somewhere — this was previously missed on the
webhook-deliveries endpoint (fixed: see `docs/submission-checklist.md`)
and on the verification-result read endpoint, which was fully
unauthenticated (also fixed).

## Error handling
The global Express error handler (`server.ts`) never returns stack traces
or internal error detail to the client — only a generic `internal_error`.
`pino-http` redacts `Authorization`, `Cookie`, and `password` fields from
logs.

## Dependency auditing
Run `yarn npm audit` (or `npm audit` per-workspace) as part of your release
process; this isn't automated in CI in this build — add a step to
`.github/workflows/ci.yml` if you want it gated on every PR.

## What's NOT implemented in this build
- MFA is schema-ready (`User.mfaEnabled`, `mfaSecretEnc`) but no
  TOTP enrollment/verification flow is wired up yet.
- No WAF / DDoS-layer protection — that's an infrastructure decision for
  wherever you deploy this.

## Reporting a vulnerability

This is a reference/hackathon-stage build, not a production service with
a dedicated security team — but if you find a real issue, please report
it privately rather than opening a public GitHub issue:

1. Email the maintainer (add a real contact address here once this repo
   has an owner) with a description, reproduction steps, and impact.
2. Please don't test against any deployed instance beyond what's needed
   to demonstrate the issue, and don't access, modify, or exfiltrate
   other users' data.
3. Allow a reasonable window to fix the issue before any public
   disclosure.

There's currently no bug bounty program.
