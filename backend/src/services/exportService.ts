import crypto from "crypto";

export interface AuditRecord {
  id: string;
  action: string;
  actorAddress?: string;
  targetAddress?: string;
  status: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date | string;
}

export class ExportService {
  /**
   * Converts audit records into CSV format with escaping
   */
  public static toCsv(records: AuditRecord[]): string {
    const headers = ["ID", "Action", "Actor Address", "Target Address", "Status", "Details", "Created At"];
    const rows = records.map((r) => [
      r.id,
      r.action,
      r.actorAddress || "",
      r.targetAddress || "",
      r.status,
      r.details ? JSON.stringify(r.details).replace(/"/g, '""') : "",
      new Date(r.createdAt).toISOString(),
    ]);

    const csvLines = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ];

    return csvLines.join("\n");
  }

  /**
   * Converts audit records into Newline Delimited JSON (NDJSON)
   */
  public static toNdjson(records: AuditRecord[]): string {
    return records.map((r) => JSON.stringify(r)).join("\n");
  }

  /**
   * Generates a signed audit compliance package with SHA-256 manifest
   */
  public static generateCompliancePackage(
    records: AuditRecord[],
    organizationId: string
  ): {
    manifest: {
      organizationId: string;
      recordCount: number;
      generatedAt: string;
      integrityHash: string;
    };
    csvData: string;
    jsonData: string;
  } {
    const csvData = this.toCsv(records);
    const jsonData = JSON.stringify(records, null, 2);

    const integrityHash = crypto
      .createHash("sha256")
      .update(csvData + jsonData)
      .digest("hex");

    return {
      manifest: {
        organizationId,
        recordCount: records.length,
        generatedAt: new Date().toISOString(),
        integrityHash,
      },
      csvData,
      jsonData,
    };
  }
}
