# Usage

## End-to-end walkthrough (local dev)

1. **As a verifier**: sign in with the seeded demo account, go to
   `/verifier/requests/create`, paste the demo organization ID, choose
   `PAN_VALID` + `AGE_OVER_18` as required claims, and generate a request.
   You'll get a QR code and a `verifyUrl`.
2. **As the user**: open the `verifyUrl` (same browser is fine for local
   testing). You'll see the Disclosure Manifest — exactly what will and
   won't be shared — before anything happens.
3. Click **Approve and generate proof**. In this build, that calls
   `POST /verifications/:id/consent` then `POST /verifications/:id/prove`;
   the latter runs through `proofService.ts`'s `LOCAL_CHECK` fallback
   (see `docs/submission-checklist.md` for why) and returns
   `{ PAN_VALID: true, AGE_OVER_18: true }`.
4. **Back as the verifier**: `GET /api/v1/verifications/:id` (or the
   webhook, if you registered one) shows the same booleans — nothing else.

## Issuing a credential
From `/credentials`, click "Issue PAN credential" (or AADHAAR/AGE/
RESIDENCY). This calls the `SyntheticIdentityProvider`, computes a
commitment, and stores only that commitment — the demo watermark is shown
in the UI.

## Revoking a credential
From `/credentials`, click "Revoke" on any active credential. Any
in-flight or future verification against it will now fail the relevant
claim (`proofService.ts` checks `status === "ACTIVE"`).

## Organization management
Create an organization via `POST /organizations` (session auth). The
creator becomes `OWNER`. Invite teammates with
`POST /organizations/:orgId/members` (requires `ADMIN`+; only an `OWNER`
can grant `OWNER`).

## API keys & webhooks
Both managed under `/organizations/:orgId/api-keys` and
`/organizations/:orgId/webhooks` — see `docs/api.md` for full request/response
shapes.
