// Identity provider abstraction.
//
// PrivPass never claims direct access to real Aadhaar/PAN government
// databases. All providers implement the same interface; only
// SyntheticIdentityProvider is wired up in this repository. AadhaarProvider
// and PANProvider are stubs describing the integration contract a real,
// authorized KYC provider (e.g. a licensed UIDAI/NSDL integration partner)
// would need to satisfy in production — see docs/identity-providers.md.
import { createHash, randomBytes } from "node:crypto";

export interface RawIdentityAttributes {
  fullName: string;
  pan: string; // 10-char PAN string, e.g. "TESTPAN1234"
  aadhaar: string; // 12-digit string
  dobUnixSeconds: number;
  address: string;
}

export interface IssuedCommitment {
  commitment: string; // hex sha256(value || salt) — placeholder for the real
                       // Compact-native Poseidon commitment computed by the
                       // prover/wallet in production (see docs/privacy.md)
  salt: string; // hex — held ONLY by the caller/wallet, never persisted server-side
}

export interface IdentityProvider {
  readonly name: string;
  readonly isSynthetic: boolean;
  fetchAttributes(subjectRef: string): Promise<RawIdentityAttributes>;
}

/**
 * Computes a commitment the same way the real wallet/proving flow would:
 * hash(value || salt). This is a placeholder for the actual Poseidon/
 * Pedersen commitment scheme used inside the Compact circuits — swapped
 * for the real primitive once wired to compiled contract bindings.
 */
export function computeCommitment(value: string): IssuedCommitment {
  const salt = randomBytes(32).toString("hex");
  const commitment = createHash("sha256").update(value + salt).digest("hex");
  return { commitment, salt };
}

export class SyntheticIdentityProvider implements IdentityProvider {
  readonly name = "SyntheticIdentityProvider";
  readonly isSynthetic = true;

  async fetchAttributes(subjectRef: string): Promise<RawIdentityAttributes> {
    // Deterministic demo record, clearly watermarked. Never used to imply
    // real government data access.
    return {
      fullName: "Demo User",
      pan: "TESTPAN1234",
      aadhaar: "TEST-AADHAAR-0000".replace(/\D/g, "").padEnd(12, "0").slice(0, 12),
      dobUnixSeconds: Math.floor(new Date("2007-10-19T00:00:00Z").getTime() / 1000),
      address: "Demo Address, Pune, Maharashtra — DEMO CREDENTIAL, NOT A REAL GOVERNMENT ID",
    };
  }
}

/**
 * Stub. In production this would call an authorized UIDAI e-KYC / Aadhaar
 * Paperless Offline eKYC integration through a licensed AUA/KUA partner.
 * Intentionally throws so it can never silently behave like real data.
 */
export class AadhaarProvider implements IdentityProvider {
  readonly name = "AadhaarProvider";
  readonly isSynthetic = false;

  async fetchAttributes(_subjectRef: string): Promise<RawIdentityAttributes> {
    throw new Error(
      "AadhaarProvider is not connected to a real UIDAI-authorized integration in this build. " +
        "Use SyntheticIdentityProvider for development/demo, or wire a licensed provider here."
    );
  }
}

/**
 * Stub. In production this would call an authorized NSDL/Protean PAN
 * verification API through a licensed integration.
 */
export class PANProvider implements IdentityProvider {
  readonly name = "PANProvider";
  readonly isSynthetic = false;

  async fetchAttributes(_subjectRef: string): Promise<RawIdentityAttributes> {
    throw new Error(
      "PANProvider is not connected to a real NSDL/Protean-authorized integration in this build. " +
        "Use SyntheticIdentityProvider for development/demo, or wire a licensed provider here."
    );
  }
}

export function getConfiguredProvider(): IdentityProvider {
  // Production would select based on env/config + per-organization KYC
  // agreements. This build only ever wires the synthetic provider.
  return new SyntheticIdentityProvider();
}
