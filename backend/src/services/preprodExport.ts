/**
 * preprodExport.ts
 *
 * Generates prepod_user_list.xlsx from the production database and uploads
 * it directly to GitHub using the GitHub Contents API.
 *
 * Vercel's filesystem is read-only, so the workbook is generated in memory
 * and never written to /var/task.
 */

import * as XLSX from "xlsx";
import { prisma } from "../lib/prisma.js";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "sujeetkulkarni1122";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "privpass";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH ?? "main";
const GITHUB_PATH = "prepod_user_list.xlsx";

export async function regeneratePreprodExport(): Promise<void> {
  try {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN environment variable is missing");
    }

    // ── Fetch data from Neon ──────────────────────────────────────────────
    const [users, auditLogs, credentials] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "asc" },
      }),

      (prisma as any).auditLog.findMany({
        where: {
          action: {
            in: [
              "user.login",
              "user.register",
              "user.registered",
              "user.wallet_linked",
            ],
          },
        },
        orderBy: { createdAt: "asc" },
      }),

      prisma.credential.findMany({
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // ── Sheet 1: Users ───────────────────────────────────────────────────
    const userRows = users.map((u: any) => ({
      "User ID": u.id,
      Username: u.username,
      "Display Name": u.displayName ?? "",
      "Wallet Address": u.walletAddress ?? "NOT LINKED",
      "Registered At": u.createdAt.toISOString(),
    }));

    // ── Sheet 2: Login History ───────────────────────────────────────────
    const loginRows = auditLogs.map((a: any) => {
      const user = users.find((u: any) => u.id === a.actorUserId);

      return {
        "Timestamp (UTC)": a.createdAt.toISOString(),
        Action: a.action,
        "User ID": a.actorUserId ?? "system",
        Username: user?.username ?? "(unknown)",
        "Display Name": user?.displayName ?? "",
        "Wallet Address":
          (a.metadata as any)?.walletAddress ?? user?.walletAddress ?? "",
        Metadata: JSON.stringify(a.metadata ?? {}),
      };
    });

    // ── Sheet 3: Credentials ─────────────────────────────────────────────
    const credRows = credentials.map((c: any) => {
      const user = users.find((u: any) => u.id === c.userId);

      return {
        "Credential ID": c.id,
        Username: user?.username ?? c.userId,
        Type: c.type,
        Status: c.status,
        Issuer: c.issuer,
        Commitment: c.commitment,
        "Issued At": (c.issuedAt ?? c.createdAt).toISOString(),
        "Expires At": c.expiresAt?.toISOString() ?? "",
        "Revoked At": c.revokedAt?.toISOString() ?? "",
        "Wallet Address": user?.walletAddress ?? "",
      };
    });

    // ── Build workbook entirely in memory ─────────────────────────────────
    const wb = XLSX.utils.book_new();

    wb.Props = {
      Title: "PrivPass Preprod User List",
      Author: "PrivPass System",
      Subject:
        "Preprod registered users, login history and credentials",
    };

    const wsUsers = XLSX.utils.json_to_sheet(userRows);
    const wsLogins = XLSX.utils.json_to_sheet(loginRows);
    const wsCreds = XLSX.utils.json_to_sheet(credRows);

    wsUsers["!cols"] = [
      { wch: 38 },
      { wch: 22 },
      { wch: 24 },
      { wch: 80 },
      { wch: 26 },
    ];

    wsLogins["!cols"] = [
      { wch: 26 },
      { wch: 22 },
      { wch: 38 },
      { wch: 22 },
      { wch: 24 },
      { wch: 80 },
      { wch: 40 },
    ];

    wsCreds["!cols"] = [
      { wch: 38 },
      { wch: 22 },
      { wch: 12 },
      { wch: 10 },
      { wch: 28 },
      { wch: 66 },
      { wch: 26 },
      { wch: 26 },
      { wch: 26 },
      { wch: 80 },
    ];

    XLSX.utils.book_append_sheet(wb, wsUsers, "Users");
    XLSX.utils.book_append_sheet(wb, wsLogins, "Login History");
    XLSX.utils.book_append_sheet(wb, wsCreds, "Credentials");

    // Generate XLSX as a Buffer instead of writing to Vercel's filesystem.
    const workbookBuffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;

    const base64Content = workbookBuffer.toString("base64");

    // ── Find existing GitHub file SHA ─────────────────────────────────────
    const apiUrl =
      `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}` +
      `/${encodeURIComponent(GITHUB_REPO)}/contents/${GITHUB_PATH}`;

    let existingSha: string | undefined;

    const existingResponse = await fetch(
      `${apiUrl}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (existingResponse.ok) {
      const existingData = (await existingResponse.json()) as {
        sha?: string;
      };

      existingSha = existingData.sha;
    } else if (existingResponse.status !== 404) {
      const body = await existingResponse.text();

      throw new Error(
        `GitHub lookup failed (${existingResponse.status}): ${body}`
      );
    }

    // ── Create/update XLSX on GitHub ──────────────────────────────────────
    const commitMessage =
      `chore(data): update prepod_user_list.xlsx [${new Date().toISOString()}]`;

    const updateResponse = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch: GITHUB_BRANCH,
        ...(existingSha ? { sha: existingSha } : {}),
      }),
    });

    if (!updateResponse.ok) {
      const body = await updateResponse.text();

      throw new Error(
        `GitHub upload failed (${updateResponse.status}): ${body}`
      );
    }

    console.info(
      `[preprodExport] Successfully uploaded ${GITHUB_PATH} to ${GITHUB_OWNER}/${GITHUB_REPO}:${GITHUB_BRANCH}`
    );
  } catch (err) {
    console.error("[preprodExport] Failed to regenerate export:", err);
  }
}
