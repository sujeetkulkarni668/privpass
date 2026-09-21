import { useState } from "react";
import { getShortAddress } from "../lib/wallet.js";

interface DigitalIdCardProps {
  credential: {
    id: string;
    type: string;
    commitment: string;
    issuer: string;
    issuedAt?: string;
    createdAt?: string;
    expiresAt?: string;
    status: string;
  };
  onRevoke?: (id: string) => void;
}

const TYPE_CONFIG: Record<
  string,
  {
    title: string;
    subtitle: string;
    className: string;
    flag: string;
    icon: string;
    accentColor: string;
  }
> = {
  PAN: {
    title: "Income Tax Department",
    subtitle: "Permanent Account Number Card",
    className: "card-pan",
    flag: "🇮🇳",
    icon: "💳",
    accentColor: "#3b82f6",
  },
  AADHAAR: {
    title: "Unique Identification Authority",
    subtitle: "Aadhaar Digital Pass",
    className: "card-aadhaar",
    flag: "🇮🇳",
    icon: "🪪",
    accentColor: "#f59e0b",
  },
  AGE: {
    title: "Midnight ZK Age Gate",
    subtitle: "Age-over-18 Verified Pass",
    className: "card-age",
    flag: "🛡️",
    icon: "🔞",
    accentColor: "#10b981",
  },
  RESIDENCY: {
    title: "Global Residency Attestation",
    subtitle: "KYC Tier 2 Jurisdiction Pass",
    className: "card-residency",
    flag: "🌐",
    icon: "📍",
    accentColor: "#8b5cf6",
  },
};

export default function DigitalIdCard({ credential, onRevoke }: DigitalIdCardProps) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const cfg = TYPE_CONFIG[credential.type] || {
    title: "Zero-Knowledge Credential",
    subtitle: `${credential.type} Attestation`,
    className: "card-pan",
    flag: "🔐",
    icon: "📜",
    accentColor: "#3b82f6",
  };

  const isActive = credential.status === "ACTIVE";
  const issueDate = new Date(credential.issuedAt || credential.createdAt || Date.now()).toLocaleDateString();
  const expDate = credential.expiresAt ? new Date(credential.expiresAt).toLocaleDateString() : "Permanent";

  function copyCommitment() {
    navigator.clipboard.writeText(credential.commitment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`digital-id-card ${cfg.className}`}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--slate)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
            {cfg.flag} {cfg.title}
          </div>
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", marginTop: 2 }}>
            {cfg.subtitle}
          </div>
        </div>
        <span
          className={`badge ${
            isActive ? "badge-active" : credential.status === "REVOKED" ? "badge-revoked" : "badge-pending"
          }`}
        >
          {credential.status}
        </span>
      </div>

      {/* Chip & Icon */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="digital-id-chip" />
        <span style={{ fontSize: "1.6rem", opacity: 0.9 }}>{cfg.icon}</span>
      </div>

      {/* Commitment Hash */}
      <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "8px 12px", borderRadius: 8, marginBottom: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: "0.68rem", color: "var(--slate-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
          On-Chain ZK Commitment
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono" style={{ fontSize: "0.82rem", color: "var(--paper)" }}>
            {getShortAddress(credential.commitment, 14, 8)}
          </span>
          <button
            onClick={copyCommitment}
            style={{
              background: "transparent",
              border: "none",
              color: copied ? "var(--signal-bright)" : "var(--slate)",
              cursor: "pointer",
              fontSize: "0.75rem",
              padding: "2px 6px",
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Dates & Issuer Metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: "0.78rem", color: "var(--slate)", marginBottom: 16 }}>
        <div>
          <span style={{ color: "var(--slate-dim)", display: "block", fontSize: "0.7rem" }}>ISSUED</span>
          <strong style={{ color: "var(--paper)" }}>{issueDate}</strong>
        </div>
        <div>
          <span style={{ color: "var(--slate-dim)", display: "block", fontSize: "0.7rem" }}>EXPIRES</span>
          <strong style={{ color: "var(--paper)" }}>{expDate}</strong>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{ background: "none", border: "none", color: "var(--accent-bright)", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
        >
          {showDetails ? "▲ Hide Cryptography" : "▼ Inspect ZK Proof"}
        </button>

        {isActive && onRevoke && (
          <button
            onClick={() => onRevoke(credential.id)}
            className="btn btn-danger"
            style={{ padding: "4px 10px", fontSize: "0.78rem" }}
          >
            Revoke
          </button>
        )}
      </div>

      {/* Expanded Cryptographic Details */}
      {showDetails && (
        <div style={{ marginTop: 12, padding: "10px", background: "rgba(0,0,0,0.4)", borderRadius: 8, fontSize: "0.75rem" }}>
          <div style={{ color: "var(--slate-dim)", marginBottom: 4 }}>
            Full Commitment: <span className="mono" style={{ color: "var(--slate-bright)", wordBreak: "break-all" }}>{credential.commitment}</span>
          </div>
          <div style={{ color: "var(--slate-dim)" }}>
            Issuer Identity: <span className="mono" style={{ color: "var(--slate-bright)" }}>{credential.issuer}</span>
          </div>
        </div>
      )}
    </div>
  );
}
