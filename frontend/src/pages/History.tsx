import { useState } from "react";

interface HistoryEntry {
  id: string;
  organizationName: string;
  claims: string[];
  result: string;
  verifiedAt: string;
}

// Backend route for a user's own verification history (GET
// /verifications?mine=true, scoped by session) is a straightforward
// extension of verificationsRouter — omitted here to stay within this
// pass's scope; wire it the same way credentials.ts scopes by req.userId.
export default function History() {
  const [entries] = useState<HistoryEntry[]>([]);

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <p className="eyebrow">History</p>
      <h1 style={{ fontSize: "2.25rem" }}>Verification history</h1>
      <p style={{ maxWidth: 560 }}>
        Every verifier you've approved, what they asked for, and the result — never the
        underlying identity data.
      </p>

      {entries.length === 0 && (
        <div className="card">
          <p style={{ margin: 0 }}>No verifications yet. When you approve a request, it'll show up here.</p>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {entries.map((e) => (
          <div className="card" key={e.id} style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{e.organizationName}</div>
              <div className="mono" style={{ color: "var(--slate)", fontSize: "0.85rem" }}>
                {e.claims.join(", ")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className={`badge ${e.result === "VERIFIED" ? "badge-active" : "badge-revoked"}`}>
                {e.result}
              </span>
              <div style={{ color: "var(--slate-dim)", fontSize: "0.8rem", marginTop: 4 }}>
                {new Date(e.verifiedAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
