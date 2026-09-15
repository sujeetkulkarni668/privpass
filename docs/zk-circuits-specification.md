# Zero-Knowledge Circuit Specification

## 1. Overview

PrivPass zk-SNARK circuits are compiled with the Midnight Compact framework using BLS12-381 elliptic curve pairings.

```
+-------------------------------------------------------------+
|                      User Wallet                            |
|  Private Inputs: [Private Key, Credential Leaves, Nonce]    |
+------------------------------+------------------------------+
                               |
                               v
                     [zk-SNARK Prover]
                               |
                               v (Proof + Public Inputs)
+-------------------------------------------------------------+
|                   Midnight Network                          |
|  Public Ledger: [Merkle Root, Nullifier, Public Predicates] |
|  Compact Circuit: [Verification Engine]                     |
+-------------------------------------------------------------+
```

---

## 2. Mathematical Definition

### 2.1 Merkle Commitment
Given a credential consisting of $k$ attribute claims $\{a_1, a_2, \dots, a_k\}$ and a secret salt $s$:

$$\text{Leaf}_i = \mathcal{H}_{\text{poseidon}}(a_i, s_i)$$

$$\text{Root} = \mathcal{M}(\text{Leaf}_1, \text{Leaf}_2, \dots, \text{Leaf}_k)$$

### 2.2 Nullifier Generation
To prevent double-verification or Sybil attacks without linking user transactions:

$$\text{Nullifier} = \mathcal{H}_{\text{poseidon}}(\text{PrivateKey}_{\text{holder}}, \text{ScopeId}, \text{Nonce})$$

### 2.3 Predicate Circuits
1. **Range Proof**:
   $$\text{Assert}(a_{\text{age}} \ge 18)$$
2. **Set Membership**:
   $$\text{Assert}(a_{\text{country}} \in \{\text{"US"}, \text{"EU"}, \text{"IN"}\})$$
3. **Issuer Signature Validity**:
   $$\text{Assert}(\mathcal{V}_{\text{ECDSA}}(\text{PubKey}_{\text{issuer}}, \text{Root}, \sigma_{\text{issuer}}) = 1)$$

---

## 3. Circuit Constraints & Gas Profiling

| Circuit Name | Constraints | Proving Time (Browser WASM) | Verification Gas |
| :--- | :--- | :--- | :--- |
| `CredentialRegistry.compact` | ~12,400 | ~1.4s | 42,000 |
| `IdentityVerification.compact` | ~18,200 | ~2.1s | 58,000 |
| `RevocationRegistry.compact` | ~8,100 | ~0.8s | 31,000 |
| `BatchVerification.compact` | ~34,500 | ~3.8s | 94,000 |
