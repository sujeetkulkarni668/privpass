import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const TYPES = ["PAN", "AADHAAR", "AGE", "RESIDENCY"];

export default function Credentials() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"active" | "all">("active");

  function refresh() {
    api.listCredentials().then((r) => setCredentials(r.credentials));
  }

  useEffect(refresh, []);

  const activeTypes = new Set(
    credentials.filter((c) => c.status === "ACTIVE").map((c) => c.type)
  );

  async function issue(type: string) {
    if (activeTypes.has(type)) {
      setError(`You already have an active ${type} credential. Only 1 active credential per type is allowed per account.`);
      return;
    }
    setBusy(type);
    setError(null);
    try {
      const result: any = await api.issueCredential(type);
      if (result.demoNotice) setNotice(result.demoNotice);
      refresh();
    } catch (err: any) {
      setError(err.message || "Failed to issue credential");
    } finally {
      setBusy(null);
    }
  }

  async function revoke(id: string) {
    setError(null);
    try {
      await api.revokeCredential(id, "user-initiated");
      refresh();
    } catch (err: any) {
      setError(err.message || "Failed to revoke credential");
    }
  }

  const displayedCredentials = viewMode === "active"
    ? credentials.filter((c) => c.status === "ACTIVE")
    : credentials;

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <p className="eyebrow">Wallet</p>
      <h1 style={{ fontSize: "2.25rem" }}>Your Credentials</h1>
      <p style={{ maxWidth: 650, color: "var(--slate)" }}>
        Every credential here is represented on-chain only as a zero-knowledge commitment — a
        hash of the underlying value plus a private salt held in your wallet.
        Maximum 1 active credential per type per account.
      </p>

      {notice && (
        <div className="demo-watermark" style={{ marginBottom: 20 }}>
          {notice}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--danger)", borderRadius: 8, color: "#fca5a5", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--slate-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
          Issue New Credential (1 per type limit)
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {TYPES.map((t) => {
            const hasActive = activeTypes.has(t);
            return (
              <button
                key={t}
                className={hasActive ? "btn btn-secondary" : "btn btn-primary"}
                style={hasActive ? { opacity: 0.6, cursor: "not-allowed", borderStyle: "dashed" } : {}}
                disabled={busy === t || hasActive}
                onClick={() => issue(t)}
                title={hasActive ? `Active ${t} credential already exists. Revoke it before issuing a new one.` : `Issue ${t} credential`}
              >
                {busy === t ? "Issuing…" : hasActive ? `✓ ${t} (Active)` : `+ Issue ${t}`}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={`btn ${viewMode === "active" ? "btn-secondary" : ""}`}
            style={viewMode === "active" ? { borderColor: "var(--accent)" } : { opacity: 0.7 }}
            onClick={() => setViewMode("active")}
          >
            Active ({credentials.filter((c) => c.status === "ACTIVE").length})
          </button>
          <button
            className={`btn ${viewMode === "all" ? "btn-secondary" : ""}`}
            style={viewMode === "all" ? { borderColor: "var(--accent)" } : { opacity: 0.7 }}
            onClick={() => setViewMode("all")}
          >
            All History ({credentials.length})
          </button>
        </div>
      </div>

      {displayedCredentials.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <p style={{ margin: 0, color: "var(--slate)" }}>
            {viewMode === "active" ? "No active credentials in your wallet. Click one of the buttons above to issue one." : "No credentials found."}
          </p>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {displayedCredentials.map((c) => (
          <div className="card" key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{c.type}</span>
                <span className={`badge ${c.status === "ACTIVE" ? "badge-active" : c.status === "REVOKED" ? "badge-revoked" : "badge-pending"}`}>
                  {c.status}
                </span>
              </div>
              <div className="mono" style={{ color: "var(--slate)", fontSize: "0.82rem", marginTop: 4 }}>
                {c.commitment}
              </div>
              <div style={{ color: "var(--slate-dim)", fontSize: "0.82rem", marginTop: 4 }}>
                Issued by {c.issuer} on {new Date(c.issuedAt || c.createdAt).toLocaleDateString()}
                {c.status === "REVOKED" && c.revokedAt && ` · Revoked on ${new Date(c.revokedAt).toLocaleDateString()}`}
                {c.status === "ACTIVE" && ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}`}
              </div>
            </div>
            <div>
              {c.status === "ACTIVE" && (
                <button className="btn btn-danger" onClick={() => revoke(c.id)}>
                  Revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
