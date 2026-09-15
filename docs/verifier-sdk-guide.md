# PrivPass Verifier SDK & Integration Guide

This guide describes how external decentralized applications (dApps), DeFi protocols, and Web3 services can verify zero-knowledge credentials using the PrivPass SDK and REST API.

## Quickstart (Node.js / TypeScript)

### 1. Install SDK
```bash
npm install @privpass/verifier-sdk
# or
yarn add @privpass/verifier-sdk
```

### 2. Initialize Client
```typescript
import { PrivPassClient } from "@privpass/verifier-sdk";

const client = new PrivPassClient({
  apiKey: process.env.PRIVPASS_API_KEY,
  environment: "preprod", // or "mainnet"
});
```

### 3. Create a Verification Request
```typescript
const request = await client.verifications.createRequest({
  templateId: "tpl_kyc_tier_1",
  callbackUrl: "https://your-dapp.com/api/webhooks/privpass",
  predicates: [
    { field: "age", op: "gte", value: 18 },
    { field: "country", op: "eq", value: "IN" },
  ],
});

console.log("Share this URL with the user:", request.verificationUrl);
```

### 4. Verify zk-SNARK Proof On-Chain
```typescript
const result = await client.verifications.verifyProof({
  requestId: request.id,
  proofBytes: userSubmittedProof.proofBytes,
  publicInputs: userSubmittedProof.publicInputs,
});

if (result.verified) {
  console.log("User verified! Nullifier:", result.nullifier);
}
```

---

## Webhook Verification (HMAC-SHA256)

```typescript
import crypto from "crypto";

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `sha256=${hmac}` === signature;
}
```
