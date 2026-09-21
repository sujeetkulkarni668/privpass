import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";

// Simulation of Compact persistentHash
function persistentHash(buffers: (Uint8Array | string | number | bigint)[]): string {
  const hash = createHash("sha256");
  for (const item of buffers) {
    if (typeof item === "string") {
      hash.update(Buffer.from(item));
    } else if (typeof item === "number" || typeof item === "bigint") {
      const b = Buffer.alloc(8);
      b.writeBigUInt64BE(BigInt(item));
      hash.update(b);
    } else {
      hash.update(Buffer.from(item));
    }
  }
  return hash.digest("hex");
}

function isUpperAlpha(c: number): boolean {
  return c >= 65 && c <= 90;
}

function isDigit(c: number): boolean {
  return c >= 48 && c <= 57;
}

function validatePanFormat(panStr: string): boolean {
  if (panStr.length !== 10) return false;
  const bytes = Buffer.from(panStr, "ascii");
  return (
    isUpperAlpha(bytes[0]) &&
    isUpperAlpha(bytes[1]) &&
    isUpperAlpha(bytes[2]) &&
    isUpperAlpha(bytes[3]) &&
    isUpperAlpha(bytes[4]) &&
    isDigit(bytes[5]) &&
    isDigit(bytes[6]) &&
    isDigit(bytes[7]) &&
    isDigit(bytes[8]) &&
    isUpperAlpha(bytes[9])
  );
}

function validateAadhaarFormat(aadhaarStr: string): boolean {
  if (aadhaarStr.length !== 12) return false;
  const bytes = Buffer.from(aadhaarStr, "ascii");
  for (let i = 0; i < 12; i++) {
    if (!isDigit(bytes[i])) return false;
  }
  return true;
}

function evaluateAgeThreshold(dobUnix: bigint, nowUnix: bigint, minAgeYears: number): boolean {
  if (nowUnix < dobUnix) return false;
  const ageSeconds = nowUnix - dobUnix;
  const thresholdSeconds = BigInt(minAgeYears) * 31556952n;
  return ageSeconds >= thresholdSeconds;
}

function computeNullifier(userSecret: string, requestId: string): string {
  return persistentHash([userSecret, requestId]);
}

describe("Compact Smart Contract Circuit Logic & Constraints", () => {
  describe("PAN Format Constraints (IdentityVerification.compact)", () => {
    it("accepts valid Indian PAN cards [A-Z]{5}[0-9]{4}[A-Z]{1}", () => {
      expect(validatePanFormat("ABCDE1234F")).toBe(true);
      expect(validatePanFormat("BLRPS5678K")).toBe(true);
      expect(validatePanFormat("ZZZZZ9999Z")).toBe(true);
    });

    it("rejects invalid PAN strings with numbers in prefix", () => {
      expect(validatePanFormat("1BCDE1234F")).toBe(false);
      expect(validatePanFormat("AB1DE1234F")).toBe(false);
    });

    it("rejects invalid PAN strings with letters in numeric section", () => {
      expect(validatePanFormat("ABCDEA234F")).toBe(false);
      expect(validatePanFormat("ABCDE123AF")).toBe(false);
    });

    it("rejects invalid PAN strings with digit in suffix", () => {
      expect(validatePanFormat("ABCDE12345")).toBe(false);
    });

    it("rejects lowercase characters", () => {
      expect(validatePanFormat("abcde1234f")).toBe(false);
    });
  });

  describe("Aadhaar Format Constraints (IdentityVerification.compact)", () => {
    it("accepts 12-digit numeric Aadhaar identifiers", () => {
      expect(validateAadhaarFormat("123456789012")).toBe(true);
      expect(validateAadhaarFormat("987654321098")).toBe(true);
    });

    it("rejects non-digit characters in Aadhaar", () => {
      expect(validateAadhaarFormat("12345678901A")).toBe(false);
      expect(validateAadhaarFormat("A23456789012")).toBe(false);
      expect(validateAadhaarFormat("1234-5678-9012")).toBe(false);
    });

    it("rejects wrong length Aadhaar strings", () => {
      expect(validateAadhaarFormat("12345678901")).toBe(false);
      expect(validateAadhaarFormat("1234567890123")).toBe(false);
    });
  });

  describe("Dynamic Age Threshold Constraints (IdentityVerification.compact)", () => {
    const NOW = 1710000000n; // Example Unix timestamp
    const ONE_YEAR = 31556952n;

    it("evaluates true when user age is >= 18", () => {
      const dob20YearsAgo = NOW - 20n * ONE_YEAR;
      expect(evaluateAgeThreshold(dob20YearsAgo, NOW, 18)).toBe(true);
    });

    it("evaluates false when user age is < 18", () => {
      const dob16YearsAgo = NOW - 16n * ONE_YEAR;
      expect(evaluateAgeThreshold(dob16YearsAgo, NOW, 18)).toBe(false);
    });

    it("supports custom thresholds (e.g. 21 for alcohol or accredited investor)", () => {
      const dob19YearsAgo = NOW - 19n * ONE_YEAR;
      expect(evaluateAgeThreshold(dob19YearsAgo, NOW, 18)).toBe(true);
      expect(evaluateAgeThreshold(dob19YearsAgo, NOW, 21)).toBe(false);
    });

    it("rejects invalid future birth dates", () => {
      const futureDob = NOW + 1000n;
      expect(evaluateAgeThreshold(futureDob, NOW, 18)).toBe(false);
    });
  });

  describe("Replay Protection & Nullifiers (VerificationRequest.compact)", () => {
    it("generates deterministic nullifiers for unique request IDs", () => {
      const userSecret = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const req1 = "req_001_abc";
      const req2 = "req_002_xyz";

      const nullifier1 = computeNullifier(userSecret, req1);
      const nullifier2 = computeNullifier(userSecret, req2);

      expect(nullifier1).toHaveLength(64);
      expect(nullifier2).toHaveLength(64);
      expect(nullifier1).not.toEqual(nullifier2);
    });

    it("guarantees same user and request produce identical nullifier for verification", () => {
      const userSecret = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const req = "req_anchor_999";

      const n1 = computeNullifier(userSecret, req);
      const n2 = computeNullifier(userSecret, req);

      expect(n1).toEqual(n2);
    });
  });
});
