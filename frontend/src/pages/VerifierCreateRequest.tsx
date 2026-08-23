import { useEffect, useState } from "react";
import { api, CLAIM_LABELS } from "../lib/api.js";
import DisclosureManifest from "../components/DisclosureManifest.js";

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

  const selectedOrg = organizations.find((o) => o.id === organizationId);

  return (
    <main className="container" style={{ maxWidth: 720, paddingTop: 48, paddingBottom: 64 }}>
      <p className="eyebrow">For businesses & verifiers</p>
      <h1 style={{ fontSize: "2.25rem" }}>Create Verification Request</h1>
      <p style={{ maxWidth: 560, color: "var(--slate)" }}>
        Choose exactly which claims you need. The user will see this disclosure manifest before approving —
        never more, never less.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <label htmlFor="orgSelect" style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
          Select Organization / Business Entity
        </label>
        
        {loadingOrgs ? (
          <p style={{ color: "var(--slate-dim)", fontSize: "0.9rem", margin: "6px 0" }}>Loading organizations…</p>
        ) : organizations.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <select
              id="orgSelect"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--card-bg)",
                color: "inherit",
                border: "1px solid var(--card-border)",
                borderRadius: 8,
                fontSize: "0.95rem"
              }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.role}) — {org.id.slice(0, 8)}…
                </option>
              ))}
            </select>

            <div style={{ fontSize: "0.82rem", color: "var(--slate)", display: "flex", alignItems: "center", gap: 8 }}>
              <span>Organization UUID:</span>
              <span className="mono" style={{ color: "var(--accent)" }}>{organizationId}</span>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: "var(--slate)", fontSize: "0.9rem", margin: "6px 0 12px" }}>
              You don't belong to any organizations yet. Create one below:
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. My Bank / FinTech"
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

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Required Claims (Enforced)</p>
        {ALL_CLAIMS.map((c) => (
          <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={required.includes(c)} onChange={() => toggle(required, setRequired, c)} />
            <span>{CLAIM_LABELS[c]}</span>
          </label>
        ))}
        <p className="eyebrow" style={{ margin: "20px 0 12px" }}>Optional Claims</p>
        {ALL_CLAIMS.filter((c) => !required.includes(c)).map((c) => (
          <label key={c} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={optional.includes(c)} onChange={() => toggle(optional, setOptional, c)} />
            <span>{CLAIM_LABELS[c]}</span>
          </label>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <DisclosureManifest organizationName={selectedOrg?.name || "Your organization"} claims={required} />
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--danger)", borderRadius: 8, color: "#fca5a5", marginBottom: 20 }}>
          {error}
        </div>
      )}

      <button className="btn btn-primary" onClick={create} disabled={!organizationId || required.length === 0}>
        Generate Request + QR Code
      </button>

      {created && (
        <div className="card" style={{ marginTop: 24, textAlign: "center" }}>
          <h3 style={{ marginTop: 0 }}>Scan or Share Verification Link</h3>
          <img src={created.qrDataUrl} alt="Verification QR code" style={{ width: 200, height: 200, margin: "16px auto", display: "block" }} />
          <div style={{ marginTop: 12 }}>
            <a
              href={created.verifyUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ wordBreak: "break-all", display: "inline-block" }}
            >
              Open Verification Page ↗
            </a>
          </div>
          <p className="mono" style={{ wordBreak: "break-all", fontSize: "0.85rem", color: "var(--slate-dim)", marginTop: 12 }}>
            {created.verifyUrl}
          </p>
        </div>
      )}
    </main>
  );
}
