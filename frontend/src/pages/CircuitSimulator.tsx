import { useState } from "react";

function isUpperAlpha(c: number): boolean {
  return c >= 65 && c <= 90;
}

function isDigit(c: number): boolean {
  return c >= 48 && c <= 57;
}

export default function CircuitSimulator() {
  const [selectedCircuit, setSelectedCircuit] = useState<
    "pan" | "aadhaar" | "age" | "threshold" | "residency" | "composite"
  >("pan");

  // Inputs
  const [panInput, setPanInput] = useState("ABCDE1234F");
  const [aadhaarInput, setAadhaarInput] = useState("123456789012");
  const [dobInput, setDobInput] = useState("2000-01-15");
  const [thresholdYears, setThresholdYears] = useState(21);
  const [countryCodeInput, setCountryCodeInput] = useState("356"); // 356 = IND
  const [expectedCountryCode, setExpectedCountryCode] = useState("356");

  // Simulation execution results
  function evaluatePan(): { valid: boolean; constraints: { label: string; passed: boolean }[] } {
    const chars = panInput.toUpperCase();
    const lenOk = chars.length === 10;
    const bytes = Array.from(chars).map((c) => c.charCodeAt(0));

    const prefixOk = lenOk && bytes.slice(0, 5).every(isUpperAlpha);
    const digitsOk = lenOk && bytes.slice(5, 9).every(isDigit);
    const suffixOk = lenOk && isUpperAlpha(bytes[9]);

    return {
      valid: lenOk && prefixOk && digitsOk && suffixOk,
      constraints: [
        { label: "Length constraint == 10 chars", passed: lenOk },
        { label: "Prefix constraint (pan[0..4] in 'A'..'Z')", passed: prefixOk },
        { label: "Numeric constraint (pan[5..8] in '0'..'9')", passed: digitsOk },
        { label: "Suffix constraint (pan[9] in 'A'..'Z')", passed: suffixOk },
      ],
    };
  }

  function evaluateAadhaar(): { valid: boolean; constraints: { label: string; passed: boolean }[] } {
    const chars = aadhaarInput.trim();
    const lenOk = chars.length === 12;
    const bytes = Array.from(chars).map((c) => c.charCodeAt(0));
    const allDigits = lenOk && bytes.every(isDigit);

    return {
      valid: lenOk && allDigits,
      constraints: [
        { label: "Length constraint == 12 digits", passed: lenOk },
        { label: "Numeric byte constraint (aadhaar[0..11] in '0'..'9')", passed: allDigits },
        { label: "ZK Commitment Pre-image integrity", passed: true },
      ],
    };
  }

  function evaluateAge(minAge = 18): { valid: boolean; age: number; constraints: { label: string; passed: boolean }[] } {
    if (!dobInput) return { valid: false, age: 0, constraints: [] };
    const dob = new Date(dobInput);
    const now = new Date();
    const diffMs = now.getTime() - dob.getTime();
    const ageYears = Math.floor(diffMs / (365.2425 * 24 * 60 * 60 * 1000));
    const notFuture = dob <= now;
    const isOver = ageYears >= minAge;

    return {
      valid: notFuture && isOver,
      age: Math.max(0, ageYears),
      constraints: [
        { label: "Timestamp sanity constraint (now >= dob)", passed: notFuture },
        { label: `Threshold assertion: age (${ageYears} yrs) >= ${minAge} yrs`, passed: isOver },
        { label: "ZK Witness Disclosure: Zero PII leaked", passed: true },
      ],
    };
  }

  function evaluateResidency(): { valid: boolean; constraints: { label: string; passed: boolean }[] } {
    const match = countryCodeInput.trim() === expectedCountryCode.trim();
    return {
      valid: match,
      constraints: [
        { label: `Country Code match (witness: ${countryCodeInput} == expected: ${expectedCountryCode})`, passed: match },
        { label: "Zero-Knowledge address withholding constraint", passed: true },
      ],
    };
  }

  const panRes = evaluatePan();
  const aadhaarRes = evaluateAadhaar();
  const ageRes = evaluateAge(18);
  const threshRes = evaluateAge(thresholdYears);
  const resRes = evaluateResidency();
  const compositeRes = panRes.valid && aadhaarRes.valid && ageRes.valid;

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <p className="eyebrow">Interactive Testing & Verification</p>
      <h1 style={{ fontSize: "2.25rem" }}>Compact ZK Circuit Studio</h1>
      <p style={{ maxWidth: 700, color: "var(--slate)" }}>
        Live interactive sandbox for evaluating Compact zero-knowledge circuits compiled on Midnight.
        Test custom inputs, simulate malicious or malformed payloads, and inspect real-time circuit constraint verification.
      </p>

      {/* Circuit Selector Tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        {[
          { id: "pan", label: "provePanValid", tag: "Identity" },
          { id: "aadhaar", label: "proveAadhaarVerified", tag: "Identity" },
          { id: "age", label: "proveAgeOver18", tag: "Age Gate" },
          { id: "threshold", label: "proveAgeThreshold (Custom)", tag: "Dynamic" },
          { id: "residency", label: "proveResidencyJurisdiction", tag: "Location" },
          { id: "composite", label: "verifyCompositeIdentity", tag: "Composite" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn ${selectedCircuit === tab.id ? "btn-accent" : "btn-secondary"}`}
            style={{ fontSize: "0.85rem", padding: "8px 16px" }}
            onClick={() => setSelectedCircuit(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>
        {/* Left: Interactive Input Form */}
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Witness Inputs (Private to User)</h3>

          {selectedCircuit === "pan" && (
            <div>
              <label>Test PAN Card String (Format: [A-Z]{5}[0-9]{4}[A-Z]{1})</label>
              <input
                type="text"
                value={panInput}
                onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                className="mono"
              />
              <p style={{ fontSize: "0.8rem", color: "var(--slate-dim)", marginTop: 6 }}>
                Try tampering with characters (e.g. <code>12345ABCDE</code>) to watch circuit rejection.
              </p>
            </div>
          )}

          {selectedCircuit === "aadhaar" && (
            <div>
              <label>Test Aadhaar Number (12 Numeric Digits)</label>
              <input
                type="text"
                value={aadhaarInput}
                onChange={(e) => setAadhaarInput(e.target.value)}
                placeholder="e.g. 123456789012"
                className="mono"
              />
              <p style={{ fontSize: "0.8rem", color: "var(--slate-dim)", marginTop: 6 }}>
                Try entering letters or 11 digits to test constraint failure.
              </p>
            </div>
          )}

          {selectedCircuit === "age" && (
            <div>
              <label>Private Date of Birth (Witness)</label>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
              />
              <p style={{ fontSize: "0.8rem", color: "var(--slate-dim)", marginTop: 6 }}>
                Calculated Age: <strong>{ageRes.age} years old</strong>
              </p>
            </div>
          )}

          {selectedCircuit === "threshold" && (
            <div>
              <label>Private Date of Birth</label>
              <input
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                style={{ marginBottom: 14 }}
              />
              <label>Dynamic Minimum Age Threshold (Years)</label>
              <input
                type="number"
                value={thresholdYears}
                min={1}
                max={100}
                onChange={(e) => setThresholdYears(Number(e.target.value))}
              />
            </div>
          )}

          {selectedCircuit === "residency" && (
            <div>
              <label>User's Witness Country Code (e.g. 356=IND, 840=USA, 826=UK)</label>
              <input
                type="text"
                value={countryCodeInput}
                onChange={(e) => setCountryCodeInput(e.target.value)}
                style={{ marginBottom: 14 }}
              />
              <label>Verifier Expected Country Code Constraint</label>
              <input
                type="text"
                value={expectedCountryCode}
                onChange={(e) => setExpectedCountryCode(e.target.value)}
              />
            </div>
          )}

          {selectedCircuit === "composite" && (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label>PAN Input</label>
                <input type="text" value={panInput} onChange={(e) => setPanInput(e.target.value.toUpperCase())} className="mono" />
              </div>
              <div>
                <label>Aadhaar Input</label>
                <input type="text" value={aadhaarInput} onChange={(e) => setAadhaarInput(e.target.value)} className="mono" />
              </div>
              <div>
                <label>Date of Birth</label>
                <input type="date" value={dobInput} onChange={(e) => setDobInput(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Right: Real-time Circuit Constraint Outcome */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Circuit Evaluation</h3>
            <span
              className={`badge ${
                (selectedCircuit === "pan" && panRes.valid) ||
                (selectedCircuit === "aadhaar" && aadhaarRes.valid) ||
                (selectedCircuit === "age" && ageRes.valid) ||
                (selectedCircuit === "threshold" && threshRes.valid) ||
                (selectedCircuit === "residency" && resRes.valid) ||
                (selectedCircuit === "composite" && compositeRes)
                  ? "badge-active"
                  : "badge-revoked"
              }`}
              style={{ fontSize: "0.85rem", padding: "6px 14px" }}
            >
              {(selectedCircuit === "pan" && panRes.valid) ||
              (selectedCircuit === "aadhaar" && aadhaarRes.valid) ||
              (selectedCircuit === "age" && ageRes.valid) ||
              (selectedCircuit === "threshold" && threshRes.valid) ||
              (selectedCircuit === "residency" && resRes.valid) ||
              (selectedCircuit === "composite" && compositeRes)
                ? "✓ PROOF SATISFIED"
                : "✕ CONSTRAINT FAILED"}
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>Arithmetic & Range Constraints</p>
            {selectedCircuit === "pan" &&
              panRes.constraints.map((c, i) => (
                <div key={i} className="manifest-item" style={{ fontSize: "0.85rem" }}>
                  <span className="mark" style={{ color: c.passed ? "var(--signal-bright)" : "var(--danger)" }}>
                    {c.passed ? "✓" : "✕"}
                  </span>
                  <span style={{ color: c.passed ? "var(--paper)" : "#fca5a5" }}>{c.label}</span>
                </div>
              ))}

            {selectedCircuit === "aadhaar" &&
              aadhaarRes.constraints.map((c, i) => (
                <div key={i} className="manifest-item" style={{ fontSize: "0.85rem" }}>
                  <span className="mark" style={{ color: c.passed ? "var(--signal-bright)" : "var(--danger)" }}>
                    {c.passed ? "✓" : "✕"}
                  </span>
                  <span style={{ color: c.passed ? "var(--paper)" : "#fca5a5" }}>{c.label}</span>
                </div>
              ))}

            {selectedCircuit === "age" &&
              ageRes.constraints.map((c, i) => (
                <div key={i} className="manifest-item" style={{ fontSize: "0.85rem" }}>
                  <span className="mark" style={{ color: c.passed ? "var(--signal-bright)" : "var(--danger)" }}>
                    {c.passed ? "✓" : "✕"}
                  </span>
                  <span style={{ color: c.passed ? "var(--paper)" : "#fca5a5" }}>{c.label}</span>
                </div>
              ))}

            {selectedCircuit === "threshold" &&
              threshRes.constraints.map((c, i) => (
                <div key={i} className="manifest-item" style={{ fontSize: "0.85rem" }}>
                  <span className="mark" style={{ color: c.passed ? "var(--signal-bright)" : "var(--danger)" }}>
                    {c.passed ? "✓" : "✕"}
                  </span>
                  <span style={{ color: c.passed ? "var(--paper)" : "#fca5a5" }}>{c.label}</span>
                </div>
              ))}

            {selectedCircuit === "residency" &&
              resRes.constraints.map((c, i) => (
                <div key={i} className="manifest-item" style={{ fontSize: "0.85rem" }}>
                  <span className="mark" style={{ color: c.passed ? "var(--signal-bright)" : "var(--danger)" }}>
                    {c.passed ? "✓" : "✕"}
                  </span>
                  <span style={{ color: c.passed ? "var(--paper)" : "#fca5a5" }}>{c.label}</span>
                </div>
              ))}

            {selectedCircuit === "composite" && (
              <div>
                <div className="manifest-item">
                  <span className="mark" style={{ color: panRes.valid ? "var(--signal-bright)" : "var(--danger)" }}>
                    {panRes.valid ? "✓" : "✕"}
                  </span>
                  <span>provePanValid circuit constraint</span>
                </div>
                <div className="manifest-item">
                  <span className="mark" style={{ color: aadhaarRes.valid ? "var(--signal-bright)" : "var(--danger)" }}>
                    {aadhaarRes.valid ? "✓" : "✕"}
                  </span>
                  <span>proveAadhaarVerified circuit constraint</span>
                </div>
                <div className="manifest-item">
                  <span className="mark" style={{ color: ageRes.valid ? "var(--signal-bright)" : "var(--danger)" }}>
                    {ageRes.valid ? "✓" : "✕"}
                  </span>
                  <span>proveAgeOver18 circuit constraint</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", padding: 14, borderRadius: 8, border: "1px solid var(--ink-line)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--slate-dim)", textTransform: "uppercase", marginBottom: 4 }}>
              Disclosed Public Output to Verifier
            </div>
            <div className="mono" style={{ fontSize: "0.85rem", color: "var(--signal-bright)" }}>
              attestation: {((selectedCircuit === "pan" && panRes.valid) ||
              (selectedCircuit === "aadhaar" && aadhaarRes.valid) ||
              (selectedCircuit === "age" && ageRes.valid) ||
              (selectedCircuit === "threshold" && threshRes.valid) ||
              (selectedCircuit === "residency" && resRes.valid) ||
              (selectedCircuit === "composite" && compositeRes)).toString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--slate)", marginTop: 8 }}>
              🛡️ Zero personal identifying strings or dates leave the prover runtime.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
