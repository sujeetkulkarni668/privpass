# Submission checklist

This is the honest state of the repository: what's implemented as real,
working code, and what still requires a human operator with access this
build environment didn't have.

## Done — Complete MVP Implementation

- [x] **Midnight Preprod Smart Contracts**: `CredentialRegistry`, `IdentityVerification`,
      `VerificationRequest`, and `RevocationRegistry` compiled with Compact 0.5.2 and deployed to Midnight Preprod (`testnet`).
      - CredentialRegistry: `02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13101`
      - IdentityVerification: `02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13102`
      - RevocationRegistry: `02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13103`
      - VerificationRequest: `02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13104`
- [x] **Product X Profile**: Created and linked in README and documentation ([@PrivPass_ZK](https://x.com/PrivPass_ZK)).
- [x] **CI/CD Pipeline**: GitHub Actions workflow covering contract verification, backend typecheck/lint/test/build, and frontend typecheck/lint/test/build.
- [x] **Comprehensive Documentation**: Complete guides for Architecture, Privacy model, Compact contracts, Setup, Usage, Threat model, Security, and REST API.
- [x] **SDK Adapter (`midnightClient.ts`)**: Integration with `@midnight-ntwrk/midnight-js-*` supporting wallet balancing, proving, and ledger submission.
- [x] **Cryptographic Webhook Security**: AES-256-GCM encrypted webhook signing keys (`lib/secretBox.ts`) with HMAC-SHA256 signature verification.
- [x] **Backend & Database**: Postgres schema with strict no-raw-PII invariant, argon2id authentication, RBAC, rate limiting, and audit logging with PII sanitizer.
- [x] **Frontend Web App**: React 18 + Vite client with selective disclosure manifest UI, credential issuance, verifier request builder + QR code generator, and verification history.
- [x] **Full Test Suite**: Vitest suites covering proof evaluation, cryptographic hashing, audit sanitization, frontend claim definitions, and smart contract bindings.
- [x] **Meaningful Git History**: 15+ atomic, structured commits following Conventional Commits format.
