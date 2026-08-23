import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

interface VerificationEntry {
  id: string;
  organizationName: string;
  claims: string[];
  result: string;
  verifiedAt: string;
  proofValid: boolean;
}

interface CredentialEntry {
  id: string;
  type: string;
  status: string;
  issuer: string;
  commitment: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
  statusHistory?: { id: string; toStatus: string; reason?: string; createdAt: string }[];
}

export default function History() {
  const [activeTab, setActiveTab] = useState<"verifications" | "credentials">("verifications");
  const [verifications, setVerifications] = useState<VerificationEntry[]>([]);
  const [credentials, setCredentials] = useState<CredentialEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.listVerificationHistory().then((r) => setVerifications(r.verifications || [])).catch(() => setVerifications([])),
      api.listCredentialHistory().then((r) => setCredentials(r.credentials || [])).catch(() => setCredentials([])),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <p className="eyebrow">Audit & History</p>
      <h1 style={{ fontSize: "2.25rem" }}>Activity & History</h1>
      <p style={{ maxWidth: 650, color: "var(--slate)" }}>
        Complete verifiable timeline of your zero-knowledge verifications and credential lifecycle events.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <button
          className={`btn ${activeTab === "verifications" ? "btn-secondary" : ""}`}
          style={activeTab === "verifications" ? { borderColor: "var(--accent)" } : { opacity: 0.7 }}
          onClick={() => setActiveTab("verifications")}
        >
          Verification History ({verifications.length})
        </button>
        <button
          className={`btn ${activeTab === "credentials" ? "btn-secondary" : ""}`}
          style={activeTab === "credentials" ? { borderColor: "var(--accent)" } : { opacity: 0.7 }}
          onClick={() => setActiveTab("credentials")}
        >
          Credential Event History ({credentials.length})
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <p style={{ margin: 0, color: "var(--slate)" }}>Loading history…</p>
        </div>
      ) : activeTab === "verifications" ? (
        verifications.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
            <p style={{ margin: 0, color: "var(--slate)" }}>
              No verifications yet. When you approve a verifier request, the outcome will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {verifications.map((e) => (
              <div className="card" key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{e.organizationName}</div>
                  <div className="mono" style={{ color: "var(--slate)", fontSize: "0.85rem", marginTop: 4 }}>
                    Disclosed Claims: {e.claims.join(", ")}
                  </div>
                  <div style={{ color: "var(--slate-dim)", fontSize: "0.8rem", marginTop: 4 }}>
                    Request ID: {e.id}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${e.result === "VERIFIED" || e.proofValid ? "badge-active" : "badge-revoked"}`}>
                    {e.result === "COMPLETED" ? (e.proofValid ? "VERIFIED" : "FAILED") : e.result}
                  </span>
                  <div style={{ color: "var(--slate-dim)", fontSize: "0.8rem", marginTop: 6 }}>
                    {new Date(e.verifiedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        credentials.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
            <p style={{ margin: 0, color: "var(--slate)" }}>No credentials issued in this account yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {credentials.map((c) => (
              <div className="card" key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{c.type} Credential</span>
                      <span className={`badge ${c.status === "ACTIVE" ? "badge-active" : c.status === "REVOKED" ? "badge-revoked" : "badge-pending"}`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="mono" style={{ color: "var(--slate)", fontSize: "0.82rem", marginTop: 4 }}>
                      Commitment: {c.commitment}
                    </div>
                    <div style={{ color: "var(--slate-dim)", fontSize: "0.82rem", marginTop: 4 }}>
                      Issuer: {c.issuer} · Issued: {new Date(c.issuedAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", color: "var(--slate-dim)", fontSize: "0.8rem" }}>
                    {c.status === "REVOKED" && c.revokedAt ? (
                      <span style={{ color: "#fca5a5" }}>Revoked: {new Date(c.revokedAt).toLocaleString()}</span>
                    ) : (
                      <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {c.statusHistory && c.statusHistory.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 8, marginTop: 8 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--slate-dim)", textTransform: "uppercase" }}>
                      Event Timeline:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                      {c.statusHistory.map((ev) => (
                        <span key={ev.id} style={{ fontSize: "0.78rem", color: "var(--slate)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>
                          {ev.toStatus} ({ev.reason || "event"}) — {new Date(ev.createdAt).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </main>
  );
}
