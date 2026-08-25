-- Migration: Replace email-based authentication with username-based authentication.
-- Rationale: PrivPass is a Web3 application. Account identity is username+password.
-- Wallet (Lace/1AM) is a separate, optional layer required only for document issuance.

-- Step 1: add username column (nullable initially so we can backfill)
ALTER TABLE "users" ADD COLUMN "username" TEXT;

-- Step 2: backfill username from existing email data (use the local-part before @)
-- For any existing rows (e.g. seed data). Safe for fresh installs with 0 rows.
UPDATE "users" SET "username" = SPLIT_PART("email", '@', 1) WHERE "username" IS NULL AND "email" IS NOT NULL;

-- Step 3: handle edge case — if email column doesn't exist yet (fresh install), set username = id prefix
UPDATE "users" SET "username" = CONCAT('user_', SUBSTRING("id", 1, 8)) WHERE "username" IS NULL;

-- Step 4: make username NOT NULL
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;

-- Step 5: add unique index on username
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- Step 6: add optional walletAddress column (for audit — not required for login)
ALTER TABLE "users" ADD COLUMN "walletAddress" TEXT;

-- Step 7: drop email-related columns
DROP INDEX IF EXISTS "users_email_key";
ALTER TABLE "users" DROP COLUMN IF EXISTS "email";
ALTER TABLE "users" DROP COLUMN IF EXISTS "emailVerifiedAt";
