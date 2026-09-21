import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { getWalletState, onWalletStateChange, type WalletState, getShortAddress } from "../lib/wallet.js";
import { WalletModal, ConnectWalletButton } from "../components/WalletModal.js";
import DigitalIdCard from "../components/DigitalIdCard.js";

const TYPES = ["PAN", "AADHAAR", "AGE", "RESIDENCY"];

const TYPE_LABELS: Record<string, string> = {
  PAN: "PAN Card",
  AADHAAR: "Aadhaar Digital Pass",
  AGE: "Age Gate Pass (18+)",
  RESIDENCY: "Residency & KYC Pass",
};

const TYPE_DESC: Record<string, string> = {
  PAN: "Zero-knowledge proof of valid tax identifier format",
  AADHAAR: "12-digit numeric identity attestation without biometric disclosure",
  AGE: "Proves age is over 18 without revealing exact date of birth",
  RESIDENCY: "Proves residency in approved jurisdiction without street address",
};

export default function Credentials() {
  const [credentials, setCredentials] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"active" | "all">("active");
  const [walletState, setWalletState] = useState<WalletState>(getWalletState());
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Custom Issuance Modal State
  const [customModalType, setCustomModalType] = useState<string | null>(null);
  const [customVal, setCustomVal] = useState("");
  const [customDob, setCustomDob] = useState("2000-01-01");
  const [customCountry, setCustomCountry] = useState("356");

  useEffect(() => {
    return onWalletStateChange(setWalletState);
  }, []);

  function refresh() {
    api.listCredentials().then((r) => setCredentials(r.credentials || [])).catch(() => {});
  }

  useEffect(refresh, []);

  const activeTypes = new Set(
    credentials.filter((c) => c.status === "ACTIVE").map((c) => c.type)
  );
  const walletConnected = walletState.connected && !!walletState.address;

  async function issue(type: string, customWitness?: any) {
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
      const result: any = await api.issueCredential(type, customWitness);
      if (result.demoNotice) setNotice(result.demoNotice);
      setCustomModalType(null);
      setCustomVal("");
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
      {walletModalOpen && (
        <WalletModal
          onClose={() => setWalletModalOpen(false)}
          onConnected={() => setWalletModalOpen(false)}
        />
      )}

      {/* Custom Issuance Modal */}
      {customModalType && (
        <div className="modal-overlay" onClick={() => setCustomModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Issue Custom {TYPE_LABELS[customModalType]}</h3>
              <button
                onClick={() => setCustomModalType(null)}
                style={{ background: "none", border: "none", color: "var(--slate)", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--slate)", marginBottom: 16 }}>
              Enter custom private witness values. They will be salted and hashed locally before generating the ZK commitment.
            </p>

            {customModalType === "PAN" && (
              <div style={{ marginBottom: 16 }}>
                <label>Custom PAN String (e.g. ABCDE1234F)</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={customVal}
                  onChange={(e) => setCustomVal(e.target.value.toUpperCase())}
                  className="mono"
                />
              </div>
            )}

            {customModalType === "AADHAAR" && (
              <div style={{ marginBottom: 16 }}>
                <label>Custom 12-Digit Aadhaar Number</label>
                <input
                  type="text"
                  placeholder="123456789012"
                  value={customVal}
                  onChange={(e) => setCustomVal(e.target.value)}
                  className="mono"
                />
              </div>
            )}

            {customModalType === "AGE" && (
              <div style={{ marginBottom: 16 }}>
                <label>Private Date of Birth (Witness)</label>
                <input
                  type="date"
                  value={customDob}
                  onChange={(e) => setCustomDob(e.target.value)}
                />
              </div>
            )}

            {customModalType === "RESIDENCY" && (
              <div style={{ marginBottom: 16 }}>
                <label>Country Code (e.g. 356=IND, 840=USA)</label>
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setCustomModalType(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() =>
                  issue(customModalType, {
                    value: customVal,
                    dob: customDob,
                    countryCode: customCountry,
                  })
                }
                disabled={busy === customModalType}
              >
                {busy === customModalType ? "Issuing on Midnight…" : "Generate ZK Credential"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
        <div>
          <p className="eyebrow">Zero-Knowledge Identity Keystore</p>
          <h1 style={{ fontSize: "2.25rem", margin: 0 }}>Digital Identity Wallet</h1>
        </div>

        {walletConnected ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: 12,
              padding: "10px 16px",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--signal-bright)" }} />
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--signal-bright)", fontWeight: 700 }}>
                {walletState.wallet?.name ?? "Midnight Wallet"} (Preprod)
              </div>
              <div className="mono" style={{ fontSize: "0.75rem", color: "var(--slate-bright)" }}>
                {getShortAddress(walletState.address, 12, 6)}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 12,
              padding: "10px 16px",
            }}
          >
            <span>⚠️</span>
            <div>
              <div style={{ fontSize: "0.82rem", color: "var(--withhold)", fontWeight: 700 }}>Wallet Not Connected</div>
              <div style={{ fontSize: "0.75rem", color: "var(--slate)" }}>Required for anchoring ZK commitments</div>
            </div>
            <ConnectWalletButton />
          </div>
        )}
      </div>

      <p style={{ maxWidth: 680, color: "var(--slate)", marginBottom: 32 }}>
        Your personal identity attributes are stored in your private client-side keystore. Only salted cryptographic commitment hashes reside on the Midnight blockchain.
      </p>

      {notice && <div className="demo-watermark" style={{ marginBottom: 20 }}>{notice}</div>}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--danger-dim)",
            border: "1px solid var(--danger)",
            borderRadius: 8,
            color: "#fca5a5",
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Quick Issue Panel */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span className="eyebrow" style={{ margin: 0 }}>⚡ Issue Verified Credential</span>
          <span style={{ fontSize: "0.8rem", color: "var(--slate-dim)" }}>Max 1 active per type</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {TYPES.map((t) => {
            const hasActive = activeTypes.has(t);
            const isBusy = busy === t;

            return (
              <div
                key={t}
                style={{
                  background: hasActive ? "rgba(16, 185, 129, 0.06)" : "var(--ink-raised-2)",
                  border: "1px solid",
                  borderColor: hasActive ? "rgba(16, 185, 129, 0.25)" : "var(--ink-line)",
                  borderRadius: 12,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <strong style={{ color: hasActive ? "var(--signal-bright)" : "var(--paper)", fontSize: "0.95rem" }}>
                      {TYPE_LABELS[t]}
                    </strong>
                    {hasActive && <span className="badge badge-active" style={{ fontSize: "0.68rem" }}>Active</span>}
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--slate-dim)", margin: "0 0 12px" }}>
                    {TYPE_DESC[t]}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: "7px 12px", fontSize: "0.8rem" }}
                    disabled={isBusy || hasActive || !walletConnected}
                    onClick={() => issue(t)}
                  >
                    {isBusy ? "Issuing…" : hasActive ? "✓ Active" : "Quick Issue"}
                  </button>
                  {!hasActive && walletConnected && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "7px 10px", fontSize: "0.8rem" }}
                      title="Custom values"
                      onClick={() => setCustomModalType(t)}
                    >
                      ⚙
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credentials Grid */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Your Identity Cards</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {(["active", "all"] as const).map((mode) => (
            <button
              key={mode}
              className={`btn ${viewMode === mode ? "btn-secondary" : ""}`}
              style={{
                padding: "6px 14px",
                fontSize: "0.82rem",
                borderColor: viewMode === mode ? "var(--accent-bright)" : "transparent",
                color: viewMode === mode ? "#ffffff" : "var(--slate)",
              }}
              onClick={() => setViewMode(mode)}
            >
              {mode === "active"
                ? `Active Cards (${credentials.filter((c) => c.status === "ACTIVE").length})`
                : `All History (${credentials.length})`}
            </button>
          ))}
        </div>
      </div>

      {displayedCredentials.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <p style={{ fontSize: "1.05rem", color: "var(--slate)", margin: "0 0 16px" }}>
            {viewMode === "active"
              ? "No active identity cards. Connect a Midnight wallet and issue your first credential above."
              : "No credentials found in your identity history."}
          </p>
          {!walletConnected && <ConnectWalletButton />}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {displayedCredentials.map((c) => (
            <DigitalIdCard key={c.id} credential={c} onRevoke={revoke} />
          ))}
        </div>
      )}
    </main>
  );
}
