# Local setup

## Prerequisites
- Node.js 20+
- Yarn (via Corepack)
- Docker (for Postgres) — or a local Postgres 16 instance

## Steps

```bash
git clone <your-repo-url>
cd privpass
corepack enable
yarn install

cp backend/.env.example backend/.env
# edit backend/.env — at minimum set JWT_ACCESS_SECRET to a long random
# value and WEBHOOK_ENCRYPTION_KEY (32-byte hex — generate with
# `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

docker compose up -d db
yarn workspace @privpass/backend db:generate
yarn workspace @privpass/backend db:migrate:dev
yarn db:seed

yarn dev:backend    # http://localhost:4000
yarn dev:frontend   # http://localhost:5173 (proxies /api to :4000)
```

## Seeded demo account
- Email: `demo.user@example.com`
- Password: `ChangeMe!12345`
- One synthetic PAN credential pre-issued, watermarked
  "DEMO CREDENTIAL — NOT A REAL GOVERNMENT ID"
- Demo organization: "ABC Finance (Demo)" — its ID is printed by
  `db:seed`'s output / queryable via `yarn workspace @privpass/backend prisma studio`

## Running tests

```bash
yarn workspace @privpass/backend test
yarn workspace @privpass/frontend test
yarn workspace @privpass/contracts test   # self-skips until compiled, see docs/compact-contracts.md
```

## Compiling Compact contracts (optional, requires real toolchain)
See `docs/compact-contracts.md` and `docs/submission-checklist.md`.
