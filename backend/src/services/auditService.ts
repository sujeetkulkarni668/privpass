import { prisma } from "../lib/prisma.js";

interface AuditLogInput {
  organizationId?: string;
  actorUserId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

// Deny-list of metadata keys that must never be written to an audit log,
// as a defense-in-depth backstop against accidental identity-data leakage
// from calling code.
const FORBIDDEN_METADATA_KEYS = [
  "pan",
  "panRaw",
  "aadhaar",
  "aadhaarRaw",
  "dob",
  "dateOfBirth",
  "address",
  "addressRaw",
  "documentImage",
];

const FORBIDDEN_METADATA_KEYS_LOWER = FORBIDDEN_METADATA_KEYS.map((k) => k.toLowerCase());

function sanitizeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (FORBIDDEN_METADATA_KEYS_LOWER.includes(key.toLowerCase())) continue;
    clean[key] = value;
  }
  return clean;
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  await prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      actorUserId: input.actorUserId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: sanitizeMetadata(input.metadata) as any,
      ipAddress: input.ipAddress,
    },
  });
}
