import { describe, it, expect } from "vitest";
import { ExportService, type AuditRecord } from "../services/exportService.js";

describe("ExportService", () => {
  const sampleRecords: AuditRecord[] = [
    {
      id: "rec-1",
      action: "VERIFY_ZK_PROOF",
      actorAddress: "0x1234567890abcdef",
      targetAddress: "0xabcdef1234567890",
      status: "SUCCESS",
      details: { predicate: "age >= 21" },
      createdAt: new Date("2026-08-25T10:00:00Z"),
    },
    {
      id: "rec-2",
      action: "REVOKE_CREDENTIAL",
      actorAddress: "0xadmin123",
      status: "SUCCESS",
      createdAt: new Date("2026-08-25T11:00:00Z"),
    },
  ];

  it("should format audit records as CSV with escaped headers and values", () => {
    const csv = ExportService.toCsv(sampleRecords);
    expect(csv).toContain("ID,Action,Actor Address,Target Address,Status,Details,Created At");
    expect(csv).toContain('"rec-1","VERIFY_ZK_PROOF","0x1234567890abcdef"');
  });

  it("should format audit records as NDJSON", () => {
    const ndjson = ExportService.toNdjson(sampleRecords);
    const lines = ndjson.split("\n");
    expect(lines.length).toBe(2);
    expect(JSON.parse(lines[0]).id).toBe("rec-1");
  });

  it("should generate a compliance package with valid sha256 integrity hash", () => {
    const pkg = ExportService.generateCompliancePackage(sampleRecords, "org-privpass");
    expect(pkg.manifest.organizationId).toBe("org-privpass");
    expect(pkg.manifest.recordCount).toBe(2);
    expect(pkg.manifest.integrityHash).toMatch(/^[0-9a-f]{64}$/);
  });
});
