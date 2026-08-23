import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const TYPES = ["PAN", "AADHAAR", "AGE", "RESIDENCY"];

export default function Credentials() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function refresh() {
    api.listCredentials().then((r) => setCredentials(r.credentials));
  }

  useEffect(refresh, []);

  async function issue(type: string) {
    setBusy(type);
    try {
      const result: any = await api.issueCredential(type);
      if (result.demoNotice) setNotice(result.demoNotice);
      refresh();
    } finally {
      setBusy(null);
    }
  }

  async function revoke(id: string) {
    await api.revokeCredential(id, "user-initiated");
    refresh();
  }

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <p className="eyebrow">Wallet</p>
      <h1 style={{ fontSize: "2.25rem" }}>Your credentials</h1>
      <p style={{ maxWidth: 600 }}>
        Every credential here is represented on-chain only as a commitment — a
        hash of the underlying value plus a private salt held in your wallet.
        The PAN, Aadhaar, or date of birth itself is never uploaded.
      </p>

      {notice && (
        <div className="demo-watermark" style={{ marginBottom: 20 }}>
          {notice}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
        {TYPES.map((t) => (
          <button key={t} className="btn btn-secondary" disabled={busy === t} onClick={() => issue(t)}>
            {busy === t ? "Issuing…" : `Issue ${t} credential`}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {credentials.map((c) => (
          <div className="card" key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600 }}>{c.type}</div>
              <div className="mono" style={{ color: "var(--slate)", fontSize: "0.85rem" }}>
                {c.commitment}
              </div>
              <div style={{ color: "var(--slate-dim)", fontSize: "0.85rem", marginTop: 4 }}>
                Issued by {c.issuer} · expires {new Date(c.expiresAt).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className={`badge ${c.status === "ACTIVE" ? "badge-active" : c.status === "REVOKED" ? "badge-revoked" : "badge-pending"}`}>
                {c.status}
              </span>
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
