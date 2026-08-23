# Deployment

## Backend
Any Node 20 host works (Fly.io, Railway, Render, a plain VM). Build with
`yarn workspace @privpass/backend build`, run `node backend/dist/server.js`.
Provision a managed Postgres instance and set `DATABASE_URL`, run
`yarn workspace @privpass/backend db:migrate` (uses `prisma migrate deploy`,
safe for production) before first boot.

Required env vars: see `backend/.env.example`. At minimum for a real
deployment, also set:
- `NODE_ENV=production`
- `JWT_ACCESS_SECRET` — long random value, different from dev
- `PUBLIC_APP_URL` — your deployed frontend origin (used to build verify links)
- `CORS_ALLOWED_ORIGINS` — your deployed frontend origin

## Frontend
Static build via `yarn workspace @privpass/frontend build` → `frontend/dist/`.
Deploy to any static host (Vercel, Netlify, Cloudflare Pages, S3+CDN).

**Path prefix — read this before deploying, it's a real bug that was just
fixed in dev and will resurface in prod if missed:** the backend mounts
its internal routes at bare paths (`/auth`, `/credentials`,
`/organizations`, `/verification-requests`, `/verifications`, `/admin`) —
`/api/v1` is the only thing actually mounted under `/api` (that's the
external, API-key-authenticated REST API for verifier integrations, not
what the frontend calls). The frontend's `lib/api.ts` prefixes all of its
own calls with `/api` for a clean same-origin namespace, so whatever
serves the frontend and proxies to the backend **must strip that `/api`
prefix** before forwarding — exactly what `vite.config.ts`'s dev proxy
now does (`rewrite: (path) => path.replace(/^\/api/, "")`). In production,
either:
- configure your reverse proxy (nginx, a platform's path-rewrite rule,
  etc.) to do the same strip for everything under `/api` *except*
  `/api/v1`, or
- change `frontend/src/lib/api.ts`'s `BASE` constant to match whatever
  prefix (if any) your production routing actually forwards unmodified.

Don't skip this and assume "it matches the dev setup" — verify it by
actually hitting `/auth/register` (or any frontend action) after
deploying, the same way the dev-proxy mismatch above wasn't caught until
someone tried to sign up.

## Midnight Preprod
Not automatable from this doc in the abstract — see `docs/midnight.md` for
the exact prerequisites (compiled contracts, funded Preprod wallet, RPC
access) and what needs to change in `proofService.ts` and the credential
routes once you have them. Once deployed, record contract addresses in
`backend/.env`.

## CI/CD
`.github/workflows/ci.yml` runs lint/typecheck/test/build for backend and
frontend. The `contracts` job installs the official Compact toolchain
(`compact-installer.sh`) on the runner, then runs a real compile — it is
**not** allowed to skip or warn-and-continue if the toolchain or the
compile step fails; a failed/missing compile fails the build. For fast PR
feedback that job compiles with `CONTRACTS_SKIP_ZK=1` (syntax/type-check
only, no proving keys — see `contracts/scripts/compile.sh`); it then runs
`verify-artifacts` to confirm real output landed in `contracts/managed/`
before running contract tests. Before any Preprod deployment, run a full,
non-skip-zk `yarn workspace @privpass/contracts compile` locally or in a
dedicated release job — skip-zk output is not deployable. Add a deploy job
(e.g. `railway up`, `flyctl deploy`, a Vercel GitHub integration) once
you've picked hosts.

## Post-deploy checklist
- [ ] Rotate `JWT_ACCESS_SECRET` away from any dev value
- [ ] Confirm cookies are `secure` (requires HTTPS)
- [ ] Confirm `CORS_ALLOWED_ORIGINS` doesn't include `localhost`
- [ ] Move `WEBHOOK_ENCRYPTION_KEY` from a plain env var to a real
      KMS/HSM-backed unwrap (see `docs/security.md`) — the encryption
      itself (AES-256-GCM, `lib/secretBox.ts`) is real, this is about key
      custody, not the crypto
- [ ] Fill in the README's Live Demo / Contract Address / CI badge once real
