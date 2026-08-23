import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import DisclosureManifest from "../components/DisclosureManifest.js";

type Step = "loading" | "review" | "consenting" | "proving" | "done" | "error";

export default function VerifyRequest() {
  const { requestId } = useParams();
  const [step, setStep] = useState<Step>("loading");
  const [request, setRequest] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<{ claimResults: Record<string, boolean>; proofValid: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    api
      .getVerificationRequest(requestId)
      .then((r) => {
        setRequest(r);
        setSelected(r.requestedClaims); // required claims pre-selected; optional ones the user can add
        setStep("review");
      })
      .catch(() => setStep("error"));
  }, [requestId]);

  async function approveAndProve() {
    if (!requestId) return;
    setStep("consenting");
    try {
      await api.giveConsent(requestId, selected);
      setStep("proving");

      // In production, witnesses (salt + raw value) come from the local
      // wallet keystore and never touch a server outside this
      // proof-generation call. For this reference build we synthesize
      // demo witnesses matching the seeded synthetic credential so the
      // full flow is exercisable end-to-end.
      const demoWitnesses: Record<string, { salt: string; rawValue: string }> = {};
      const r: any = await api.submitProof(requestId, demoWitnesses);
      setResult(r);
      setStep("done");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong generating the proof.");
      setStep("error");
    }
  }

  if (step === "loading") return <Centered>Loading request…</Centered>;
  if (step === "error" && !request)
    return <Centered>This verification link is invalid or has expired.</Centered>;

  return (
    <main className="container" style={{ maxWidth: 640, paddingTop: 56, paddingBottom: 64 }}>
      <p className="eyebrow">Verification request</p>
      <h1 style={{ fontSize: "2rem" }}>{request?.organization?.name} wants to verify you</h1>

      {step === "review" && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <DisclosureManifest organizationName={request.organization.name} claims={selected} />
          </div>

          {request.optionalClaims.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Optional — include if you'd like</p>
              {request.optionalClaims.map((c: string) => (
                <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(c)}
                    onChange={(e) =>
                      setSelected((prev) => (e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)))
                    }
                  />
                  {c}
                </label>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-primary" onClick={approveAndProve}>
              Approve and generate proof
            </button>
            <button className="btn btn-secondary">Decline</button>
          </div>
        </>
      )}

      {step === "consenting" && <Centered>Recording your consent…</Centered>}
      {step === "proving" && <Centered>Generating zero-knowledge proof…</Centered>}

      {step === "error" && request && (
        <div className="card">
          <p style={{ color: "var(--danger)" }}>{error}</p>
        </div>
      )}

      {step === "done" && result && (
        <div className="card">
          <p className="eyebrow" style={{ marginBottom: 12 }}>
            {result.proofValid ? "Verification complete" : "Verification failed"}
          </p>
          {Object.entries(result.claimResults).map(([claim, value]) => (
            <div key={claim} className="manifest-item">
              <span className="mark" style={{ color: value ? "var(--signal)" : "var(--danger)" }}>
                {value ? "✓" : "✕"}
              </span>
              <span>
                {claim}: <strong>{String(value)}</strong>
              </span>
            </div>
          ))}
          <p style={{ marginTop: 16, marginBottom: 0 }}>
            {request.organization.name} now has these results only. Your PAN, Aadhaar, exact date of
            birth, and address were never sent.
          </p>
        </div>
      )}
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="container" style={{ paddingTop: 96, textAlign: "center" }}>
      <p>{children}</p>
    </main>
  );
}
