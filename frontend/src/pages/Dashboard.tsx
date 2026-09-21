import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { getWalletState, onWalletStateChange, type WalletState, getShortAddress } from "../lib/wallet.js";
import DigitalIdCard from "../components/DigitalIdCard.js";

export default function Dashboard() {
  const [credentials, setCredentials] = useState<any[] | null>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [walletState, setWalletState] = useState<WalletState>(getWalletState());
  const [error, setError] = useState(false);

  useEffect(() => {
    return onWalletStateChange(setWalletState);
  }, []);

  useEffect(() => {
    api
      .listCredentials()
      .then((r) => setCredentials(r.credentials || []))
      .catch(() => setError(true));

    api
      .listVerificationHistory()
      .then((r) => setVerifications(r.verifications || []))
      .catch(() => {});
  }, []);

  const activeCount = credentials?.filter((c) => c.status === "ACTIVE").length || 0;
  const privacyScore = Math.min(100, Math.max(25, activeCount * 25));

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      {/* Top Banner / Welcome */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <p className="eyebrow">Zero-Knowledge Identity Cockpit</p>
          <h1 style={{ fontSize: "2.4rem", margin: "4px 0 8px" }}>Identity Dashboard</h1>
          <p style={{ color: "var(--slate)", margin: 0 }}>
            Manage your sovereign credentials and monitor zero-knowledge disclosures.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/credentials" className="btn btn-primary">
            + Issue Credential
          </Link>
          <Link to="/verifier/requests/create" className="btn btn-secondary">
            Business Portal
          </Link>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 24, border: "1px solid var(--accent)" }}>
          <p style={{ margin: 0 }}>
            Sign in to synchronize your identity credentials. <Link to="/login" style={{ color: "var(--accent-bright)", fontWeight: "bold" }}>Sign in →</Link>
          </p>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {/* Privacy Score Card */}
        <div className="card" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--ink-raised) 100%)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <div className="eyebrow" style={{ color: "var(--signal-bright)" }}>Privacy Index</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--signal-bright)", margin: "6px 0 2px" }}>
            {privacyScore}%
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--slate-dim)", margin: 0 }}>
            {activeCount >= 3 ? "Maximum protection active" : "Issue more credentials to increase coverage"}
          </p>
        </div>

        {/* Active Credentials Card */}
        <div className="card">
          <div className="eyebrow">Active ZK Credentials</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "#ffffff", margin: "6px 0 2px" }}>
            {activeCount}
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--slate)", margin: 0 }}>
            Anchored on Midnight Preprod
          </p>
        </div>

        {/* Verifications Completed Card */}
        <div className="card">
          <div className="eyebrow">Completed Disclosures</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--accent-bright)", margin: "6px 0 2px" }}>
            {verifications.length}
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--slate)", margin: 0 }}>
            Zero raw PII disclosed
          </p>
        </div>

        {/* Connected Wallet Card */}
        <div className="card">
          <div className="eyebrow">Midnight Keystore</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ffffff", margin: "8px 0 4px" }}>
            {walletState.connected ? walletState.wallet?.name ?? "Connected" : "Disconnected"}
          </div>
          <div className="mono" style={{ fontSize: "0.75rem", color: "var(--slate-dim)" }}>
            {walletState.connected ? getShortAddress(walletState.address, 10, 6) : "No wallet linked"}
          </div>
        </div>
      </div>

      {/* Quick Launch Banner: Circuit Simulator */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
          border: "1px solid rgba(96, 165, 250, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div>
          <div className="eyebrow" style={{ color: "var(--accent-bright)" }}>Developer & Evaluator Tool</div>
          <h3 style={{ margin: "4px 0 6px", fontSize: "1.25rem" }}>
            Test Compact Smart Contract Circuits Live
          </h3>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--slate)" }}>
            Experiment with PAN format constraints, age thresholds, residency matching, and tamper tests.
          </p>
        </div>
        <Link to="/circuits" className="btn btn-accent">
          Launch ZK Studio ⚡
        </Link>
      </div>

      {/* Identity Cards Row */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Your Identity Cards</h2>
          <Link to="/credentials" style={{ fontSize: "0.85rem", color: "var(--accent-bright)", fontWeight: 600 }}>
            View all ({credentials?.length || 0}) →
          </Link>
        </div>

        {credentials && credentials.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "36px 16px" }}>
            <p style={{ color: "var(--slate)", margin: "0 0 12px" }}>
              You haven't issued any zero-knowledge credentials yet.
            </p>
            <Link to="/credentials" className="btn btn-primary">
              Issue Your First ID Card
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
            {credentials?.slice(0, 3).map((c) => (
              <DigitalIdCard key={c.id} credential={c} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Disclosures */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Recent Disclosures & Verifications</h2>
          <Link to="/history" style={{ fontSize: "0.85rem", color: "var(--accent-bright)", fontWeight: 600 }}>
            View complete audit trail →
          </Link>
        </div>

        {verifications.length === 0 ? (
          <div className="card">
            <p style={{ margin: 0, color: "var(--slate)" }}>
              No verifications recorded yet. Scan a business QR code or create a test request to see verifiable receipts here.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {verifications.slice(0, 3).map((v) => (
              <div key={v.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
                <div>
                  <strong style={{ fontSize: "0.95rem" }}>{v.organizationName}</strong>
                  <div className="mono" style={{ fontSize: "0.8rem", color: "var(--slate)", marginTop: 2 }}>
                    Claims: {v.claims.join(", ")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="badge badge-active">Verified</span>
                  <div style={{ fontSize: "0.75rem", color: "var(--slate-dim)", marginTop: 4 }}>
                    {new Date(v.verifiedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
