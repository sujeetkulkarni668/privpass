import { describe, it, expect } from "vitest";

interface AttributeDisclosure {
  key: string;
  isDisclosed: boolean;
  predicate?: string;
}

function evaluateDisclosurePrivacy(attributes: AttributeDisclosure[]): {
  privacyScore: number;
  revealedCount: number;
  zeroKnowledgeCount: number;
  hiddenCount: number;
} {
  let revealed = 0;
  let zk = 0;
  let hidden = 0;

  for (const attr of attributes) {
    if (attr.isDisclosed) {
      revealed++;
    } else if (attr.predicate) {
      zk++;
    } else {
      hidden++;
    }
  }

  const total = attributes.length || 1;
  const score = Math.round(((hidden * 1.0 + zk * 0.8) / total) * 100);

  return {
    privacyScore: score,
    revealedCount: revealed,
    zeroKnowledgeCount: zk,
    hiddenCount: hidden,
  };
}

describe("Selective Disclosure Privacy Scoring", () => {
  it("calculates 100% privacy when all fields are hidden", () => {
    const attrs: AttributeDisclosure[] = [
      { key: "dob", isDisclosed: false },
      { key: "ssn", isDisclosed: false },
      { key: "name", isDisclosed: false },
    ];
    const res = evaluateDisclosurePrivacy(attrs);
    expect(res.privacyScore).toBe(100);
    expect(res.hiddenCount).toBe(3);
  });

  it("rewards zero-knowledge predicates with high privacy score", () => {
    const attrs: AttributeDisclosure[] = [
      { key: "age", isDisclosed: false, predicate: "age >= 18" },
      { key: "ssn", isDisclosed: false },
      { key: "name", isDisclosed: false },
    ];
    const res = evaluateDisclosurePrivacy(attrs);
    expect(res.privacyScore).toBeGreaterThanOrEqual(90);
    expect(res.zeroKnowledgeCount).toBe(1);
  });

  it("reduces privacy score when raw data is disclosed", () => {
    const attrs: AttributeDisclosure[] = [
      { key: "name", isDisclosed: true },
      { key: "address", isDisclosed: true },
    ];
    const res = evaluateDisclosurePrivacy(attrs);
    expect(res.privacyScore).toBe(0);
    expect(res.revealedCount).toBe(2);
  });
});
