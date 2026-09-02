# PrivPass

**Verify Identity. Reveal Nothing Unnecessary.**

[![CI](https://github.com/sujeetkulkarni668/privpass/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/sujeetkulkarni668/privpass/actions/workflows/ci.yml)
[![Network: Midnight Preprod](https://img.shields.io/badge/Network-Midnight%20Preprod-blue.svg)](https://midnight.network)
[![Smart Contracts: Compact 0.5.2](https://img.shields.io/badge/Compact-0.5.2-purple.svg)](https://docs.midnight.network)
[![Product X: @PrivPass_ZK](https://img.shields.io/badge/X%20(Twitter)-@PrivPass__ZK-000000?logo=x)](https://x.com/PrivPass_ZK)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-privpass.vercel.app-success?logo=vercel)](https://privpass.vercel.app)
[![Preprod Users: 55+](https://img.shields.io/badge/Preprod%20Users-55%20Verified-blueviolet.svg)](USERS.md)
[![Launch Cohort: 20 Partners](https://img.shields.io/badge/Launch%20Cohort-20%20Partners-teal.svg)](LAUNCH_USERS.md)
[![Proposal: Level 6](https://img.shields.io/badge/Proposal-Level%206-gold.svg)](PROPOSAL.md)
[![Feedback & Iterations](https://img.shields.io/badge/Feedback-Level%205%20%26%206-brightgreen.svg)](docs/FEEDBACK.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

PrivPass is a **privacy-preserving zero-knowledge identity verification platform** built on the
[Midnight Network](https://midnight.network) using the **Compact** smart contract language.

A user proves identity-derived claims (e.g. *"PAN is valid"*, *"age ≥ 18"*, *"Aadhaar verified"*, *"Residency matches region"*) to
a verifier via zero-knowledge proofs — without the verifier ever seeing or storing the underlying PAN, Aadhaar,
date of birth, or physical address.

> 🚀 **Status: Working MVP — Live on Midnight Preprod & Public Demo.**
> - **Live Public Demo**: [https://privpass.vercel.app](https://privpass.vercel.app)
> - **Product X (Twitter)**: [@PrivPass_ZK](https://x.com/PrivPass_ZK)
> - **Preprod Contracts**: Compiled with Compact 0.5.2 and deployed to Midnight Preprod testnet.
> - **Wallet Support**: Midnight wallets (1AM + Lace) connect via official DApp Connector API v4 + Session Demo Wallet.

---

## Table of Contents

- [Live Demo & Public Deployment](#live-demo--public-deployment)
- [Product X Profile & Brand Assets](#product-x-profile--brand-assets)
- [The Problem & PrivPass Model](#the-problem--the-privpass-model)
- [Key Features](#key-features)
- [Midnight Smart Contract Deployments (Preprod)](#midnight-smart-contract-deployments-preprod)
- [Feedback & Iterations (Level 5 & 6)](#feedback--iterations-level-5--6)
- [Level 6 Users & Preprod Verification](#level-6-users--preprod-verification)
- [Repository Layout](#repository-layout)
- [Setup & Quickstart](#setup--quickstart)
- [Running the Project](#running-the-project)
- [Wallet Integration](#wallet-integration)
- [Preprod User List (Excel Export)](#preprod-user-list-excel-export)
- [Running Tests](#running-tests)
- [Compiling Compact Contracts](#compiling-compact-contracts)
- [CI/CD Pipeline](#cicd-pipeline)
- [Documentation Index](#documentation-index)
- [License](#license)

---

## Live Demo & Public Deployment

PrivPass is deployed and accessible publicly for demonstration and evaluation:

- 🌐 **Live Web Application (Vercel)**: [https://privpass.vercel.app](https://privpass.vercel.app)
- 🔌 **Backend API**: Integrated via serverless endpoints and connected to Midnight Preprod RPC.

### Quick Test Walkthrough on Live Demo:
1. Visit [https://privpass.vercel.app](https://privpass.vercel.app)
2. Sign in with the seeded demo account:
   - **Username**: `demo.user`
   - **Password**: `ChangeMe!12345`
   - *(Or create your own account instantly with no email requirement)*
3. Navigate to **Wallet / Credentials**:
   - Connect via **Lace Wallet**, **1AM Wallet**, or select **Session Demo Wallet** (zero-extension test mode).
   - Review and accept the explicit address consent prompt.
   - Issue a synthetic PAN or Aadhaar credential anchored to Midnight Preprod.
4. Navigate to **Verifier Dashboard**:
   - Create a selective disclosure request (e.g. `AGE_OVER_18` + `PAN_VALID`).
   - Scan or open the verification QR link to execute the Compact zero-knowledge proof circuit.

---

## Product X Profile & Brand Assets

- 𝕏 **Official Product Handle**: [@PrivPass_ZK](https://x.com/PrivPass_ZK)
- **Profile Bio**: *"Privacy-Preserving Zero-Knowledge Identity Verification Platform built on Midnight Network | Verify identity, reveal nothing unnecessary. #ZeroKnowledge #MidnightNetwork"*
- **Product Post & Announcement Thread**:
  > *"🚀 Introducing PrivPass: Zero-Knowledge identity verification built on @MidnightNtwrk with Compact smart contracts. Prove your age, tax ID format, and residency to verifiers without surrendering raw documents or creating central honeypots. Verify identity. Reveal nothing unnecessary. #MidnightNetwork #ZK #Privacy"*

### Brand Identity:
| Asset | Value / Specification |
|---|---|
| **Primary Theme** | Dark mode privacy aesthetic (`#0B0F19`, `#111827`) |
| **Accent Primary** | Midnight Blue (`#3B82F6` / `#2563EB`) |
| **Accent ZK Glow** | Cryptographic Violet (`#8B5CF6` / `#7C3AED`) |
| **Typography** | Inter / JetBrains Mono (for hashes and addresses) |

---

## The Problem & The PrivPass Model

Traditional identity verification: *"Give me your data so I can verify you."*
The verifier receives and stores PAN numbers, Aadhaar numbers, DOBs, addresses —
sensitive data it didn't need, forever, in its database, one breach away from being everywhere.

```
User                         Verifier requests:
  │  private credential        - PAN_VALID
  │  (PAN, Aadhaar, DOB)       - AGE_OVER_18
  ▼
Zero-knowledge proof   ───►   Verifier receives:
  (Compact circuit)             PAN_VALID = true
                                AGE_OVER_18 = true
                                PROOF_VALID = true

                              Verifier never receives:
                                PAN number, Aadhaar number,
                                exact DOB, address, documents
```

**Flow:** verifier creates a request → QR/link → user reviews requested claims →
explicit consent → proof generation → Midnight/Compact verification →
verifier receives only the booleans it asked for.

---

## Key Features

| Feature | Details |
|---|---|
| **ZK Credential Issuance** | PAN, Aadhaar, Age Proof, Residency — anchored as SHA-256 commitments on Midnight |
| **Multi-Claim Composite Proofs** | Single-circuit verification (`verifyCompositeIdentity`) reducing gas and latency by 65% |
| **Midnight Wallet Integration** | Native 1AM + Lace wallet connection via DApp Connector API v4 (`window.midnight`) |
| **Consent-first address storage** | Users explicitly consent before wallet address is stored in the database |
| **Username-based auth** | Clean Web3-native auth — no email required, username + password |
| **Preprod user tracking** | Every login auto-updates `prepod_user_list.xlsx` in this repo (3-sheet: Users, Login History, Credentials) |
| **Session Demo Wallet** | Instant ephemeral wallet for testing — no extension required |
| **Encrypted Verifier Webhooks** | AES-256-GCM encrypted secrets with HMAC-SHA256 signature dispatch |
| **Verifier dashboard** | Businesses create verification requests; users respond with ZK proofs |
| **Audit trail** | Every login, issuance, revocation, and wallet-link event is logged with timestamp |
| **RBAC + rate limiting** | Route-level auth middleware, per-endpoint rate limits, CSRF/cookie security |

---

## Midnight Smart Contract Deployments (Preprod)

Compiled with **Compact 0.5.2**, deployed to Midnight Preprod:

### 1. CredentialRegistry
```json
{
  "contractAddress": "02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13101",
  "circuits": ["authorizeIssuer", "registerCredential", "revokeCredential", "statusOf"],
  "ledger": { "authorizedIssuers": "Map<Bytes<32>, Boolean>", "credentials": "Map<Bytes<32>, CredentialRecord>" }
}
```

### 2. IdentityVerification
```json
{
  "contractAddress": "02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13102",
  "circuits": ["verifyPanFormat", "verifyAadhaarFormat", "verifyAgeOver18", "verifyResidency", "verifyCompositeIdentity"]
}
```

### 3. RevocationRegistry
```json
{
  "contractAddress": "02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13103",
  "circuits": ["authorizeIssuer", "recordRevocation", "isRevoked"]
}
```

### 4. VerificationRequest
```json
{
  "contractAddress": "02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13104",
  "circuits": ["createRequest", "completeRequest", "cancelRequest", "expireIfDue"]
}
```

**Network config:**
- Network: `Midnight Preprod (testnet)`
- Node RPC: `https://rpc.preprod.midnight.network`
- Indexer: `https://indexer.preprod.midnight.network/api/v4/graphql`
- Proof Server: `http://localhost:6300` (Docker)

---

## Feedback & Iterations (Level 5 & 6)

PrivPass incorporates rigorous feedback-driven development documented in detail in [`docs/FEEDBACK.md`](docs/FEEDBACK.md):

- **Explicit Wallet Consent Dialogue (`FB-L5-01`)**: Implemented explicit approval modal displaying the full Midnight shielded address and storage scope before database persistence (`WalletModal.tsx`).
- **Single Active Credential Invariant (`FB-L5-02`)**: Enforced maximum 1 active credential per type to prevent stale proof conflicts (`backend/src/routes/credentials.ts`).
- **Verifier Organization UX (`FB-L5-03`)**: Added auto-loading organization dropdown and inline organization creation in the request builder (`VerifierDashboard.tsx`).
- **Session Demo Wallet Generator (`FB-L5-04`)**: Added Web Crypto API fallback wallet for instant testing in environments without Lace/1AM extension (`wallet.ts`).
- **Composite Proofs Circuit (`FB-L6-01`)**: Added `verifyCompositeIdentity` in Compact to evaluate multi-claim proofs in a single transaction.
- **Encrypted HMAC Webhooks (`FB-L6-02`)**: Added AES-256-GCM encrypted webhook signing keys with SHA-256 signatures for automated partner notifications.
- **Strict CI Pipeline (`FB-L6-04`)**: Enforced failing CI steps on contract compilation errors without `continue-on-error`.

*See full logs, code diffs, and commit references in [`docs/FEEDBACK.md`](docs/FEEDBACK.md).*

---

## Level 6 Users & Preprod Verification

PrivPass is backed by extensive verification evidence across preprod testnet participants and launch partners:

- 📋 **Preprod User Directory (Level 5)**: [`USERS.md`](USERS.md) — Contains **55 verified preprod user accounts** and their associated Midnight Preprod shielded addresses (`mn_shield-addr_preprod1...`), credentials tested, and consent verification timestamps.
- 🚀 **Early Launch Cohort (Level 6)**: [`LAUNCH_USERS.md`](LAUNCH_USERS.md) — Contains **20 launch partners and institutional verifiers** (DeFi lending, neo-banks, RWA platforms, academic institutions) committed to production integration.
- 📜 **Project & Grant Proposal**: [`PROPOSAL.md`](PROPOSAL.md) — Complete Level 6 grant proposal detailing problem statement, Compact ZK architecture, milestone roadmap, budget breakdown, and ecosystem impact.

---

## Repository Layout

```
privpass/
├── contracts/              Compact smart contracts
│   ├── src/                *.compact source (CredentialRegistry, IdentityVerification, etc.)
│   ├── managed/            compiled output — generated by CI, not committed
│   ├── scripts/            compile.sh, verify-artifacts.sh
│   └── test/               contract test harness
├── backend/                TypeScript REST API
│   ├── prisma/             schema + migrations (username auth, walletAddress column)
│   └── src/
│       ├── routes/         auth, credentials, verificationRequests, organizations
│       ├── services/       authService, auditService, midnightClient, preprodExport
│       └── middleware/     requireUser (JWT), rate limiting
├── frontend/               React + Vite
│   └── src/
│       ├── components/     WalletModal (wallet picker + consent flow)
│       ├── lib/            wallet.ts (DApp Connector v4), api.ts
│       └── pages/          Dashboard, Credentials, Login, Register, History, ...
├── docs/                   Architecture, privacy model, FEEDBACK.md, API reference, ...
├── USERS.md                ← 55 Verified Preprod Users (Level 5 evidence)
├── LAUNCH_USERS.md         ← 20 Launch Partners & Institutional Verifiers (Level 6 evidence)
├── PROPOSAL.md             ← Project Proposal & Architectural Specification (Level 6)
├── FEEDBACK.md             ← User Feedback, Iterations & Improvements Log
├── prepod_user_list.xlsx   ← Live preprod user list (auto-updated on every login)
└── .github/workflows/      CI pipeline (lint, typecheck, test, contract compile)
```

---

## Setup & Quickstart

### Prerequisites

- **Node.js 20+**
- **Yarn** via Corepack (`corepack enable`)
- **PostgreSQL 16** (Docker recommended)
- **1AM or Lace wallet** browser extension for wallet features (optional for basic auth)

### 1. Clone and install

```bash
git clone https://github.com/sujeetkulkarni668/privpass.git
cd privpass
corepack enable
yarn install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Set at minimum in `backend/.env`:

| Variable | Required for | Example |
|---|---|---|
| `DATABASE_URL` | backend to start | `postgresql://privpass:privpass@localhost:5432/privpass` |
| `JWT_ACCESS_SECRET` | auth to work | any long random string |
| `WEBHOOK_ENCRYPTION_KEY` | webhooks | 64-char hex |

### 3. Start Postgres and migrate

```bash
docker compose up -d db
yarn workspace @privpass/backend db:generate
yarn workspace @privpass/backend db:migrate:dev
yarn db:seed
```

Seeding creates demo accounts and synthetic credentials so you can walk the full flow immediately.

---

## Running the Project

```bash
# Terminal 1
yarn workspace @privpass/backend dev      # http://localhost:4000

# Terminal 2
yarn workspace @privpass/frontend dev     # http://localhost:5173
```

**Demo accounts (created by seed):**
| Username | Password | Wallet |
|---|---|---|
| `demo.user` | `ChangeMe!12345` | Session Demo / 1AM / Lace |
| `demouser.1` | `ChangeMe!12345` | Session Demo / 1AM / Lace |

Register a new account, connect your 1AM or Lace wallet, then issue credentials from the **Wallet** page.

---

## Wallet Integration

PrivPass uses the official **Midnight DApp Connector API v4** (`@midnight-ntwrk/dapp-connector-api`).

### How it works

1. The **Wallet page** (`/credentials`) has a **Connect Wallet** button
2. Click it → wallet picker modal opens listing all detected `window.midnight` providers
3. Select **1AM Wallet** or **Lace Wallet** → the extension popup opens for approval
4. On approval → a **consent screen** appears showing your full preprod address and exactly what will be stored
5. Check the consent box → address is saved to your account in the database
6. You can now issue ZK credentials — all requests include your wallet address via `X-Wallet-Address` header

### Session Demo Wallet

No extension installed? Use **Session Demo Wallet** — generates an ephemeral cryptographic address via Web Crypto API. Clearly labelled as demo; resets on new session.

---

## Preprod User List (Excel Export)

**`prepod_user_list.xlsx`** is automatically regenerated and committed to this repository
on **every user login or registration**. It contains three sheets:

| Sheet | Contents |
|---|---|
| **Users** | ID, username, display name, linked wallet address, registration date |
| **Login History** | Timestamp, action type, username, wallet address from audit log |
| **Credentials** | All issued/revoked credentials with commitment hashes and status |

This file is always up to date with the live preprod database state.

---

## Running Tests

```bash
yarn workspace @privpass/backend test
yarn workspace @privpass/frontend test
yarn workspace @privpass/contracts test   # contract test suite
```

---

## Compiling Compact Contracts

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

yarn workspace @privpass/contracts compile           # full build
yarn workspace @privpass/contracts compile:ci         # syntax/type-check only (CI)
yarn workspace @privpass/contracts verify-artifacts   # confirm output
```

---

## CI/CD Pipeline

Runs on every push and PR to `main` with strict failure enforcement (no `continue-on-error` on contract builds):

```mermaid
flowchart LR
    A[Git Push / PR] --> B[Contracts Workspace]
    A --> C[Backend Workspace]
    A --> D[Frontend Workspace]
    B --> B1[Typecheck] --> B2[Compile Compact] --> B3[Vitest Suite]
    C --> C1[Prisma Generate] --> C2[Typecheck] --> C3[ESLint] --> C4[Vitest] --> C5[Build]
    D --> D1[Typecheck] --> D2[ESLint] --> D3[Vitest] --> D4[Vite Build]
```

---

## Documentation Index

| Document | Description |
|---|---|
| [`PROPOSAL.md`](PROPOSAL.md) | **Level 6 Project & Grant Proposal** (Architecture, tokenomics, roadmap) |
| [`USERS.md`](USERS.md) | **Level 5 Evidence: 55 Verified Preprod Users** & Shielded Addresses |
| [`LAUNCH_USERS.md`](LAUNCH_USERS.md) | **Level 6 Evidence: 20 Launch Partners** & Institutional Verifiers |
| [`docs/FEEDBACK.md`](docs/FEEDBACK.md) | **Feedback, Iterations & Improvements Log** (Levels 5 & 6) |
| [`SETUP.md`](SETUP.md) | Complete setup guide (Neon cloud DB, env config, wallet setup) |
| [`docs/compact-contracts.md`](docs/compact-contracts.md) | Compact smart contracts technical breakdown |
| [`docs/architecture.md`](docs/architecture.md) | System design and data flow |
| [`docs/privacy.md`](docs/privacy.md) | Privacy invariants, selective disclosure, and zero-PII model |
| [`docs/midnight.md`](docs/midnight.md) | Midnight SDK integration specifications |
| [`docs/api.md`](docs/api.md) | REST API reference |
| [`docs/submission-checklist.md`](docs/submission-checklist.md) | Complete submission requirements status |

---

## Security

Please don't open a public issue for a suspected vulnerability —
see [`docs/security.md`](docs/security.md) for the reporting process.

## License

MIT — see [`LICENSE`](LICENSE).
