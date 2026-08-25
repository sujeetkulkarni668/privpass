/**
 * preprodExport.ts
 *
 * Generates prepod_user_list.xlsx at the project root whenever called.
 * Contains three sheets:
 *   1. Users        — all registered users + wallet linkage
 *   2. Login History — every login event from the audit log
 *   3. Credentials  — all issued credentials with status
 *
 * Called from authService after every successful login so the file stays live.
 * The file is committed and pushed to GitHub origin/main automatically.
 */

import * as XLSX from "xlsx";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../lib/prisma.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Project root = backend/src/services/../../.. = privpass/
const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..");
const XLSX_PATH    = path.join(PROJECT_ROOT, "prepod_user_list.xlsx");

export async function regeneratePreprodExport(): Promise<void> {
  try {
    // ── Fetch data ─────────────────────────────────────────────────────────
    const [users, auditLogs, credentials] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      (prisma as any).auditLog.findMany({
        where:   { action: { in: ["user.login", "user.register", "user.wallet_linked"] } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.credential.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    // ── Sheet 1: Users ─────────────────────────────────────────────────────
    const userRows = users.map((u: any) => ({
      "User ID":        u.id,
      "Username":       u.username,
      "Display Name":   u.displayName ?? "",
      "Wallet Address": u.walletAddress ?? "NOT LINKED",
      "Registered At":  u.createdAt.toISOString(),
    }));

    // ── Sheet 2: Login History ─────────────────────────────────────────────
    const loginRows = auditLogs.map((a: any) => {
      const user = users.find((u: any) => u.id === a.actorUserId);
      return {
        "Timestamp (UTC)":  a.createdAt.toISOString(),
        "Action":           a.action,
        "User ID":          a.actorUserId ?? "system",
        "Username":         user?.username ?? "(unknown)",
        "Display Name":     user?.displayName ?? "",
        "Wallet Address":   (a.metadata as any)?.walletAddress ?? user?.walletAddress ?? "",
        "Metadata":         JSON.stringify(a.metadata ?? {}),
      };
    });

    // ── Sheet 3: Credentials ───────────────────────────────────────────────
    const credRows = credentials.map((c: any) => {
      const user = users.find((u: any) => u.id === c.userId);
      return {
        "Credential ID":  c.id,
        "Username":       user?.username ?? c.userId,
        "Type":           c.type,
        "Status":         c.status,
        "Issuer":         c.issuer,
        "Commitment":     c.commitment,
        "Issued At":      (c.issuedAt ?? c.createdAt).toISOString(),
        "Expires At":     c.expiresAt?.toISOString() ?? "",
        "Revoked At":     c.revokedAt?.toISOString() ?? "",
        "Wallet Address": user?.walletAddress ?? "",
      };
    });

    // ── Build workbook ─────────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();

    wb.Props = {
      Title:   "PrivPass Preprod User List",
      Author:  "PrivPass System",
      Subject: "Preprod registered users, login history and credentials",
    };

    const wsUsers   = XLSX.utils.json_to_sheet(userRows);
    const wsLogins  = XLSX.utils.json_to_sheet(loginRows);
    const wsCreds   = XLSX.utils.json_to_sheet(credRows);

    // Column widths
    wsUsers["!cols"]  = [{ wch: 38 }, { wch: 22 }, { wch: 24 }, { wch: 80 }, { wch: 26 }];
    wsLogins["!cols"] = [{ wch: 26 }, { wch: 22 }, { wch: 38 }, { wch: 22 }, { wch: 24 }, { wch: 80 }, { wch: 40 }];
    wsCreds["!cols"]  = [{ wch: 38 }, { wch: 22 }, { wch: 12 }, { wch: 10 }, { wch: 28 }, { wch: 66 }, { wch: 26 }, { wch: 26 }, { wch: 26 }, { wch: 80 }];

    XLSX.utils.book_append_sheet(wb, wsUsers,  "Users");
    XLSX.utils.book_append_sheet(wb, wsLogins, "Login History");
    XLSX.utils.book_append_sheet(wb, wsCreds,  "Credentials");

    XLSX.writeFile(wb, XLSX_PATH);
    console.info(`[preprodExport] Wrote ${XLSX_PATH}`);

    // ── Commit & push to GitHub origin/main ───────────────────────────────
    _gitCommitAndPush();
  } catch (err) {
    // Non-fatal: export failure must never break the login flow
    console.error("[preprodExport] Failed to regenerate export:", err);
  }
}

function _gitCommitAndPush(): void {
  try {
    const opts = { cwd: PROJECT_ROOT, stdio: "pipe" as const };

    // Stage only the xlsx file — never commit source changes automatically
    execSync(`git add prepod_user_list.xlsx`, opts);

    // Only commit if there's something staged
    const diff = execSync("git diff --cached --name-only", opts).toString().trim();
    if (!diff) {
      console.info("[preprodExport] No changes to commit.");
      return;
    }

    const ts = new Date().toISOString();
    execSync(
      `git commit -m "chore(data): update prepod_user_list.xlsx [${ts}]"`,
      opts
    );
    execSync("git push origin main", opts);
    console.info("[preprodExport] Pushed prepod_user_list.xlsx to origin/main");
  } catch (err) {
    // Push failure is non-fatal (e.g. no network, no credentials)
    console.error("[preprodExport] Git push failed:", (err as any)?.stderr?.toString() ?? err);
  }
}
