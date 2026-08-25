# PrivPass — Complete Setup Guide

> **Goal:** Get PrivPass fully running locally in under 15 minutes, connected to a free cloud PostgreSQL database that works for everyone who clones this repo.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| Yarn | via Corepack | `corepack enable` |
| Git | any | https://git-scm.com |
| Browser | Chrome recommended | 1AM or Lace wallet extension for Web3 features |

> **No Docker required.** We use a free cloud database (Neon) instead.

---

## Step 1 — Clone the repository

```bash
git clone https://github.com/sujeetkulkarni668/privpass.git
cd privpass
corepack enable
yarn install
```

---

## Step 2 — Create a free cloud PostgreSQL database (Neon)

PrivPass uses **[Neon](https://neon.tech)** — free serverless Postgres, no credit card needed.

### 2a. Sign up and create a project

1. Go to **https://neon.tech** → **Sign Up** (free with GitHub)
2. Click **New Project**
3. Name it: `privpass`
4. Region: choose closest to you
5. Click **Create Project**

### 2b. Copy the connection string

After creation, Neon shows you a connection string:

```
postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
```

Copy it — you'll need it in the next step.

> **Alternative free databases** (if you prefer):
> - **Supabase**: https://supabase.com → New Project → Settings → Database → Connection String
> - **Railway**: https://railway.app → New Project → PostgreSQL → Variables → DATABASE_URL
> - **Local Docker**: `docker compose up -d db` (requires Docker Desktop)

---

## Step 3 — Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in these values:

```env
NODE_ENV=development
PORT=4000

# ← Paste your Neon/Supabase/Railway connection string here
DATABASE_URL=postgresql://USER:PASSWORD@HOST/privpass?sslmode=require

# Generate a secure random value:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=<generate-a-random-64-char-hex>

PUBLIC_APP_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Generate a 32-byte hex key:
WEBHOOK_ENCRYPTION_KEY=<generate-a-random-64-char-hex>

# Midnight Preprod (leave blank for local dev without ZK proofs)
MIDNIGHT_NETWORK_ID=undeployed
MIDNIGHT_INDEXER_URL=
MIDNIGHT_INDEXER_WS_URL=
MIDNIGHT_NODE_URL=
MIDNIGHT_PROOF_SERVER_URL=http://localhost:6300
MIDNIGHT_ZK_CONFIG_PATH=../contracts/managed
MIDNIGHT_WALLET_SEED=
MIDNIGHT_CONTRACT_ADDRESS_CREDENTIAL_REGISTRY=02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13101
MIDNIGHT_CONTRACT_ADDRESS_VERIFICATION_REQUEST=02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13104
MIDNIGHT_CONTRACT_ADDRESS_REVOCATION_REGISTRY=02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13103
MIDNIGHT_ADMIN_SECRET=
MIDNIGHT_ADMIN_SALT=
MIDNIGHT_ISSUER_SECRET=
MIDNIGHT_ISSUER_SALT=
```

### Quick secret generation (run in terminal):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice — once for `JWT_ACCESS_SECRET`, once for `WEBHOOK_ENCRYPTION_KEY`.

---

## Step 4 — Run database migrations

```bash
# Generate the Prisma client
yarn workspace @privpass/backend db:generate

# Run all migrations (creates all tables in your Neon database)
yarn workspace @privpass/backend db:migrate:deploy

# Seed with demo accounts and sample credentials
yarn workspace @privpass/backend db:seed
```

After seeding, your cloud DB will have:
- **2 demo accounts** with sample credentials
- All tables ready: `User`, `Credential`, `RefreshSession`, `AuditLog`, `VerificationRequest`, etc.

### Verify the connection

```bash
# Should print your database URL and confirm connection
yarn workspace @privpass/backend db:studio
```

This opens Prisma Studio at `http://localhost:5555` — a visual DB browser. You should see all tables.

---

## Step 5 — Run the application

Open **two terminals** from the `privpass/` directory:

**Terminal 1 — Backend API:**
```bash
yarn workspace @privpass/backend dev
```
Expected output:
```
PrivPass API listening on :4000
```

**Terminal 2 — Frontend:**
```bash
yarn workspace @privpass/frontend dev
```
Expected output:
```
VITE v5.4.x  ready in ~1000ms
➜  Local: http://localhost:5173/
```

### Verify everything is running

```bash
# Backend health check
curl http://localhost:4000/healthz
# Expected: {"ok":true}
```

Open **http://localhost:5173** in your browser.

---

## Step 6 — First login

**Demo accounts (created by seed):**

| Username | Password | Has credentials |
|---|---|---|
| `demo.user` | `ChangeMe!12345` | PAN (ACTIVE) |
| `demouser.1` | `ChangeMe!12345` | PAN, Aadhaar, Age, Residency (ACTIVE) |

Or **register a new account** at http://localhost:5173/register:
- Username: anything (no email required)
- Display name: your name
- Password: 8+ chars

---

## Step 7 — Connect a Midnight Wallet (for credential issuance)

> **Skip this step** if you just want to explore the UI. Use Session Demo Wallet for testing.

### Option A — Real wallet (1AM or Lace)

1. Install **[1AM Wallet](https://1am.io)** or **[Lace Wallet](https://www.lace.io/)** browser extension
2. Set up your wallet and switch to **Midnight Preprod** network
3. In PrivPass → go to **Wallet** page
4. Click **Connect Wallet** → select your wallet → approve in extension popup
5. **Consent screen** appears showing your preprod address → check the box → **Store Address & Continue**

### Option B — Session Demo Wallet (no extension needed)

1. Go to **Wallet** page
2. Click **Connect Wallet** → select **Session Demo Wallet**
3. An ephemeral address is generated instantly — good for testing the full flow

---

## Step 8 — Issue credentials

Once wallet is connected on the **Wallet** page:

1. Click **+ PAN Card** → credential is issued (ZK commitment stored in DB + on Midnight Preprod)
2. Click **+ Aadhaar**, **+ Age Proof**, **+ Residency** for the others
3. Each active credential shows its SHA-256 commitment hash

> Maximum **1 active credential per type**. Revoke an existing one before re-issuing.

---

## Step 9 — Business verification flow

1. Go to **For businesses** → create a verification request
2. Share the generated link/QR with a user
3. User visits the link → reviews which claims are requested → approves selective disclosure
4. Verifier sees only the boolean result (e.g. `PAN_VALID: true`) — never the raw data

---

## Useful commands

```bash
# Run all tests
yarn workspace @privpass/backend test
yarn workspace @privpass/frontend test

# Lint
yarn workspace @privpass/backend lint
yarn workspace @privpass/frontend lint

# Open Prisma Studio (visual DB browser)
yarn workspace @privpass/backend db:studio

# Reset database (drops all data, re-runs migrations + seed)
yarn workspace @privpass/backend db:reset

# View the live preprod user list Excel file
# Open: prepod_user_list.xlsx in the repo root (updated on every login)
```

---

## Preprod user list (Excel)

The file **`prepod_user_list.xlsx`** in the repository root is auto-generated and pushed to GitHub on every login. It contains:

| Sheet | Contents |
|---|---|
| **Users** | All registered users + wallet address |
| **Login History** | Every login/register/wallet-link event |
| **Credentials** | All issued/revoked credentials with commitment hashes |

---

## Midnight Preprod contract addresses

| Contract | Address |
|---|---|
| CredentialRegistry | `02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13101` |
| IdentityVerification | `02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13102` |
| RevocationRegistry | `02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13103` |
| VerificationRequest | `02008f17e3073062371d648c85525939d0ba7ca9aaf484183992bc7737e13104` |

Network: `Midnight Preprod (testnet)`
Node RPC: `https://rpc.preprod.midnight.network`
Indexer: `https://indexer.preprod.midnight.network/api/v4/graphql`

---

## Troubleshooting

### `DATABASE_URL` connection refused
- Make sure you copied the full Neon connection string including `?sslmode=require`
- Neon free tier pauses after inactivity — wait 10 seconds and retry

### `yarn install` fails
- Run `corepack enable` first
- Make sure Node.js 20+ is installed: `node --version`

### Wallet not detected
- Make sure the extension is installed and **enabled for localhost**
- Open Chrome DevTools → Console — look for `[PrivPass] Midnight wallets detected`
- Hard refresh with `Ctrl+Shift+R` after installing the extension

### Port already in use
```bash
# Kill whatever is on port 4000
npx kill-port 4000
# Kill whatever is on port 5173
npx kill-port 5173
```

### Migration fails on Neon
```bash
# Try deploy instead of dev (no shadow DB required)
yarn workspace @privpass/backend db:migrate:deploy
```

---

## Architecture overview

```
Browser (localhost:5173)
    │  React + Vite
    │  window.midnight → 1AM / Lace wallet
    │
    ▼
Backend API (localhost:4000)
    │  Express + TypeScript
    │  JWT auth (username/password, no email)
    │  X-Wallet-Address header enforcement on /issue
    │
    ▼
PostgreSQL (Neon cloud / local Docker)
    │  Users, Credentials, Sessions, AuditLog
    │  walletAddress column on User
    │
    ▼
Midnight Preprod (testnet)
    │  ZK commitment anchoring
    │  CredentialRegistry + RevocationRegistry contracts
    └  DApp Connector API v4 (wallet ↔ dApp bridge)
```
