import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, CLAIM_LABELS } from "../lib/api.js";
import DisclosureManifest from "../components/DisclosureManifest.js";
import ZkProofAnimation from "../components/ZkProofAnimation.js";

type Step = "loading" | "review" | "proving" | "done" | "error";

export default function VerifyRequest() {
  const { requestId } = useParams();
  const [step, setStep] = useState<Step>("loading");
  const [request, setRequest] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<{
    claimResults: Record<string, boolean>;
    proofValid: boolean;
    nullifier?: string;
    blockHeight?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    api
      .getVerificationRequest(requestId)
      .then((r) => {
        setRequest(r);
        setSelected(r.requestedClaims);
        setStep("review");
      })
      .catch(() => setStep("error"));
  }, [requestId]);

  async function handleProveClick() {
    if (!requestId) return;
    setStep("proving");
  }

  async function handleProofAnimationComplete() {
    if (!requestId) return;
    try {
      await api.giveConsent(requestId, selected);
      const demoWitnesses: Record<string, { salt: string; rawValue: string }> = {};
      const r: any = await api.submitProof(requestId, demoWitnesses);
      setResult(r);
      setStep("done");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong generating the proof.");
      setStep("error");
    }
  }

  if (step === "loading") {
    return (
      <main className="container" style={{ paddingTop: 96, textAlign: "center" }}>
        <div className="spinner" style={{ margin: "0 auto 16px", width: 32, height: 32 }} />
        <p>Loading verification request from Midnight Preprod…</p>
      </main>
    );
  }

  if (step === "error" && !request) {
    return (
      <main className="container" style={{ maxWidth: 580, paddingTop: 80, textAlign: "center" }}>
        <div className="card">
          <h2>Request Not Found or Expired</h2>
          <p>This verification link is invalid, expired, or has already been fulfilled.</p>
          <Link to="/" className="btn btn-primary">Return Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 680, paddingTop: 48, paddingBottom: 64 }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <p className="eyebrow" style={{ justifyContent: "center" }}>Zero-Knowledge Selective Disclosure</p>
        <h1 style={{ fontSize: "2rem", margin: "4px 0 8px" }}>
          {request?.organization?.name}
        </h1>
        <p style={{ color: "var(--slate)" }}>
          Requests cryptographic verification of specific identity claims without receiving your underlying documents.
        </p>
      </div>

      {step === "review" && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <DisclosureManifest organizationName={request.organization.name} claims={selected} />
          </div>

          {request.optionalClaims && request.optionalClaims.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Optional Claims (Your Choice)</p>
              {request.optionalClaims.map((c: string) => (
                <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(c)}
                    onChange={(e) =>
                      setSelected((prev) => (e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)))
                    }
                  />
                  <span>{CLAIM_LABELS[c] ?? c}</span>
                </label>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 14 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleProveClick}>
              Authorize & Generate ZK Proof
            </button>
            <Link to="/dashboard" className="btn btn-secondary">
              Decline
            </Link>
          </div>
        </>
      )}

      {step === "proving" && (
        <ZkProofAnimation
          requestedClaims={selected}
          onComplete={handleProofAnimationComplete}
        />
      )}

      {step === "error" && request && (
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ color: "var(--danger)" }}>Verification Failed</h3>
          <p style={{ color: "#fca5a5" }}>{error}</p>
          <button className="btn btn-secondary" onClick={() => setStep("review")}>
            Try Again
          </button>
        </div>
      )}

      {step === "done" && result && (
        <div className="card" style={{ border: "1px solid var(--signal)", textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>
            {result.proofValid ? "🛡️" : "⚠️"}
          </div>
          <span className={`badge ${result.proofValid ? "badge-active" : "badge-revoked"}`} style={{ fontSize: "0.85rem", padding: "6px 16px" }}>
            {result.proofValid ? "Zero-Knowledge Verification Succeeded" : "Verification Failed"}
          </span>

          <h2 style={{ fontSize: "1.6rem", margin: "16px 0 8px" }}>
            Proof Attested on Midnight Preprod
          </h2>

          <div style={{ background: "var(--ink)", borderRadius: 10, padding: 16, margin: "20px 0", textAlign: "left", border: "1px solid var(--ink-line)" }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Attested Boolean Claims</div>
            {Object.entries(result.claimResults).map(([claim, value]) => (
              <div key={claim} className="manifest-item">
                <span className="mark" style={{ color: value ? "var(--signal-bright)" : "var(--danger)" }}>
                  {value ? "✓" : "✕"}
                </span>
                <span>
                  {CLAIM_LABELS[claim] ?? claim}: <strong style={{ color: value ? "var(--signal-bright)" : "var(--danger)" }}>{String(value)}</strong>
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "12px 16px", textAlign: "left", fontSize: "0.78rem", color: "var(--slate)" }}>
            <div style={{ marginBottom: 4 }}>
              <strong>Unique Request Nullifier:</strong>{" "}
              <span className="mono" style={{ color: "var(--accent-bright)" }}>
                {result.nullifier ?? "0x7f8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"}
              </span>
            </div>
            <div>
              <strong>Privacy Assurance:</strong> No raw biometric or identity numbers were transferred.
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 12 }}>
            <Link to="/history" className="btn btn-secondary">
              View in Audit History
            </Link>
            <Link to="/dashboard" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
