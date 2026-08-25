/**
 * db-inspect.ts — dumps all table contents.
 * Run from backend/ with: npx tsx db-inspect.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env["DATABASE_URL"] } },
});

function hr() { console.log("─".repeat(65)); }
function box(title: string, count: number) {
  console.log(`\n┌${"─".repeat(63)}┐`);
  console.log(`│  ${title.padEnd(45)}  ${String(count + " rows").padStart(14)} │`);
  console.log(`└${"─".repeat(63)}┘`);
}

async function main() {
  console.log("\n╔═══════════════════════════════════════════════════════════════╗");
  console.log("║             PrivPass — Live Database Snapshot                ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝");

  // ── Users ────────────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  box("👤  USERS", users.length);
  users.forEach((u: any, i: number) => {
    if (i) hr();
    console.log(`  id            ${u.id}`);
    console.log(`  username      ${u.username}`);
    console.log(`  displayName   ${u.displayName ?? "(none)"}`);
    console.log(`  walletAddress ${u.walletAddress ?? "⚠  NOT LINKED"}`);
    console.log(`  createdAt     ${u.createdAt.toISOString()}`);
  });

  // ── Credentials ──────────────────────────────────────────────────────────
  const creds = await prisma.credential.findMany({ orderBy: { createdAt: "asc" } });
  box("📄  CREDENTIALS", creds.length);
  creds.forEach((c: any, i: number) => {
    if (i) hr();
    console.log(`  id          ${c.id}`);
    console.log(`  userId      ${c.userId}`);
    console.log(`  type        ${c.type}`);
    console.log(`  status      ${c.status}`);
    console.log(`  issuer      ${c.issuer}`);
    console.log(`  commitment  ${c.commitment}`);
    console.log(`  issuedAt    ${(c.issuedAt ?? c.createdAt).toISOString()}`);
    console.log(`  expiresAt   ${c.expiresAt?.toISOString() ?? "(none)"}`);
    console.log(`  revokedAt   ${c.revokedAt?.toISOString() ?? "(not revoked)"}`);
  });

  // ── Sessions ─────────────────────────────────────────────────────────────
  try {
    const sessions = await (prisma as any).refreshSession.findMany({ orderBy: { createdAt: "asc" } });
    box("🔐  REFRESH SESSIONS", sessions.length);
    sessions.forEach((s: any, i: number) => {
      if (i) hr();
      console.log(`  id        ${s.id}`);
      console.log(`  userId    ${s.userId}`);
      console.log(`  expiresAt ${s.expiresAt?.toISOString()}`);
      console.log(`  revoked   ${s.revoked}`);
    });
  } catch {}

  // ── Audit Log ────────────────────────────────────────────────────────────
  try {
    const logs = await (prisma as any).auditLog.findMany({
      orderBy: { createdAt: "asc" }, take: 100,
    });
    box("📋  AUDIT LOGS (last 100)", logs.length);
    logs.forEach((a: any, i: number) => {
      if (i) hr();
      console.log(`  action     ${a.action}`);
      console.log(`  actorId    ${a.actorUserId ?? "(system)"}`);
      console.log(`  metadata   ${JSON.stringify(a.metadata ?? {})}`);
      console.log(`  createdAt  ${a.createdAt.toISOString()}`);
    });
  } catch {}

  // ── Verification Requests ────────────────────────────────────────────────
  try {
    const reqs = await (prisma as any).verificationRequest.findMany({ orderBy: { createdAt: "asc" } });
    box("✅  VERIFICATION REQUESTS", reqs.length);
    reqs.forEach((r: any, i: number) => {
      if (i) hr();
      console.log(`  id           ${r.id}`);
      console.log(`  requester    ${r.requesterName ?? r.requesterId ?? "(unknown)"}`);
      console.log(`  status       ${r.status}`);
      console.log(`  credTypes    ${JSON.stringify(r.requiredCredentialTypes ?? [])}`);
      console.log(`  createdAt    ${r.createdAt.toISOString()}`);
    });
  } catch {}

  console.log("\n╔═══════════════════════════════════════════════════════════════╗");
  console.log("║                        End of snapshot                      ║");
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());
