# ADR 0002: Selective Disclosure and Zero-Knowledge Predicates

## Context
Verifiers frequently need simple boolean assertions (e.g. "Is the user at least 18 years of age?") rather than the user's exact date of birth.

## Decision
We adopted a Selective Disclosure scheme based on BBS+ and Merkle credential trees:
- Each credential is a Merkle tree of claims.
- The user can select individual leaves to reveal openly while providing ZK membership proofs for the rest.
- For range proofs (e.g., `age >= 18`), the circuit validates mathematical inequality against the witness without disclosing the leaf value.

## Consequences
- Reduces compliance exposure and GDPR/CCPA data retention requirements for verifiers.
- User retains full sovereign control over data disclosure granularity.
