import { useState } from "react";
import { api, CLAIM_LABELS } from "../lib/api.js";
import DisclosureManifest from "../components/DisclosureManifest.js";

const ALL_CLAIMS = Object.keys(CLAIM_LABELS);

export default function VerifierCreateRequest() {
  const [organizationId, setOrganizationId] = useState("");
  const [required, setRequired] = useState<string[]>(["PAN_VALID", "AGE_OVER_18"]);
  const [optional, setOptional] = useState<string[]>([]);
  const [created, setCreated] = useState<{ id: string; verifyUrl: string; qrDataUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(list: string[], setList: (v: string[]) => void, claim: string) {
    setList(list.includes(claim) ? list.filter((c) => c !== claim) : [...list, claim]);
  }

  async function create() {
    setError(null);
    try {
      const result = await api.createVerificationRequest({
        organizationId,
        requestedClaims: required,
        optionalClaims: optional,
      });
      setCreated(result);
    } catch (e: any) {
      setError(
        e.message === "insufficient_role"
          ? "You need a Developer role or higher in this organization to create requests."
          : "Couldn't create the request. Check the organization ID and try again."
      );
    }
  }

  return (
    <main className="container" style={{ maxWidth: 720, paddingTop: 48, paddingBottom: 64 }}>
      <p className="eyebrow">For businesses</p>
      <h1 style={{ fontSize: "2.25rem" }}>Create a verification request</h1>
      <p style={{ maxWidth: 560 }}>
        Choose exactly which claims you need. The user will see this list before approving —
        never more, never less.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <label htmlFor="orgId">Organization ID</label>
        <input
          id="orgId"
          type="text"
          placeholder="00000000-0000-0000-0000-000000000000"
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
        />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Required claims</p>
        {ALL_CLAIMS.map((c) => (
          <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <input type="checkbox" checked={required.includes(c)} onChange={() => toggle(required, setRequired, c)} />
            {CLAIM_LABELS[c]}
          </label>
        ))}
        <p className="eyebrow" style={{ margin: "20px 0 12px" }}>Optional claims</p>
        {ALL_CLAIMS.filter((c) => !required.includes(c)).map((c) => (
          <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <input type="checkbox" checked={optional.includes(c)} onChange={() => toggle(optional, setOptional, c)} />
            {CLAIM_LABELS[c]}
          </label>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <DisclosureManifest organizationName="Your organization" claims={required} />
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <button className="btn btn-primary" onClick={create} disabled={!organizationId || required.length === 0}>
        Generate request + QR
      </button>

      {created && (
        <div className="card" style={{ marginTop: 24, textAlign: "center" }}>
          <img src={created.qrDataUrl} alt="Verification QR code" style={{ width: 200, height: 200 }} />
          <p className="mono" style={{ wordBreak: "break-all", marginTop: 12 }}>{created.verifyUrl}</p>
        </div>
      )}
    </main>
  );
}
