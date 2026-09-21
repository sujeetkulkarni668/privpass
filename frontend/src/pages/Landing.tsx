import { Link } from "react-router-dom";
import DisclosureManifest from "../components/DisclosureManifest.js";
import Logo from "../components/Logo.js";

export default function Landing() {
  return (
    <main>
      {/* Hero Section */}
      <section className="container" style={{ paddingTop: 72, paddingBottom: 64, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Logo size={64} showText={false} />
        </div>
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 16 }}>
          ⚡ Midnight Network · Compact Smart Contracts · Zero-Knowledge Identity
        </div>

        <h1 style={{ maxWidth: 840, margin: "0 auto 20px" }}>
          Verify Identity.
          <br />
          <span style={{ color: "var(--signal-bright)" }}>Reveal Nothing Unnecessary.</span>
        </h1>
        <p style={{ maxWidth: 640, fontSize: "1.15rem", margin: "0 auto 32px", color: "var(--slate)" }}>
          PrivPass replaces honeypots of plaintext identity documents with client-side Zero-Knowledge proofs on Midnight. Prove you're over 18, tax-compliant, or in-region without handing over documents.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }}>
            Open Identity Wallet
          </Link>
          <Link to="/circuits" className="btn btn-accent" style={{ padding: "14px 24px", fontSize: "1rem" }}>
            Test ZK Circuits Live ⚡
          </Link>
          <Link to="/verifier/requests/create" className="btn btn-secondary" style={{ padding: "14px 24px", fontSize: "1rem" }}>
            For Businesses & Verifiers
          </Link>
        </div>
      </section>

      {/* Signature UI: The Disclosure Manifest */}
      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="card" style={{ border: "1px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p className="eyebrow" style={{ margin: 0 }}>
              The PrivPass Disclosure Contract
            </p>
            <span className="badge badge-active">Cryptographically Enforced</span>
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--slate)", marginBottom: 20 }}>
            Both the user and the verifier agree on this exact disclosure manifest before any cryptographic proof is executed:
          </p>
          <DisclosureManifest organizationName="Apex Global Finance" claims={["PAN_VALID", "AGE_OVER_18"]} />
        </div>
      </section>

      {/* Comparison Matrix: Traditional KYC vs PrivPass */}
      <section className="container" style={{ paddingBottom: 80 }}>
        <h2 style={{ textAlign: "center", marginBottom: 36 }}>Traditional KYC vs. PrivPass</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {/* Traditional KYC */}
          <div className="card" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
            <h3 style={{ color: "#fca5a5", display: "flex", alignItems: "center", gap: 8 }}>
              <span>✕</span> Traditional KYC & Identity
            </h3>
            <ul style={{ paddingLeft: 20, color: "var(--slate)", fontSize: "0.9rem", lineHeight: 1.8 }}>
              <li>Centralized servers store high-risk plaintext PAN & Aadhaar PDFs.</li>
              <li>Exposes full name, birth date, parentage, and physical address.</li>
              <li>Massive compliance burden under GDPR Article 5 and DPDP Act.</li>
              <li>Database breaches compromise lifelong biometric and tax data.</li>
            </ul>
          </div>

          {/* PrivPass Zero-Knowledge */}
          <div className="card" style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
            <h3 style={{ color: "var(--signal-bright)", display: "flex", alignItems: "center", gap: 8 }}>
              <span>✓</span> PrivPass (Midnight + Compact)
            </h3>
            <ul style={{ paddingLeft: 20, color: "var(--paper)", fontSize: "0.9rem", lineHeight: 1.8 }}>
              <li>Private witnesses stay in client-side secure enclave.</li>
              <li>Verifier receives only mathematical boolean answers (e.g. <code>AGE_OVER_18: true</code>).</li>
              <li>Zero raw PII stored in databases or logged on-chain.</li>
              <li>Replay-resistant nullifiers provide Sybil resistance without tracking.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4-Step How It Works */}
      <section className="container" style={{ paddingBottom: 96 }}>
        <h2 style={{ textAlign: "center", marginBottom: 36 }}>How Zero-Knowledge Identity Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
          {[
            ["1. Business Requests Claims", "The verifier specifies exact claims needed (e.g. age ≥ 18, valid tax format) rather than collecting raw scans."],
            ["2. You Review & Consent", "Your wallet visualizes the exact attributes disclosed versus those strictly withheld."],
            ["3. Local ZK Prover Runs", "A Compact SNARK circuit computes constraints directly inside your browser without leaking witness data."],
            ["4. Midnight Ledger Attestation", "The business receives a tamper-proof cryptographic attestation registered on Midnight consensus."],
          ].map(([title, body], i) => (
            <div className="card" key={i}>
              <div className="badge badge-blue" style={{ marginBottom: 12 }}>Step 0{i + 1}</div>
              <h3 style={{ fontSize: "1.1rem" }}>{title}</h3>
              <p style={{ fontSize: "0.88rem", marginBottom: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
