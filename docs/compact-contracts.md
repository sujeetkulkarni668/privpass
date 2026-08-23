# Compact contracts

Four contracts in `contracts/src/`:

## `CredentialRegistry.compact`
Ledger: `credentials: Map<Bytes<32>, CredentialRecord>` keyed by commitment,
plus an admin/issuer-authorization layer: `adminId`/`adminInitialized`
(single-value cells) and `authorizedIssuers: Map<Bytes<32>, Boolean>`.

Circuits:
- `initializeAdmin` — one-time bootstrap of the admin identity.
- `authorizeIssuer` / `deauthorizeIssuer` — admin-only allowlist management.
- `registerCredential` — now requires the caller to prove (via witness
  secret/salt) that they *are* the stated, authorized issuer. Previously
  this had no authorization check at all — anyone could register a
  credential under any issuer identity.
- `revokeCredential` — only the original issuer (proven the same way) can
  revoke. `adminRevokeCredential` is a separate admin-only escape hatch
  for compromised-issuer-key scenarios.
- `statusOf`, `isAuthorizedIssuer` — read-only queries.

Authorization uses hash-based identity commitments
(`persistentHash(secret, salt)`), not `ownPublicKey()` — Midnight's own
smart-contract-security guidance is explicit that `ownPublicKey()` is a
witness value, not a verified signer, and must not be used alone for
access control.

## `IdentityVerification.compact`
Unchanged from the original design. The claim circuits —
`proveAgeOver18`, `provePanValid`, `proveAadhaarVerified`,
`proveResidencyValid`, `proveIdentityVerified` (composite) — each take a
private `witness` (raw value + salt), recompute the commitment, assert it
matches the registered credential, evaluate the claim predicate, and
return only a `Boolean`. Format validators run inside the circuit against
the witness, so the format itself is never exposed.

## `VerificationRequest.compact` — redesigned
Ledger: `requests: Map<Bytes<32>, RequestRecord>` and
`results: Map<Bytes<32>, ClaimResults>`, both keyed by an opaque
`requestId`.

**What changed and why:** the previous version's `completeRequest`
accepted a caller-supplied `Vector<8, ClaimResult>` of plain booleans —
there was no cryptographic link between those booleans and an actual
proof. Any caller could submit `true` for every claim without ever
satisfying `IdentityVerification`'s circuits or holding a valid
credential. It now:
- Replaces the dynamic `Vector<8, ClaimType>` request shape with five
  explicit boolean flags (`panRequested`, `aadhaarRequested`,
  `ageRequested`, `residencyRequested`, `identityRequested`) — `ClaimType`
  has exactly 5 variants, so this is a complete, statically-sized
  encoding that avoids needing in-circuit vector construction (a
  capability this codebase has not confirmed against the installed
  compiler).
- `completeRequest` composes directly into `IdentityVerification`'s prove
  circuits and cross-checks `CredentialRegistry.statusOf` for each
  requested claim, so a result can only be `true` if a real
  witness-satisfying proof was produced against a currently-ACTIVE
  credential.
- `cancelRequest` is now requester-only, proven via the same hash-commitment
  pattern (`requesterSecret`/`requesterSalt`).

Circuits: `createRequest`, `cancelRequest`, `completeRequest`,
`expireIfDue`, plus the internal `statusActive` helper.

## `RevocationRegistry.compact`
A minimal, separate revocation set (`Map<Bytes<32>, RevocationEntry>`) so
relying parties can do a single cheap membership check without pulling
full credential metadata. `recordRevocation` previously had no
authorization check either (anyone could revoke anyone's credential); it
now requires the caller to be an issuer authorized in
`CredentialRegistry` (imported and queried via `Registry_isAuthorizedIssuer`).

## Cross-module composition — the one open question before compiling

`VerificationRequest.compact` and `RevocationRegistry.compact` both import
`CredentialRegistry.compact` (and `IdentityVerification.compact`) via:

```
import "./CredentialRegistry.compact" prefix Registry_;
```

This form, and the resulting flat-named calls (e.g. `Registry_statusOf(...)`),
is based on the one confirmed real Compact example available while writing
this — OpenZeppelin's `compact-contracts` library, which imports
Ownable/Pausable/FungibleToken this way. That's documented as **library-style
composition**: the imported circuits/ledgers get compiled into the
*importing* contract's own deployment, not called across two
independently-deployed contract instances. That's very likely what you
want for PrivPass's design intent, but **confirm before deploying**:

1. Does your installed `compactc`/`compact` CLI version support `prefix`
   imports the way described above?
2. Do exported enums (e.g. `CredentialStatus`) get the same prefix as
   exported circuits (used here as `Registry_CredentialStatus.ACTIVE`)?
3. If `CredentialRegistry` is *also* deployed standalone (so verifiers can
   register/revoke credentials directly against it), does importing it
   into `VerificationRequest` double-compile conflicting ledger state, or
   is that the intended way to let one contract read another's state?

If your installed version instead requires true cross-contract calls to a
separately-deployed instance (e.g. via a `ContractAddress`/`Contract<T>`
reference type), the `Registry_*`/`Identity_*` call sites need to be
adapted to that mechanism — the authorization and proof-verification
*logic* in this repo doesn't change either way, only the call syntax would.

## Toolchain status — read before compiling

These sources were written against the Compact language surface as
documented for `compact-runtime` ~0.16–0.19 (circuits, witnesses, public
ledger cells/maps, `Bytes`/`Uint`/`Field` primitives, `assert`,
`persistentHash`) plus the real, confirmed OpenZeppelin `compact-contracts`
example for import syntax. **They have not been run through the actual
`compactc` compiler** — that binary isn't reachable from the sandbox this
repo was built in (see `docs/submission-checklist.md`). Before deploying:

1. Install the real Compact toolchain:
   `curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh`
2. Run `yarn workspace @privpass/contracts compile` (full build, not the
   `compile:ci` / `CONTRACTS_SKIP_ZK=1` fast path CI uses for PR checks —
   skip-zk output has no proving keys and isn't deployable).
3. Fix any syntax mismatches the real compiler flags — see "Cross-module
   composition" above for the most likely spot, and the `Cell<...>`
   `.read()`/`.write()` note in `CredentialRegistry.compact` for the
   second most likely spot.
4. Run `contracts/test/credentialRegistry.test.ts` (and add equivalents
   for the other three contracts) against the real generated bindings —
   it currently self-skips because `managed/` is empty, and its
   `withWitnesses(...)` helper is a placeholder for whatever shape your
   compiler's generated bindings actually use for witness injection.

## Design choices worth knowing about

- **Hash-based authorization**, never `ownPublicKey()`, for every
  privileged circuit (issuer registration/revocation, admin actions,
  request cancellation) — see `CredentialRegistry.compact`'s header
  comment for the reasoning and the official-docs citation.
- **Fixed, enumerated claim slots** rather than dynamic vectors in
  `VerificationRequest.compact`, for the reasons above.
- **Separate revocation registry** instead of only a status field on
  `CredentialRegistry`, so a verifier-side circuit that only cares about
  revocation doesn't need to pull the rest of the credential record.
- **No on-chain PII, ever** — every struct above holds only commitments,
  enums, timestamps, and booleans.
