# REST API reference

Base URL (external, API-key auth): `/api/v1`
Base URL (dashboard/session auth): `/` (e.g. `/credentials`, `/organizations`)

Authenticate external calls with `Authorization: Bearer pp_live_...`.

## `POST /api/v1/verification-requests`
Create a request.

```json
// request
{
  "organizationId": "org-uuid",
  "requestedClaims": ["PAN_VALID", "AGE_OVER_18"],
  "optionalClaims": ["IDENTITY_VERIFIED"],
  "expiresInMinutes": 60
}
```
```json
// response 201
{
  "id": "req-uuid",
  "verifyUrl": "https://app.privpass.example/verify/req-uuid",
  "qrDataUrl": "data:image/png;base64,...",
  "requestedClaims": ["PAN_VALID", "AGE_OVER_18"],
  "optionalClaims": ["IDENTITY_VERIFIED"],
  "expiresAt": "2026-08-21T18:00:00.000Z",
  "status": "PENDING"
}
```

## `GET /api/v1/verification-requests/:id`
Public-safe status read — no auth required (the ID itself is the
capability); returns organization name, claims, status, expiry only.

## `POST /api/v1/verification-requests/:id/cancel`
Requires `DEVELOPER` role or above in the owning organization.

## `GET /api/v1/verifications/:id`
Returns the result once completed: `{ status, claimResults, proofValid, verifiedAt }`.

## `GET /api/v1/credentials/:id/status`
Returns only `{ status, claimResults }` for the most recent verification
result scoped to the calling organization — never any credential detail
beyond that.

## Errors
Standard shape: `{ "error": "machine_readable_code", "details": { ... } }`.
Common codes: `invalid_input`, `not_found`, `insufficient_role`,
`request_expired`, `claim_not_requested`, `invalid_api_key`.

## Rate limits
120 requests/minute per API key on `/api/v1/*`; `429` with standard
`RateLimit-*` headers when exceeded.

## Webhooks
Subscribe via `POST /organizations/:orgId/webhooks` (session auth,
`ADMIN`+). Payloads are signed:

```
PrivPass-Signature: <hex hmac-sha256 of the raw JSON body, using your webhook secret>
PrivPass-Event: VERIFICATION_VERIFIED
```

Event types: `VERIFICATION_CREATED`, `VERIFICATION_PENDING`,
`VERIFICATION_VERIFIED`, `VERIFICATION_FAILED`, `VERIFICATION_EXPIRED`,
`CREDENTIAL_REVOKED`, `CREDENTIAL_EXPIRED`. Delivery retries up to 5 times
with exponential backoff; history via
`GET /organizations/:orgId/webhooks/:id/deliveries`.

## OpenAPI
A generated OpenAPI document isn't checked into this build. Generate one
from the zod schemas in `backend/src/routes/*` (e.g. with
`zod-to-openapi`) as a follow-up — the schemas already describe every
request shape above.
