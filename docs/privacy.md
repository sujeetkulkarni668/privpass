# Privacy model

## The invariant

Nothing in this system — database, ledger, logs, API responses, QR codes,
URLs — ever stores or transmits a raw Aadhaar number, PAN number, exact
date of birth, full address, or identity document image, except transiently
in-memory during proof generation, supplied directly by the caller's
wallet for that single request.

## Commitments

A credential is represented everywhere (Postgres `credentials.commitment`,
Compact `CredentialRegistry.credentials` map key) as:

```
commitment = hash(privateValue, salt)
```

`salt` is generated client-side (or by the identity-provider adapter
during synthetic issuance in this build) and is never persisted
server-side — it's returned once, for the wallet to store. Without the
salt, the commitment cannot be reversed to recover the private value by
anyone who only has database or ledger access.

> **Implementation note:** this repository's `computeCommitment()` uses
> SHA-256 as a stand-in. The Compact circuits (`IdentityVerification.compact`)
> use `persistentHash`, the Compact-native primitive intended for this —
> the two need to be reconciled to the same scheme before this goes to
> Preprod. See `docs/compact-contracts.md`.

## What's public vs. private, precisely

| Data | Where it lives | Public? |
|---|---|---|
| Commitment (hash) | Postgres + Compact ledger | Yes — reveals nothing about the preimage |
| Credential type, issuer, status, expiry | Postgres + Compact ledger | Yes |
| Raw PAN / Aadhaar / DOB / address | Nowhere persisted; transient witness input only | Never |
| Salt | Returned once to the wallet; not persisted server-side | Private to the user |
| Claim boolean results (`AGE_OVER_18: true`) | Postgres `VerificationResult`, Compact ledger | Yes, but only to the requesting verifier and the user, and only for claims explicitly consented |
| Consent record (which claims, when) | Postgres `Consent` | Visible to the user and the relevant verifier; not to other verifiers |

## Selective disclosure, enforced server-side

`POST /verifications/:id/consent` validates that every claim the user
approves was actually part of the request's `requestedClaims` or
`optionalClaims` — a verifier can never end up with a claim result it
didn't ask for, and a user can't be tricked into approving more than the
request stated, because the server is the one checking, not just the UI.

## Logs and audit trail

`auditService.writeAuditLog()` strips a deny-list of metadata keys
(`pan`, `aadhaar`, `dob`, `address`, `documentImage`, and variants) before
any write, as defense-in-depth against a future call site accidentally
passing identity data into `metadata`. See
`backend/src/__tests__/auditService.test.ts`.

## Known gap in this build

The `LOCAL_CHECK` proof fallback (see `docs/submission-checklist.md`)
receives raw witness values over the backend's HTTP request body rather
than keeping them purely client-side in an in-browser prover, because this
build doesn't yet have compiled Compact circuits wired into the frontend.
This is explicitly **not** how the production flow should work: witnesses
should be consumed by a **client-side or wallet-side** prover, with only
the resulting proof (not the raw values) ever reaching a server. This is
called out in `proofService.ts`'s comments and must be corrected before
any real PII flows through this build.
