import { CLAIM_LABELS, CLAIM_WITHHOLDS } from "../lib/api.js";

interface Props {
  organizationName: string;
  claims: string[];
}

export default function DisclosureManifest({ organizationName, claims }: Props) {
  const withheldSet = new Set<string>();
  claims.forEach((c) => {
    const w = CLAIM_WITHHOLDS[c];
    if (w) w.split(", ").forEach((item) => withheldSet.add(item));
  });
  // Every claim implies the rest of the identity stays private, regardless
  // of which specific fields the claim touches.
  ["Full address", "Identity documents", "Full name"].forEach((f) => withheldSet.add(f));

  return (
    <div>
      <p className="eyebrow" style={{ marginBottom: 10 }}>
        {organizationName} will receive
      </p>
      <div className="manifest">
        <div className="manifest-col receive">
          <div className="manifest-heading">Will receive</div>
          {claims.map((c) => (
            <div className="manifest-item" key={c}>
              <span className="mark">✓</span>
              <span>{CLAIM_LABELS[c] ?? c}</span>
            </div>
          ))}
        </div>
        <div className="manifest-col withhold">
          <div className="manifest-heading">Will not receive</div>
          {[...withheldSet].map((f) => (
            <div className="manifest-item" key={f}>
              <span className="mark">✕</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
