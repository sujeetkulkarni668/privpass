# Midnight integration

## What's wired up today

- **Contracts**: `contracts/src/*.compact` — see `docs/compact-contracts.md`
  for what each does and the one open syntax question to verify against
  your installed compiler before deploying.
- **Proof generation/verification**: `backend/src/services/proofService.ts`
  imports compiled circuit bindings from `contracts/managed/IdentityVerification`
  when present, and otherwise runs an explicitly-labeled non-ZK fallback
  (`LOCAL_CHECK`) — never disguised as a real proof — so consent, claim
  results, webhooks, and the audit trail are fully exercisable without a
  live Midnight connection during development.
- **SDK adapter**: `backend/src/services/midnightClient.ts` implements the
  real integration path against the official `@midnight-ntwrk/midnight-js-*`
  packages (provider composition, `deployContract`/`findDeployedContract`,
  `WalletBuilder`, `callTx.<circuit>()`), based on the patterns documented
  at docs.midnight.network's contract-deployment tutorials. `isMidnightConfigured()`
  gates every call site so the app degrades to DB-only (clearly logged)
  until you've actually deployed and configured it — same posture as
  `proofService.ts`'s `LOCAL_CHECK` split.
- **Wired call sites**: `credentials.ts`'s issue/revoke routes call
  `midnightClient.registerCredential`/`revokeCredential` as best-effort
  on-chain anchoring (never blocking on Preprod availability), recording
  the resulting tx hash on the `Credential.onChainRef` column.

## What isn't (and can't be) wired up in this environment, and why

- **No live RPC/indexer connection.** `backend/.env.example` has
  `MIDNIGHT_INDEXER_URL`/`MIDNIGHT_NODE_URL`/`MIDNIGHT_PROOF_SERVER_URL`
  placeholders, intentionally blank. Midnight's endpoints aren't reachable
  from this build environment's network sandbox.
- **No deployed contract addresses**, since deploying needs (a) a real
  `compactc` compile producing `contracts/managed/*` and (b) a funded
  Preprod wallet + RPC access — neither available here.
- **`midnightClient.ts` has never actually executed.** It's built from
  confirmed package/API names, but the exact generic types for
  `DeployedContract`, and exactly how your installed compactc version's
  generated bindings expose their witness-injection shape, are marked
  with inline `TODO`/comment callouts for you to adjust once you compile
  for real.
- **`VerificationRequest.createRequest`/`completeRequest`** are not yet
  called from `verificationRequests.ts`/`verifications.ts` — those routes
  are fully functional against Postgres (the app's actual source of truth
  for request/consent/result state) but don't yet also anchor requests
  on-chain the way credential issuance does. Wiring them in is the same
  `isMidnightConfigured()` + best-effort pattern already used in
  `credentials.ts`; not done yet because doing it correctly requires
  mapping `consent.disclosedClaims` (DB claim-name strings) to the five
  commitment parameters `completeRequest` now expects, which in turn
  requires the witness/salt values the user's wallet holds — that's a
  real design decision about where those values flow from client to
  backend that's worth deciding deliberately rather than guessing.

## Wiring it up for real (once you have `compactc` + Preprod access)

1. Compile: `yarn workspace @privpass/contracts compile` →
   `contracts/managed/{CredentialRegistry,IdentityVerification,VerificationRequest,RevocationRegistry}/`.
   Resolve any syntax mismatches flagged in `docs/compact-contracts.md`.
2. Deploy each contract to Preprod. `midnightClient.ts`'s `buildClient()`
   shows the provider/wallet setup `deployContract`/`findDeployedContract`
   need; write a one-off `contracts/scripts/deploy.ts` that calls
   `deployContract` for each contract and prints the resulting addresses
   (don't hand-write or guess an address).
3. Record the resulting contract addresses, your funded wallet seed, and
   real indexer/node/proof-server URLs in `backend/.env`
   (`MIDNIGHT_CONTRACT_ADDRESS_*`, `MIDNIGHT_WALLET_SEED`,
   `MIDNIGHT_INDEXER_URL`, etc. — see `.env.example`).
4. Set `MIDNIGHT_ISSUER_SECRET`/`_SALT` and `MIDNIGHT_ADMIN_SECRET`/`_SALT`
   to real high-entropy values, then call `initializeAdmin` and
   `authorizeIssuer` once (a one-off script, not an HTTP route — these
   are bootstrap operations) before any `registerCredential` call will
   succeed.
5. Fix the `DeployedContract`/binding-shape TODOs in `midnightClient.ts`
   against your actual generated types.
6. Wire `verificationRequests.ts`/`verifications.ts` to
   `midnightClient.createVerificationRequest`/`completeVerificationRequest`,
   deciding how witness values reach the backend for the `prove` step
   (directly from the wallet UI, ideally never touching your server logs —
   see the redaction list in `server.ts`).

## Why this split is safe to ship incrementally

The commitment scheme, consent gating, and claim-result shape are already
identical to what the real Compact path produces — turning on
`isMidnightConfigured()` swaps DB-only bookkeeping for genuine
Preprod-anchored state without a redesign of the data model or API
surface.
