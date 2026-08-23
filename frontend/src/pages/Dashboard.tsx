import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "ACTIVE" ? "badge-active" : status === "REVOKED" ? "badge-revoked" : "badge-pending";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const [credentials, setCredentials] = useState<any[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .listCredentials()
      .then((r) => setCredentials(r.credentials))
      .catch(() => setError(true));
  }, []);

  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
      <p className="eyebrow">Dashboard</p>
      <h1 style={{ fontSize: "2.25rem" }}>Your identity, at a glance</h1>

      {error && (
        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ margin: 0 }}>
            Sign in to view your dashboard. <Link to="/login">Sign in</Link>
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {credentials?.map((c) => (
          <div className="card" key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="eyebrow">{c.type}</span>
              <StatusBadge status={c.status} />
            </div>
            <p className="mono" style={{ color: "var(--slate)", margin: 0 }}>
              {c.commitment.slice(0, 16)}…
            </p>
          </div>
        ))}
        {credentials && credentials.length === 0 && (
          <div className="card">
            <p style={{ margin: 0 }}>
              No credentials yet. <Link to="/credentials">Issue one from your wallet.</Link>
            </p>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Pending verification requests</h3>
        <p style={{ margin: 0 }}>
          Open a link or scan a QR from a business to see requests here. Nothing pending right now.
        </p>
      </div>
    </main>
  );
}
