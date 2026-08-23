import { describe, it, expect } from "vitest";
import { CLAIM_LABELS, CLAIM_WITHHOLDS } from "../lib/api.js";

describe("Frontend Claim Definitions", () => {
  it("defines human-readable labels for all supported claims", () => {
    const claims = [
      "PAN_VALID",
      "AADHAAR_VERIFIED",
      "AGE_OVER_18",
      "IDENTITY_VERIFIED",
      "RESIDENCY_VALID",
    ];

    for (const claim of claims) {
      expect(CLAIM_LABELS[claim]).toBeDefined();
      expect(typeof CLAIM_LABELS[claim]).toBe("string");
      expect(CLAIM_LABELS[claim].length).toBeGreaterThan(0);
    }
  });

  it("defines selective disclosure withheld fields for each claim", () => {
    expect(CLAIM_WITHHOLDS.AGE_OVER_18).toContain("date of birth");
    expect(CLAIM_WITHHOLDS.PAN_VALID).toContain("PAN");
    expect(CLAIM_WITHHOLDS.AADHAAR_VERIFIED).toContain("Aadhaar");
    expect(CLAIM_WITHHOLDS.RESIDENCY_VALID).toContain("address");
  });
});
