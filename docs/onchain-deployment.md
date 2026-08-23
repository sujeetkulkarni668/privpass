# PrivPass On-Chain Architecture & Deployment Guide

This document provides a comprehensive technical overview of moving PrivPass on-chain to the **Midnight Network** (Preprod / Mainnet), detailing contract interactions, transaction lifecycles, and zero-knowledge proof mechanics.

---

## 1. Architecture & On-Chain Mechanics

PrivPass uses a **hybrid off-chain proving / on-chain settlement** zero-knowledge architecture:

`
+---------------------------------------------------------------------------------------------------+
|                                      USER CLIENT / FRONTEND                                       |
|  - Holds private raw identity credentials (PAN, Aadhaar, DOB, Address) and user salt              |
|  - Evaluates local Compact witness functions inside the browser / local proof provider            |
|  - Generates ZK Proof that the secret opens the commitment and satisfies the criteria (e.g. >=18) |
+---------------------------------------------------------------------------------------------------+
                                                  │
                                                  ▼ (ZK Proof + Public Commitment Only)
+---------------------------------------------------------------------------------------------------+
|                                  MIDNIGHT PREPROD / MAINNET LEDGER                                |
|  1. CredentialRegistry: Holds mappings of opaque commitment hashes -> status/timestamps          |
|  2. VerificationRequest: Coordinates verification sessions between verifiers and users            |
|  3. RevocationRegistry: Stores revoked credential nullifier hashes                                |
|  4. IdentityVerification: Verifies ZK constraints against ledger state roots                       |
+---------------------------------------------------------------------------------------------------+
                                                  ▲
                                                  │ (Reads Boolean Verification Outcomes)
+---------------------------------------------------------------------------------------------------+
|                                   VERIFIER / BACKEND CONSUMER                                     |
|  - Receives only verified proof booleans (e.g., AGE_OVER_18 = true, PAN_VALID = true)         |
|  - 0% risk of PII leakage, data breach, or GDPR/compliance exposure                               |
+---------------------------------------------------------------------------------------------------+
`

---

## 2. Step-by-Step On-Chain Execution Flow

### Step 1: Issuer Authorization on Ledger
Before any credential can be anchored on-chain, the issuer identity must be authorized:
1. An issuer generates a private keypair: (issuerSecret, issuerSalt).
2. Computes the public issuer commitment: issuerId = persistentHash([issuerSecret, issuerSalt]).
3. Calls the uthorizeIssuer(issuerId) circuit on CredentialRegistry.
4. The contract updates its on-chain uthorizedIssuers ledger map to 	rue.

### Step 2: Minting & Registering a Credential (Zero-Knowledge)
When an identity provider or user creates a credential:
1. The user's device creates a 32-byte cryptographically random salt: commitmentSalt.
2. The user commitment is calculated:
   \text{commitment} = \text{persistentHash}([\text{rawIdentityBytes}, \text{commitmentSalt}])
3. The issuer signs the commitment and broadcasts a transaction calling egisterCredential(commitment, credentialType, issuerId, issuedAt, expiresAt) on CredentialRegistry.
4. **On-chain State**: Only the 32-byte hash commitment is stored in ledger state. The actual PAN, Aadhaar, or DOB never leaves the user's device.

### Step 3: Verifier Creates an On-Chain Verification Request
When a third-party organization (e.g., bank, exchange, employer) wants to verify a user:
1. Verifier generates a unique 32-byte equestId.
2. Specifies the required boolean claims:
   - panRequested: 	rue/false
   - geRequested: 	rue/false
   - adhaarRequested: 	rue/false
   - esidencyRequested: 	rue/false
3. Submits an on-chain transaction calling createRequest(...) on VerificationRequest.
4. An event is indexed on the Midnight Indexer, and a verification QR code/URL is presented to the user.

### Step 4: User Proves Claims via Local ZK-SNARK Prover
1. User scans the QR code and reviews the requested claims.
2. The user's client loads the compiled Compact contract from contracts/managed/VerificationRequest/contract/index.js.
3. The local client passes the private witness data (dobUnixSeconds, commitmentSalt, panRaw, etc.) into the local **Midnight Proof Server** (http://localhost:6300 or local WASM prover).
4. The proof server executes the SNARK circuit to generate a succinct cryptographic proof demonstrating:
   - The user possesses the private preimage to the registered on-chain commitment.
   - The user's age is $\ge 18$ (computed as 
ow - dob >= 568025136 seconds).
   - The format matches the standard schema.
5. The client submits a transaction calling completeRequest(requestId, nowUnixSeconds, commitments...) to the VerificationRequest contract.

### Step 5: Verifier Reads the Verified Result
1. The VerificationRequest contract on Midnight evaluates the zero-knowledge proof against the ledger verifier keys.
2. If valid, the contract marks the request COMPLETED on-chain.
3. The verifier queries statusOf(commitment) and reads the on-chain outcome without ever receiving any PII.

---

## 3. Transaction Construction & Signing Pipeline

Every on-chain state transition in PrivPass goes through this 4-stage pipeline:

`
[1. Unproven Tx] ──► [2. Wallet Balancing] ──► [3. ZK Key Proving] ──► [4. Node RPC Broadcast]
`

1. **Unproven Transaction Creation (createUnprovenCallTx)**:
   - Constructs the intended circuit execution payload using @midnight-ntwrk/midnight-js-contracts.
2. **DUST Fee Balancing (wallet.balanceTransaction)**:
   - The wallet selects unspent tDUST/DUST UTXOs from your address to cover transaction fees and execution costs.
3. **ZK Proof Generation (wallet.proveTransaction / Proof Server)**:
   - Sends the proving recipe to the Midnight Proof Server on port 6300 to synthesize the SNARK proof.
4. **Node Submission (wallet.submitTransaction)**:
   - Submits the finalized, balanced, and proven transaction to the Midnight Node RPC (https://rpc.preprod.midnight.network).

---

## 4. Deploying to Production / Mainnet Checklist

When you are ready to migrate from Preprod to Mainnet:

1. **Treasury & Fee Funding**:
   - Fund your mainnet wallet with live DUST tokens to cover deployment and transaction fees.
2. **Infrastructure Endpoints**:
   - Run a dedicated production instance of ghcr.io/midnight-ntwrk/proof-server:latest on a secure internal network.
   - Update your backend environment variables to point to the production Indexer and Node RPC.
3. **Environment Configuration (ackend/.env)**:
   `env
   MIDNIGHT_NETWORK_ID=mainnet
   MIDNIGHT_INDEXER_URL=https://indexer.midnight.network/api/v4/graphql
   MIDNIGHT_INDEXER_WS_URL=wss://indexer.midnight.network/api/v4/graphql/ws
   MIDNIGHT_NODE_URL=https://rpc.midnight.network
   MIDNIGHT_PROOF_SERVER_URL=http://your-secure-prover:6300
   MIDNIGHT_WALLET_SEED=<production-64-hex-seed>
   `
4. **Execute Contract Deployment**:
   - Run yarn workspace @privpass/contracts deploy to broadcast the contract deployments to the mainnet ledger.
   - The script will automatically store the newly minted on-chain contract addresses into ackend/.env.
