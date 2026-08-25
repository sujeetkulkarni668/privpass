import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { getWalletState, onWalletStateChange, type WalletState } from "../lib/wallet.js";
import { WalletModal, ConnectWalletButton } from "../components/WalletModal.js";

const TYPES = ["PAN", "AADHAAR", "AGE", "RESIDENCY"];

const TYPE_LABELS: Record<string, string> = {
  PAN:       "PAN Card",
  AADHAAR:   "Aadhaar",
  AGE:       "Age Proof",
  RESIDENCY: "Residency",
};

const TYPE_DESC: Record<string, string> = {
  PAN:       "Permanent Account Number — Income Tax identity",
  AADHAAR:   "12-digit unique identity number",
  AGE:       "Zero-knowledge age-over-18 proof",
  RESIDENCY: "Address / residency verification",
};

export default function Credentials() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"active" | "all">("active");
  const [walletState, setWalletState] = useState<WalletState>(getWalletState());
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    return onWalletStateChange(setWalletState);
  }, []);

  function refresh() {
    api.listCredentials().then((r) => setCredentials(r.credentials));
  }

  useEffect(refresh, []);

  const activeTypes = new Set(
    credentials.filter((c) => c.status === "ACTIVE").map((c) => c.type)
  );
  const walletConnected = walletState.connected && !!walletState.address;

  async function issue(type: string) {
    if (!walletConnected) {
      setWalletModalOpen(true);
      return;
    }
    if (activeTypes.has(type)) {
      setError(`You already have an active ${type} credential. Revoke it before issuing a new one.`);
      return;
    }
    setBusy(type);
    setError(null);
    try {
      const result: any = await api.issueCredential(type);
      if (result.demoNotice) setNotice(result.demoNotice);
      refresh();
    } catch (err: any) {
      if (err.code === "wallet_required") {
        setWalletModalOpen(true);
      } else {
        setError(err.message_detail ?? err.message ?? "Failed to issue credential");
      }
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

  const displayedCredentials =
    viewMode === "active"
      ? credentials.filter((c) => c.status === "ACTIVE")
      : credentials;

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      {/* Wallet modal */}
      {walletModalOpen && (
        <WalletModal
          onClose={() => setWalletModalOpen(false)}
          onConnected={() => setWalletModalOpen(false)}
        />
      )}

      <p className="eyebrow">Identity Wallet</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
        <h1 style={{ fontSize: "2.25rem", margin: 0 }}>Your Credentials</h1>
        {/* Inline wallet status — also in topbar, this is extra context */}
        {walletConnected ? (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(62, 207, 142, 0.08)",
              border: "1px solid rgba(62, 207, 142, 0.25)",
              borderRadius: 10, padding: "8px 14px",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--signal)", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--signal)", fontWeight: 600 }}>
                {walletState.wallet?.name ?? "Wallet"} connected
              </div>
              <div className="mono" style={{ fontSize: "0.72rem", color: "var(--slate)", wordBreak: "break-all" }}>
                {walletState.address}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(232,163,61,0.08)",
              border: "1px solid rgba(232,163,61,0.25)",
              borderRadius: 10, padding: "10px 16px",
            }}
          >
            <span style={{ fontSize: "1rem" }}>⚠</span>
            <div>
              <div style={{ fontSize: "0.82rem", color: "var(--withhold)", fontWeight: 600 }}>Wallet not connected</div>
              <div style={{ fontSize: "0.75rem", color: "var(--slate-dim)" }}>Required to issue documents</div>
            </div>
            <ConnectWalletButton />
          </div>
        )}
      </div>

      <p style={{ maxWidth: 650, color: "var(--slate)", marginBottom: 32 }}>
        Every credential is anchored as a zero-knowledge commitment on the Midnight
        blockchain. Only the commitment hash is stored — never the underlying document
        data. Maximum 1 active credential per type.
      </p>

      {notice && (
        <div className="demo-watermark" style={{ marginBottom: 20 }}>
          {notice}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid var(--danger)",
            borderRadius: 8, color: "#fca5a5", marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Issue buttons */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--slate-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Issue New Credential
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {TYPES.map((t) => {
            const hasActive = activeTypes.has(t);
            const isBusy = busy === t;
            return (
              <button
                key={t}
                disabled={isBusy || hasActive}
                onClick={() => issue(t)}
                title={
                  hasActive
                    ? `Active ${t} credential already exists. Revoke it first.`
                    : !walletConnected
                    ? "Connect a Midnight wallet to issue credentials"
                    : `Issue ${TYPE_LABELS[t]} credential`
                }
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
                  padding: "14px 16px",
                  background: hasActive
                    ? "rgba(62, 207, 142, 0.06)"
                    : !walletConnected
                    ? "rgba(232,163,61,0.05)"
                    : "var(--ink-raised-2)",
                  border: "1px solid",
                  borderColor: hasActive
                    ? "rgba(62, 207, 142, 0.2)"
                    : !walletConnected
                    ? "rgba(232,163,61,0.2)"
                    : "var(--ink-line)",
                  borderRadius: 10,
                  cursor: hasActive || isBusy ? "not-allowed" : "pointer",
                  opacity: hasActive || isBusy ? 0.7 : 1,
                  textAlign: "left",
                  transition: "border-color 0.12s, background 0.12s",
                }}
              >
                <div style={{ fontWeight: 700, color: hasActive ? "var(--signal)" : "var(--paper)", fontSize: "0.9rem" }}>
                  {isBusy ? "Issuing…" : hasActive ? `✓ ${TYPE_LABELS[t]}` : `+ ${TYPE_LABELS[t]}`}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--slate-dim)" }}>{TYPE_DESC[t]}</div>
              </button>
            );
          })}
        </div>
        {!walletConnected && (
          <p style={{ margin: "14px 0 0", fontSize: "0.82rem", color: "var(--slate-dim)" }}>
            👆 Connect your wallet using the button above or in the top navigation bar to enable credential issuance.
          </p>
        )}
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["active", "all"] as const).map((mode) => (
          <button
            key={mode}
            className="btn btn-secondary"
            style={{
              padding: "6px 14px", fontSize: "0.82rem",
              borderColor: viewMode === mode ? "var(--signal)" : "var(--ink-line)",
              color: viewMode === mode ? "var(--signal)" : "var(--slate)",
            }}
            onClick={() => setViewMode(mode)}
          >
            {mode === "active"
              ? `Active (${credentials.filter((c) => c.status === "ACTIVE").length})`
              : `All History (${credentials.length})`}
          </button>
        ))}
      </div>

      {/* Credential list */}
      {displayedCredentials.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 16px" }}>
          <p style={{ margin: 0, color: "var(--slate)" }}>
            {viewMode === "active"
              ? "No active credentials. Connect a wallet and issue your first one above."
              : "No credentials found in your history."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {displayedCredentials.map((c) => (
            <div
              key={c.id}
              className="card"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span>{TYPE_LABELS[c.type] ?? c.type}</span>
                  <span
                    className={`badge ${
                      c.status === "ACTIVE"
                        ? "badge-active"
                        : c.status === "REVOKED"
                        ? "badge-revoked"
                        : "badge-pending"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="mono" style={{ color: "var(--slate)", fontSize: "0.78rem", wordBreak: "break-all" }}>
                  {c.commitment}
                </div>
                <div style={{ color: "var(--slate-dim)", fontSize: "0.78rem", marginTop: 4 }}>
                  Issued by {c.issuer} · {new Date(c.issuedAt ?? c.createdAt).toLocaleDateString()}
                  {c.status === "ACTIVE" && c.expiresAt && ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                  {c.status === "REVOKED" && c.revokedAt && ` · Revoked ${new Date(c.revokedAt).toLocaleDateString()}`}
                </div>
              </div>
              {c.status === "ACTIVE" && (
                <button className="btn btn-danger" style={{ flexShrink: 0 }} onClick={() => revoke(c.id)}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
