# ADR 0001: Midnight Compact Smart Contracts for Zero-Knowledge Proofs

## Context
Decentralized identity verification requires users to prove eligibility (such as age, residency, or accreditation) without exposing raw PII to verifiers or recording personal identity information on an immutable public ledger.

## Decision
We chose Midnight Compact smart contracts with zk-SNARKs over traditional EVM-based zero-knowledge rollups for the following reasons:
1. **Native Privacy-First DSL**: Compact is purpose-built for expressing dual ledger states (private witnesses and public state) cleanly without boilerplate circuit wiring.
2. **Deterministic Cryptographic Guarantees**: Native Merkle membership proofs and deterministic nullifier schemes prevent credential replay attacks.
3. **Shielded Account Model**: Midnight native shielded addresses ensure verifier and prover identities remain anonymous.

## Consequences
- Requires Midnight Compact compiler (`compactc`) for artifact generation.
- Client applications must interface with Midnight dApp Connector API v4.
