import { useEffect, useState } from "react";
import { api, CLAIM_LABELS, INDUSTRY_PRESETS, type IndustryPreset } from "../lib/api.js";
import DisclosureManifest from "../components/DisclosureManifest.js";
import SdkSnippetModal from "../components/SdkSnippetModal.js";

const ALL_CLAIMS = Object.keys(CLAIM_LABELS);

interface Org {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export default function VerifierCreateRequest() {
  const [organizations, setOrganizations] = useState<Org[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [required, setRequired] = useState<string[]>(["PAN_VALID", "AGE_OVER_18"]);
  const [optional, setOptional] = useState<string[]>([]);
  const [created, setCreated] = useState<{ id: string; verifyUrl: string; qrDataUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [newOrgName, setNewOrgName] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [showSdkModal, setShowSdkModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  function loadOrgs() {
    setLoadingOrgs(true);
    api.listOrganizations()
      .then((r) => {
        setOrganizations(r.organizations || []);
        if (r.organizations && r.organizations.length > 0) {
          setOrganizationId((prev) => prev || r.organizations[0].id);
        }
      })
      .catch(() => setOrganizations([]))
      .finally(() => setLoadingOrgs(false));
  }

  useEffect(loadOrgs, []);

  function toggle(list: string[], setList: (v: string[]) => void, claim: string) {
    setList(list.includes(claim) ? list.filter((c) => c !== claim) : [...list, claim]);
  }

  function applyPreset(preset: IndustryPreset) {
    setRequired(preset.requiredClaims);
    setOptional(preset.optionalClaims);
  }

  async function handleCreateOrg() {
    if (!newOrgName.trim()) return;
    setCreatingOrg(true);
    setError(null);
    try {
      const res = await api.createOrganization(newOrgName.trim());
      setNewOrgName("");
      setOrganizationId(res.organization.id);
      loadOrgs();
    } catch (err: any) {
      setError(err.message || "Failed to create organization");
    } finally {
      setCreatingOrg(false);
    }
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

  function copyVerifyLink() {
    if (!created) return;
    navigator.clipboard.writeText(created.verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const selectedOrg = organizations.find((o) => o.id === organizationId);

  return (
    <main className="container" style={{ maxWidth: 840, paddingTop: 48, paddingBottom: 64 }}>
      {showSdkModal && created && (
        <SdkSnippetModal requestId={created.id} onClose={() => setShowSdkModal(false)} />
      )}

      <p className="eyebrow">Enterprise Verifier Portal</p>
      <h1 style={{ fontSize: "2.25rem" }}>Verification Request Builder</h1>
      <p style={{ maxWidth: 640, color: "var(--slate)" }}>
        Construct selective disclosure requests for your users. Receive cryptographic zero-knowledge proofs on Midnight without storing raw documents or PII.
      </p>

      {/* Industry Presets */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>⚡ 1-Click Industry Templates</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {INDUSTRY_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className="btn btn-secondary"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                padding: "12px",
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{p.icon}</div>
              <strong style={{ fontSize: "0.85rem", color: "#ffffff" }}>{p.name}</strong>
              <span style={{ fontSize: "0.72rem", color: "var(--slate-dim)", marginTop: 2 }}>
                {p.requiredClaims.length} required claims
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Organization Selection */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label htmlFor="orgSelect" style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
          Business Entity / Organization
        </label>

        {loadingOrgs ? (
          <p style={{ color: "var(--slate-dim)", fontSize: "0.9rem" }}>Loading organizations…</p>
        ) : organizations.length > 0 ? (
          <div>
            <select
              id="orgSelect"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              style={{ marginBottom: 10 }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.role}) — {org.id.slice(0, 8)}…
                </option>
              ))}
            </select>
            <div className="mono" style={{ fontSize: "0.78rem", color: "var(--slate-dim)" }}>
              Organization UUID: {organizationId}
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: "var(--slate)", fontSize: "0.88rem", marginBottom: 10 }}>
              Create your organization to issue verification requests:
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. Apex Global Finance"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={handleCreateOrg}
                disabled={creatingOrg || !newOrgName.trim()}
              >
                {creatingOrg ? "Creating…" : "Create Org"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Claims Configuration */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Required Zero-Knowledge Claims</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginBottom: 20 }}>
          {ALL_CLAIMS.map((c) => (
            <label
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: required.includes(c) ? "rgba(16, 185, 129, 0.1)" : "var(--ink-raised-2)",
                border: "1px solid",
                borderColor: required.includes(c) ? "var(--signal)" : "var(--ink-line)",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={required.includes(c)}
                onChange={() => toggle(required, setRequired, c)}
              />
              <span style={{ fontSize: "0.9rem", color: required.includes(c) ? "#ffffff" : "var(--slate)" }}>
                {CLAIM_LABELS[c]}
              </span>
            </label>
          ))}
        </div>

        <p className="eyebrow" style={{ marginBottom: 12 }}>Optional Claims (User May Withhold)</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {ALL_CLAIMS.filter((c) => !required.includes(c)).map((c) => (
            <label
              key={c}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: optional.includes(c) ? "rgba(59, 130, 246, 0.1)" : "var(--ink-raised-2)",
                border: "1px solid",
                borderColor: optional.includes(c) ? "var(--accent)" : "var(--ink-line)",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={optional.includes(c)}
                onChange={() => toggle(optional, setOptional, c)}
              />
              <span style={{ fontSize: "0.9rem", color: optional.includes(c) ? "#ffffff" : "var(--slate)" }}>
                {CLAIM_LABELS[c]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Live Disclosure Manifest Preview */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Live Disclosure Manifest (What User Will See)</p>
        <DisclosureManifest organizationName={selectedOrg?.name || "Your Organization"} claims={required} />
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "var(--danger-dim)", border: "1px solid var(--danger)", borderRadius: 8, color: "#fca5a5", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <button className="btn btn-primary" onClick={create} disabled={!organizationId || required.length === 0}>
        Generate Verification Request & QR Code
      </button>

      {/* Generated Request Modal / Panel */}
      {created && (
        <div className="card" style={{ marginTop: 28, textAlign: "center", border: "1px solid var(--signal)" }}>
          <span className="badge badge-active" style={{ marginBottom: 12 }}>
            ✓ Request Live on Midnight Preprod
          </span>
          <h2 style={{ fontSize: "1.5rem", marginTop: 4 }}>Scan or Share Verification Link</h2>

          <div style={{ background: "#ffffff", padding: 16, borderRadius: 16, display: "inline-block", margin: "16px auto" }}>
            <img src={created.qrDataUrl} alt="Verification QR code" style={{ width: 180, height: 180, display: "block" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <a
              href={created.verifyUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ fontSize: "0.88rem" }}
            >
              Open Proof Portal ↗
            </a>
            <button className="btn btn-secondary" onClick={copyVerifyLink} style={{ fontSize: "0.88rem" }}>
              {copiedLink ? "✓ Link Copied" : "Copy Link"}
            </button>
            <button className="btn btn-accent" onClick={() => setShowSdkModal(true)} style={{ fontSize: "0.88rem" }}>
              &lt;/&gt; Get Embed / SDK Code
            </button>
          </div>

          <p className="mono" style={{ wordBreak: "break-all", fontSize: "0.78rem", color: "var(--slate-dim)", marginTop: 16 }}>
            {created.verifyUrl}
          </p>
        </div>
      )}
    </main>
  );
}
