import { describe, it, expect, vi } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

vi.mock("@midnight-ntwrk/compact-runtime", async (importOriginal) => {
  const mod = await importOriginal<Record<string, any>>();
  return {
    ...mod,
    checkRuntimeVersion: vi.fn(),
  };
});

const BINDINGS_PATH = join(__dirname, "..", "managed", "IdentityVerification", "contract", "index.js");
const HAS_COMPILED_ARTIFACTS = existsSync(BINDINGS_PATH);

describe("IdentityVerification.compact Circuit Tests", () => {
  if (!HAS_COMPILED_ARTIFACTS) {
    it.skip(
      "skipped: no compiled artifacts in contracts/managed — run `yarn compact:compile` with compactc installed",
      () => {}
    );
    return;
  }

  it("exports IdentityVerification contract and circuit structures", async () => {
    const bindings = await import(BINDINGS_PATH);
    expect(bindings.Contract).toBeDefined();
  });
});
