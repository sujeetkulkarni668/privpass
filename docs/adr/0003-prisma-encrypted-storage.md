# ADR 0003: Authenticated Field-Level Encryption in Prisma

## Context
When persisting credential templates and issuer verification metadata in PostgreSQL, raw identity claims must remain inaccessible even if the database layer is breached.

## Decision
We implemented field-level authenticated encryption (AES-256-GCM / NaCl SecretBox):
- Plaintext claims are encrypted before database insertion using a cryptographically random initialization vector (IV) per record.
- The master key is supplied via environment configuration (`MASTER_ENCRYPTION_KEY_HEX`) and kept strictly outside the database.
- Integrity tags prevent ciphertext tampering or bit-flipping attacks.

## Consequences
- Protects PII at rest.
- SQL queries cannot directly filter on encrypted attributes, requiring deterministic blind indexing or hash lookups where necessary.
