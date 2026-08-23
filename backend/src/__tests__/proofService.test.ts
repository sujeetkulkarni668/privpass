import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { generateProofForClaims } from "../services/proofService.js";

function commitmentFor(value: string, salt: string) {
  return createHash("sha256").update(value + salt).digest("hex");
}

describe("proofService.generateProofForClaims (LOCAL_CHECK fallback)", () => {
  it("returns AGE_OVER_18=true for a DOB more than 18 years ago", async () => {
    const salt = "s1";
    const dob = Math.floor(new Date("2000-01-01").getTime() / 1000);
    const credential = {
      id: "cred-age",
      type: "AGE",
      commitment: commitmentFor(String(dob), salt),
      status: "ACTIVE",
      expiresAt: null,
    };

    const outcome = await generateProofForClaims(
      ["AGE_OVER_18"],
      [credential],
      { "cred-age": { salt, rawValue: String(dob) } }
    );

    expect(outcome.claimResults.AGE_OVER_18).toBe(true);
    expect(outcome.proofRef).toContain("LOCAL_CHECK");
  });

  it("returns AGE_OVER_18=false for a DOB under 18 years ago", async () => {
    const salt = "s2";
    const dob = Math.floor(Date.now() / 1000) - 5 * 31_556_952; // 5 years old
    const credential = {
      id: "cred-age-2",
      type: "AGE",
      commitment: commitmentFor(String(dob), salt),
      status: "ACTIVE",
      expiresAt: null,
    };

    const outcome = await generateProofForClaims(
      ["AGE_OVER_18"],
      [credential],
      { "cred-age-2": { salt, rawValue: String(dob) } }
    );

    expect(outcome.claimResults.AGE_OVER_18).toBe(false);
  });

  it("fails the claim if the supplied witness does not match the stored commitment", async () => {
    const credential = {
      id: "cred-pan",
      type: "PAN",
      commitment: commitmentFor("TESTPAN1234", "real-salt"),
      status: "ACTIVE",
      expiresAt: null,
    };

    const outcome = await generateProofForClaims(
      ["PAN_VALID"],
      [credential],
      { "cred-pan": { salt: "wrong-salt", rawValue: "TESTPAN1234" } }
    );

    expect(outcome.claimResults.PAN_VALID).toBe(false);
  });

  it("fails the claim if the credential is revoked", async () => {
    const salt = "s3";
    const credential = {
      id: "cred-pan-2",
      type: "PAN",
      commitment: commitmentFor("TESTPAN1234", salt),
      status: "REVOKED",
      expiresAt: null,
    };

    const outcome = await generateProofForClaims(
      ["PAN_VALID"],
      [credential],
      { "cred-pan-2": { salt, rawValue: "TESTPAN1234" } }
    );

    expect(outcome.claimResults.PAN_VALID).toBe(false);
  });

  it("fails the claim if the credential is expired", async () => {
    const salt = "s4";
    const credential = {
      id: "cred-pan-3",
      type: "PAN",
      commitment: commitmentFor("TESTPAN1234", salt),
      status: "ACTIVE",
      expiresAt: new Date(Date.now() - 1000),
    };

    const outcome = await generateProofForClaims(
      ["PAN_VALID"],
      [credential],
      { "cred-pan-3": { salt, rawValue: "TESTPAN1234" } }
    );

    expect(outcome.claimResults.PAN_VALID).toBe(false);
  });

  it("IDENTITY_VERIFIED requires both PAN_VALID and AADHAAR_VERIFIED", async () => {
    const panSalt = "p1";
    const aadhaarSalt = "a1";
    const credentials = [
      { id: "pan", type: "PAN", commitment: commitmentFor("TESTPAN1234", panSalt), status: "ACTIVE", expiresAt: null },
      { id: "aad", type: "AADHAAR", commitment: commitmentFor("123456789012", aadhaarSalt), status: "ACTIVE", expiresAt: null },
    ];

    const outcome = await generateProofForClaims(
      ["IDENTITY_VERIFIED"],
      credentials,
      {
        pan: { salt: panSalt, rawValue: "TESTPAN1234" },
        aad: { salt: aadhaarSalt, rawValue: "123456789012" },
      }
    );

    expect(outcome.claimResults.IDENTITY_VERIFIED).toBe(true);
  });
});
