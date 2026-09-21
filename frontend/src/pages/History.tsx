import { useEffect, useState } from "react";
import { api, CLAIM_LABELS } from "../lib/api.js";
import { getShortAddress } from "../lib/wallet.js";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.listVerificationHistory().then((r) => setVerifications(r.verifications || [])).catch(() => setVerifications([])),
      api.listCredentialHistory().then((r) => setCredentials(r.credentials || [])).catch(() => setCredentials([])),
    ]).finally(() => setLoading(false));
  }, []);

  const filteredVerifications = verifications.filter(
    (v) =>
      v.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.claims.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCredentials = credentials.filter(
    (c) =>
      c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commitment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      {/* Proof Certificate Modal */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ border: "1px solid var(--signal)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className="badge badge-active">Cryptographic Verification Receipt</span>
              <button onClick={() => setSelectedEntry(null)} style={{ background: "none", border: "none", color: "var(--slate)", fontSize: "1.2rem", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: "1.5rem", margin: "0 0 12px" }}>Midnight Preprod Attestation</h2>
            <div style={{ background: "var(--ink)", padding: 16, borderRadius: 8, fontSize: "0.85rem", marginBottom: 16 }}>
              <div style={{ marginBottom: 6 }}>
                <strong>Organization:</strong> {selectedEntry.organizationName}
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>Verified Timestamp:</strong> {new Date(selectedEntry.verifiedAt).toLocaleString()}
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>Request ID:</strong> <span className="mono">{selectedEntry.id}</span>
              </div>
              <div style={{ marginBottom: 6 }}>
                <strong>Attested Claims:</strong> {selectedEntry.claims.join(", ")}
              </div>
              <div>
                <strong>Midnight Consensus Status:</strong> <span style={{ color: "var(--signal-bright)" }}>CONFIRMED (ZK-SNARK)</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                Print / Export Certificate
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedEntry(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="eyebrow">Verifiable Audit Trail</p>
      <h1 style={{ fontSize: "2.25rem" }}>Activity & Audit Log</h1>
      <p style={{ maxWidth: 650, color: "var(--slate)", marginBottom: 28 }}>
        Complete verifiable timeline of your zero-knowledge selective disclosures and credential lifecycle state changes.
      </p>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={`btn ${activeTab === "verifications" ? "btn-accent" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
            onClick={() => setActiveTab("verifications")}
          >
            Verifications ({verifications.length})
          </button>
          <button
            className={`btn ${activeTab === "credentials" ? "btn-accent" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
            onClick={() => setActiveTab("credentials")}
          >
            Credential Events ({credentials.length})
          </button>
        </div>

        <div style={{ minWidth: 260 }}>
          <input
            type="text"
            placeholder="Search by organization or claim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: "8px 14px", fontSize: "0.88rem" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <div className="spinner" style={{ margin: "0 auto 12px" }} />
          <p style={{ margin: 0, color: "var(--slate)" }}>Loading verifiable audit log…</p>
        </div>
      ) : activeTab === "verifications" ? (
        filteredVerifications.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ margin: 0, color: "var(--slate)" }}>
              No verification records match your search.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredVerifications.map((e) => (
              <div
                key={e.id}
                className="card card-interactive"
                onClick={() => setSelectedEntry(e)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#ffffff" }}>
                    {e.organizationName}
                  </div>
                  <div className="mono" style={{ color: "var(--slate)", fontSize: "0.85rem", marginTop: 4 }}>
                    Disclosed: {e.claims.map((c) => CLAIM_LABELS[c] ?? c).join(", ")}
                  </div>
                  <div style={{ color: "var(--slate-dim)", fontSize: "0.78rem", marginTop: 4 }}>
                    Request ID: <span className="mono">{getShortAddress(e.id, 12, 6)}</span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${e.result === "VERIFIED" || e.proofValid ? "badge-active" : "badge-revoked"}`}>
                    {e.result === "COMPLETED" ? (e.proofValid ? "VERIFIED" : "FAILED") : e.result}
                  </span>
                  <div style={{ color: "var(--slate-dim)", fontSize: "0.78rem", marginTop: 6 }}>
                    {new Date(e.verifiedAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--accent-bright)", marginTop: 4 }}>
                    View Receipt ↗
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredCredentials.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ margin: 0, color: "var(--slate)" }}>No credential lifecycle events found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredCredentials.map((c) => (
              <div className="card" key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{c.type} Credential</span>
                      <span className={`badge ${c.status === "ACTIVE" ? "badge-active" : c.status === "REVOKED" ? "badge-revoked" : "badge-pending"}`}>
                        {c.status}
                      </span>
                    </div>
                    <div className="mono" style={{ color: "var(--slate)", fontSize: "0.8rem", marginTop: 4 }}>
                      Commitment: {getShortAddress(c.commitment, 16, 8)}
                    </div>
                    <div style={{ color: "var(--slate-dim)", fontSize: "0.78rem", marginTop: 4 }}>
                      Issuer: {c.issuer} · Issued: {new Date(c.issuedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", color: "var(--slate-dim)", fontSize: "0.8rem" }}>
                    {c.status === "REVOKED" && c.revokedAt ? (
                      <span style={{ color: "#fca5a5" }}>Revoked: {new Date(c.revokedAt).toLocaleDateString()}</span>
                    ) : (
                      <span>Expires: {new Date(c.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {c.statusHistory && c.statusHistory.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--ink-line)", paddingTop: 10, marginTop: 10 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--slate-dim)", textTransform: "uppercase" }}>
                      Lifecycle Event Log:
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      {c.statusHistory.map((ev) => (
                        <span key={ev.id} className="badge badge-purple" style={{ fontSize: "0.72rem" }}>
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
