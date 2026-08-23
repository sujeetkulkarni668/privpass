# Threat model

## Assets

1. Raw identity attributes (PAN, Aadhaar, DOB, address) — held only
   client-side / transiently in a proof-generation request.
2. Commitments and claim results — public-safe by design, but still
   sensitive in aggregate (e.g. knowing every claim a person has ever
   proven to which verifiers is itself a privacy-relevant dataset).
3. Credentials of authority: session tokens, API keys, webhook secrets.
4. Availability and integrity of the verification flow itself (a verifier
   needs to trust that `PAN_VALID: true` really was proven, not spoofed).

## Key threats and mitigations

| Threat | Mitigation | Residual risk |
|---|---|---|
| Raw PII leaking into DB/logs | Schema has no PII columns; audit log sanitizer strips forbidden keys | New code paths could still introduce a leak if they bypass `writeAuditLog`; needs code review discipline + the tests in `auditService.test.ts` extended over time |
| Verifier receiving claims it didn't request | Server-side check in `/verifications/:id/consent` rejects unrequested claims | None known, assuming the check isn't bypassed by a future refactor |
| Replay of a stale verification link | `expiresAt` checked server-side on request read, consent, and prove | Requires correct server clock; no protection yet against a verifier reusing an *old completed* result as if it were fresh — add a `usedAt`/single-use flag if that matters for your use case |
| Forged claim results (client lies about a proof) | In the real (non-`LOCAL_CHECK`) path, this is exactly what the Compact ZK proof + on-chain verification prevents — the whole reason to use Midnight rather than a client-asserted boolean | **In this build's `LOCAL_CHECK` fallback, this protection does not exist** — see the callout below |
| Privilege escalation within an organization | RBAC rank check; only an OWNER can grant OWNER | Standard RBAC caveats apply (compromised OWNER account = full org compromise) |
| Cross-organization data leakage | Every org-scoped route filters by `organizationId` from the authenticated session/API key | Requires consistent enforcement on every new route — worth an integration test that asserts org A can never read org B's data |
| Webhook secret/API key exposure | Keys shown once at creation, hashed (API keys) at rest; webhook secrets AES-256-GCM encrypted at rest (`lib/secretBox.ts`) | Encryption key (`WEBHOOK_ENCRYPTION_KEY`) should come from a KMS/HSM unwrap in production rather than a bare env var |
| Credential-stuffing / proof-spoofing probing | `admin/suspicious-activity` flags orgs with high failure rates | Heuristic only, not a hard control |

## Callout: `LOCAL_CHECK` is not a security boundary

Until this repository is compiled against the real `compactc` toolchain
and deployed to Midnight, `proofService.ts`'s fallback path evaluates
claims by trusting witness values sent in the HTTP request body. This is
fine for exercising the application's plumbing end-to-end, but **it is
not a zero-knowledge proof and provides no cryptographic guarantee that
the claim is true** — a malicious client could submit fabricated witness
values that happen to match a commitment they also control. Treat any
result produced this way as a development fixture, not a real
verification, until the Compact circuit path is live (see
`docs/midnight.md`).

## Out of scope for this build

- Formal review of Compact contract logic by someone fluent in the shipped
  `compactc` version (contracts here are unverified against the real
  compiler — see `docs/compact-contracts.md`).
- Regulatory/compliance review for real Aadhaar/PAN integration (DPDP Act,
  UIDAI circulars, etc.) — this is a legal question, not an engineering one,
  and belongs to whoever operates a production deployment with a licensed
  provider.
- Penetration testing of a deployed instance.
