import { useEffect, useState } from "react";

interface ZkProofAnimationProps {
  onComplete: () => void;
  requestedClaims: string[];
}

const STEPS = [
  { id: 1, title: "1. Synthesizing Private Witness", desc: "Loading salted pre-images from local encrypted keystore." },
  { id: 2, title: "2. Evaluating Compact Circuit Constraints", desc: "Checking format and age arithmetic in zero-knowledge." },
  { id: 3, title: "3. Generating SNARK Proof (π)", desc: "Constructing cryptographic proof without revealing witness." },
  { id: 4, title: "4. Binding Nullifier & Request ID", desc: "Ensuring replay protection and single-use Sybil resistance." },
  { id: 5, title: "5. Verifying on Midnight Preprod", desc: "Anchor boolean claim attestations on Midnight consensus." },
];

export default function ZkProofAnimation({ onComplete, requestedClaims }: ZkProofAnimationProps) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="card" style={{ maxWidth: 580, margin: "0 auto", textAlign: "left" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p className="eyebrow" style={{ margin: 0 }}>
          ⚡ Midnight ZK Prover Pipeline
        </p>
        <span className="badge badge-blue">
          Step {Math.min(currentStep, STEPS.length)} of {STEPS.length}
        </span>
      </div>

      <h3 style={{ fontSize: "1.2rem", marginBottom: 8 }}>
        Proving {requestedClaims.join(" & ")}
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--slate)", marginBottom: 20 }}>
        Your personal data never leaves your device. Only mathematical constraints are evaluated.
      </p>

      <div>
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`prover-step ${isDone ? "complete" : isActive ? "active" : ""}`}
            >
              <div style={{ width: 24, display: "flex", justifyContent: "center" }}>
                {isDone ? (
                  <span style={{ color: "var(--signal-bright)", fontWeight: "bold" }}>✓</span>
                ) : isActive ? (
                  <div className="spinner" />
                ) : (
                  <span style={{ color: "var(--slate-dim)", fontSize: "0.8rem" }}>○</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: isDone ? "var(--signal-bright)" : isActive ? "#ffffff" : "var(--slate-dim)",
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--slate)" }}>{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
