# Security Policy & Vulnerability Disclosure

PrivPass takes the security and privacy of zero-knowledge credentials, encrypted cryptographic commitments, and user privacy extremely seriously.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Cryptographic Security Architecture

PrivPass utilizes a multi-layered cryptographic model:

1. **Zero-Knowledge Proofs (Midnight Compact)**:
   - Proving system: BLS12-381 elliptic curve zk-SNARKs.
   - Private inputs (dates of birth, national identifiers, cryptographic salts) never leave the prover runtime or user browser.
   - On-chain verification enforces Merkle path validity and nullifier non-reuse.

2. **At-Rest Field Encryption**:
   - Sensitive credential records in PostgreSQL/Prisma are encrypted using Authenticated Encryption with Associated Data (AEAD - AES-256-GCM / NaCl SecretBox).
   - Unique Nonces / IVs per record ensure no ciphertext frequency leakage.

3. **In-Flight Transport Security**:
   - Strict TLS 1.3 encryption.
   - Content Security Policy (CSP) headers restricting execution vectors.
   - Ephemeral session keys with strict cookie attributes (`SameSite=Lax; Secure; HttpOnly`).

---

## Reporting a Vulnerability

If you discover a security vulnerability within PrivPass or its Midnight smart contracts:

1. **Do NOT open a public GitHub issue.**
2. Send an email to `security@privpass.id` or contact the core team directly via encrypted communication.
3. Include the following in your report:
   - Description of the vulnerability.
   - Step-by-step reproduction steps or proof-of-concept (PoC).
   - Impact assessment (e.g. proof forgery, identity deanonymization, double spending of nullifiers).
   - Proposed remediation (if available).

### Response Timelines

- **Initial Acknowledgement**: Within 24 hours.
- **Triage & Validation**: Within 48 hours.
- **Fix & Disclosure**: Coordinated disclosure within 14 days of patch deployment.
