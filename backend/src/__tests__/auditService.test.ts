import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.fn().mockResolvedValue({});
vi.mock("../lib/prisma.js", () => ({
  prisma: { auditLog: { create: (...args: unknown[]) => createMock(...args) } },
}));

const { writeAuditLog } = await import("../services/auditService.js");

describe("auditService.writeAuditLog", () => {
  beforeEach(() => createMock.mockClear());

  it("strips forbidden identity-data keys from metadata before persisting", async () => {
    await writeAuditLog({
      action: "credential.issued",
      metadata: {
        type: "PAN",
        pan: "TESTPAN1234", // must be stripped
        aadhaarRaw: "123456789012", // must be stripped
        synthetic: true,
      },
    });

    const call = createMock.mock.calls[0][0];
    expect(call.data.metadata).toEqual({ type: "PAN", synthetic: true });
    expect(call.data.metadata.pan).toBeUndefined();
    expect(call.data.metadata.aadhaarRaw).toBeUndefined();
  });

  it("handles missing metadata gracefully", async () => {
    await writeAuditLog({ action: "user.login" });
    const call = createMock.mock.calls[0][0];
    expect(call.data.metadata).toBeUndefined();
  });
});
