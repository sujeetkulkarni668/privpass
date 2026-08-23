import { Link } from "react-router-dom";
import DisclosureManifest from "../components/DisclosureManifest.js";

export default function Landing() {
  return (
    <main>
      <section className="container" style={{ paddingTop: 96, paddingBottom: 64 }}>
        <p className="eyebrow" style={{ marginBottom: 20 }}>
          Identity verification, built on Midnight / Compact
        </p>
        <h1 style={{ maxWidth: 780 }}>
          Verify identity.
          <br />
          Reveal nothing unnecessary.
        </h1>
        <p style={{ maxWidth: 560, fontSize: "1.1rem" }}>
          PrivPass lets a business ask exactly what it needs to know — "is this
          person over 18," "is this PAN valid" — and lets the person prove it
          with a zero-knowledge proof, without handing over the document.
        </p>
        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
          <Link to="/register" className="btn btn-primary">
            Create your wallet
          </Link>
          <Link to="/verifier/requests/create" className="btn btn-secondary">
            I'm a business
          </Link>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 80 }}>
        <div className="card">
          <p className="eyebrow" style={{ marginBottom: 16 }}>
            Example — ABC Finance opens an account
          </p>
          <DisclosureManifest organizationName="ABC Finance" claims={["PAN_VALID", "AGE_OVER_18"]} />
        </div>
      </section>

      <section className="container" style={{ paddingBottom: 96 }}>
        <h2>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            ["A business asks", "It selects exactly which claims it needs — never raw documents."],
            ["You review and approve", "You see precisely what's disclosed and what stays private before anything moves."],
            ["A proof is generated", "Your wallet proves the claim against a Compact circuit on Midnight — the underlying value never leaves your device."],
            ["The business gets a yes/no", "PAN_VALID: true. AGE_OVER_18: true. Nothing else."],
          ].map(([title, body]) => (
            <div className="card" key={title as string}>
              <h3 style={{ fontSize: "1.05rem" }}>{title}</h3>
              <p style={{ marginBottom: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
