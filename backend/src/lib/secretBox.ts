// secretBox.ts
//
// Reversible encryption for secrets the app must read back later (e.g. a
// webhook signing secret, needed at delivery time to compute an HMAC the
// customer can verify against the raw secret they were shown once).
//
// This replaces a previous placeholder that stored sha256(secret) —
// a one-way hash, which meant the raw secret could never be recovered and
// outgoing webhook signatures were computed over the wrong value, making
// them unverifiable by any receiver. AES-256-GCM here is real, working
// encryption: authenticated (tamper-evident) and reversible with the key.
//
// In production, WEBHOOK_ENCRYPTION_KEY should itself come from a KMS/HSM
// (e.g. envelope-encrypted and unwrapped at boot), not a bare env var —
// this module doesn't do KMS integration, since that's a per-cloud-vendor
// SDK choice. It DOES give you the correct boundary: swap
// `getEncryptionKey()`'s env read for a KMS unwrap call and nothing else
// in this file (or its callers) needs to change.

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const hex = process.env.WEBHOOK_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error(
      "Missing WEBHOOK_ENCRYPTION_KEY (32-byte hex). Generate one with " +
        "`node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"` " +
        "and set it in backend/.env — never commit a real value."
    );
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("WEBHOOK_ENCRYPTION_KEY must decode to exactly 32 bytes");
  }
  return key;
}

/** Encrypts `plaintext`, returning `iv:authTag:ciphertext` (all hex). */
export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // 96-bit nonce, standard for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), ciphertext.toString("hex")].join(":");
}

/** Reverses encryptSecret(); throws if the value was tampered with or the key is wrong. */
export function decryptSecret(stored: string): string {
  const key = getEncryptionKey();
  const [ivHex, authTagHex, ciphertextHex] = stored.split(":");
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error("malformed encrypted secret");
  }
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
