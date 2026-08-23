# Architecture

## System overview

```
┌─────────────┐      ┌──────────────────┐      ┌───────────────────────┐
│  Frontend   │◄────►│  Backend REST API │◄────►│  Postgres              │
│  React/Vite │      │  Express/TS       │      │  (metadata + results)  │
└─────────────┘      └────────┬─────────┘      └───────────────────────┘
                               │
                               ▼
                     ┌───────────────────┐
                     │  Compact circuits  │
                     │  (via compact-     │
                     │   runtime, or      │
                     │   Midnight Preprod │
                     │   once deployed)   │
                     └───────────────────┘
```

Three workspaces:

- **`contracts/`** — Compact source (`src/`), compiled artifacts once built
  (`managed/`), contract-level tests.
- **`backend/`** — Express REST API, Postgres via Prisma, the proof-service
  bridge to Compact circuits, webhooks, auth, RBAC.
- **`frontend/`** — React/Vite app covering the user wallet, verifier
  dashboard, and consent/verification flow.

## Data flow: a verification, end to end

1. Verifier (via dashboard or REST API) calls
   `POST /api/v1/verification-requests` with the claims it needs.
   Backend writes a `VerificationRequest` row and a Compact
   `VerificationRequest.createRequest` ledger entry (once deployed),
   generates a QR encoding only the opaque request ID.
2. User opens the link/QR → `GET /verification-requests/:id` returns
   non-sensitive request metadata (organization name, requested/optional
   claims, expiry).
3. User reviews the **Disclosure Manifest** (what will/won't be shared)
   and calls `POST /verifications/:id/consent` with the claims they
   approve. The backend rejects any claim not actually requested.
4. User's wallet supplies private witnesses (raw PAN/Aadhaar/DOB + salt)
   directly into `POST /verifications/:id/prove` — held only in that
   request's memory, never persisted. The backend's `proofService`
   delegates to compiled Compact circuit bindings (or, until those are
   compiled in your environment, an explicitly-labeled `LOCAL_CHECK`
   fallback that runs the same predicate logic without ZK — see
   `docs/submission-checklist.md`).
5. Only the resulting booleans (`PAN_VALID: true`, ...) and `proofValid`
   are written to `VerificationResult` and returned to both parties.
   A webhook fires to the verifier's registered endpoint.

## Why a database at all, if Midnight has ledger state?

Compact/Midnight ledger state is the source of truth for **credential
commitments, revocation, and request/claim results** — the things a
relying party or auditor might need to check independently. Postgres holds
everything else an application needs that shouldn't live on a public
ledger: user accounts, organization/RBAC, API keys, webhook config,
audit logs, UI-facing metadata. See `docs/privacy.md` for the exact
boundary between the two.
