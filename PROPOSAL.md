# PrivPass — Project Proposal & Architectural Specification (Level 6)

**Privacy-Preserving Zero-Knowledge Identity Verification Platform on Midnight Network**

*“Verify Identity. Reveal Nothing Unnecessary.”*

---

## 1. Executive Summary

PrivPass is a next-generation decentralized identity verification infrastructure built natively on the **Midnight Network** utilizing the **Compact** smart contract language. Traditional identity verification (KYC/AML) forces users to surrender sensitive plaintext documents (PAN, Aadhaar, SSN, Passports, utility bills) to centralized servers. This creates massive data honeypots, exposing institutions to multi-million-dollar data breaches and violating user privacy under global privacy regulations such as GDPR, CCPA, and India's DPDP Act.

PrivPass resolves this structural vulnerability by decoupling **proof of attributes** from the **exposure of raw data**. Built with zero-knowledge circuits compiled to Midnight's private ledger, PrivPass enables individuals to mathematically prove claims (such as *"Age ≥ 18"*, *"PAN is valid"*, *"Residency matches region"*, or *"Accredited investor status"*) to any verifier with zero leakage of underlying PII.

---

## 2. Problem Statement & Market Opportunity

### 2.1 The Vulnerability of Centralized KYC
- **Honeypot Architecture**: Centralized databases hold plaintext biometric and tax identifiers, leading to identity theft and database leaks.
- **Over-Disclosure**: Verifying simple eligibility (e.g. buying age-restricted items or signing a fintech contract) forces disclosure of full name, birth date, parentage, and physical address.
- **Regulatory Burden**: Enterprises face severe compliance penalties under GDPR Article 5 (Data Minimization) and DPDP 2023 when holding unnecessary customer documents.
- **Web3 Pseudonymity Paradox**: DeFi and RWA protocols need Sybil resistance and compliance without de-anonymizing their user base on transparent blockchains.

### 2.2 The Midnight + Compact Advantage
Midnight is uniquely designed for data protection with a hybrid public/private ledger architecture. Using **Compact 0.5.2**, PrivPass constructs Zero-Knowledge Circuits where:
- Private states (salt, hash pre-images, document numbers) remain strictly client-side.
- Public states (commitments, revocation status, authorization maps) reside on the Midnight ledger.
- Verifiers receive cryptographically attested booleans guaranteed by Midnight consensus.

---

## 3. System Architecture & Core Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER / WALLET                         │
│  ┌───────────────────────┐             ┌─────────────────────────────┐  │
│  │ Private Credentials   │             │ Midnight DApp Connector v4  │  │
│  │ (PAN, Aadhaar, DOB)   │             │ (Lace / 1AM Wallet)         │  │
│  └──────────┬────────────┘             └──────────────┬──────────────┘  │
│             │                                         │                 │
│             ▼                                         ▼                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Compact ZK Prover Engine (Client-side circuit witness execution)  │  │
│  │ Output: ZK Proof π, Public Commitment Hash C, Selective Booleans  │  │
│  └──────────────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────────────┼───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MIDNIGHT PREPROD LEDGER                         │
│  ┌─────────────────────────┐             ┌───────────────────────────┐  │
│  │ CredentialRegistry      │             │ IdentityVerification      │  │
│  │ (Commitment Anchoring)  │             │ (ZK Circuit Verification) │  │
│  └──────────┬──────────────┘             └─────────────┬─────────────┘  │
│             │                                          │                │
│  ┌──────────▼──────────────┐             ┌─────────────▼─────────────┐  │
│  │ RevocationRegistry      │             │ VerificationRequest       │  │
│  │ (Merkle / Nullifier Tree│             │ (Lifecycle & Expiration)  │  │
│  └─────────────────────────┘             └───────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      VERIFIER PLATFORM / BACKEND                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Node.js / Express + Argon2id + AES-256-GCM Encrypted Webhooks      │  │
│  │ Result: { verified: true, claims: { AGE_OVER_18: true } }          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Smart Contracts (Compact 0.5.2)
1. **`CredentialRegistry.compact`**: Anchors credential commitment hashes (`sha256(data || salt)`) issued by authorized identity providers without revealing content.
2. **`IdentityVerification.compact`**: Implements circuits for format validity, age boundary assertions, residency proofs, and multi-claim composite verifications.
3. **`RevocationRegistry.compact`**: Provides instant on-chain revocation checks using non-membership proofs and revocable issuer keys.
4. **`VerificationRequest.compact`**: Manages verifier request manifests, TTL timeouts, and selective disclosure response binding.

### 3.2 Security Invariant: Zero Raw-PII Storage
The PrivPass backend and database enforce a strict mathematical invariant: **No raw identity string (PAN, Aadhaar, Passport, DOB) is ever stored or logged**. All inputs are transformed via client-side salted hashing and ephemeral witness injection before proof dispatch.

---

## 4. Milestone Roadmap & Deliverables

| Phase | Milestone | Deliverables & Scope | Status |
|---|---|---|---|
| **Phase 1** | **Core Protocol & Smart Contracts** | Compact 0.5.2 contracts (`CredentialRegistry`, `IdentityVerification`, `RevocationRegistry`, `VerificationRequest`), local testing harness, multi-job CI pipeline. | **Completed** |
| **Phase 2** | **Preprod Deployment & DApp Connector** | Deployment to Midnight Preprod, integration with Midnight DApp Connector API v4 (Lace & 1AM), 50+ preprod verified user cohort (`USERS.md`). | **Completed** |
| **Phase 3** | **Selective Disclosure & Verifier Suite** | Dynamic QR builder, Verifier Webhooks with AES-256-GCM signing, multi-claim composite proof circuit, 20 launch partner cohort (`LAUNCH_USERS.md`). | **Completed** |
| **Phase 4** | **SDK & Developer Tooling** | `@privpass/sdk` npm package for React/Node.js verifiers, drop-in verification modal component, automated OpenAPI specifications. | **In Progress** |
| **Phase 5** | **Mainnet Audit & Formal Verification** | Third-party cryptographic audit of Compact circuits, Midnight Mainnet deployment, decentralized issuer registry governance. | **Scheduled** |
| **Phase 6** | **Ecosystem Expansion & Cross-chain Bridges** | Cross-chain zero-knowledge state proofs to Cardano Mainnet and EVM-compatible rollups, enterprise KYC connectors. | **Scheduled** |

---

## 5. Budget Allocation & Grant Resource Plan

| Category | Description | Allocation (%) |
|---|---|---|
| **ZK Circuit Engineering & Compact Optimization** | Development, witness optimization, and formal verification of Compact smart contracts | 35% |
| **Frontend & SDK Development** | React components, mobile wallet adapters, developer SDKs, and verifier dashboard | 25% |
| **Security Auditing & Penetration Testing** | Independent third-party audit of circuits, backend cryptography, and infrastructure | 20% |
| **Ecosystem Onboarding & Pilot Integrations** | Subsidizing preprod testing, developer grants, and partner dApp integration support | 15% |
| **Infrastructure & Preprod Testnet Nodes** | Midnight proof servers, high-availability RPC indexers, automated CI/CD runners | 5% |

---

## 6. Community & Social Presence
 
- **Product X (Twitter)**: [@privpassweb3](https://x.com/privpassweb3)
- **Live Demo**: [https://privpass-xi.vercel.app/](https://privpass-xi.vercel.app/)
- **Source Code Repository**: [https://github.com/sujeetkulkarni668/privpass](https://github.com/sujeetkulkarni668/privpass)
- **Documentation**: [docs/](docs/)
