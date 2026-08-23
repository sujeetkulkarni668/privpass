import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAccessToken } from "../lib/api.js";

function describeAuthError(err: unknown): string {
  const anyErr = err as { code?: string; details?: any; message?: string } | undefined;
  const code = anyErr?.code ?? anyErr?.message;

  if (code === "account_exists") return "An account with this email already exists.";
  if (code === "too_many_attempts") return "Too many attempts. Please wait a few minutes and try again.";
  if (code === "invalid_input") {
    const fieldErrors = anyErr?.details?.fieldErrors ?? {};
    if (fieldErrors.password?.length) return fieldErrors.password[0];
    if (fieldErrors.email?.length) return fieldErrors.email[0];
    if (fieldErrors.displayName?.length) return fieldErrors.displayName[0];
    return "Please check the form — one of the fields isn't valid.";
  }
  if (typeof code === "string" && code.startsWith("request_failed_")) {
    return "Couldn't reach the server. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function Register() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.register({ displayName, email, password });
      // Automatically log the user in upon successful registration
      const { accessToken } = await api.login({ email, password });
      setAccessToken(accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <h1 style={{ fontSize: "2rem" }}>Create your wallet</h1>
      <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 16 }}>
        <div>
          <label htmlFor="displayName">Full Name</label>
          <input
            id="displayName"
            type="text"
            required
            autoComplete="name"
            placeholder="e.g. Satoshi Nakamoto"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password (min. 12 characters)</label>
          <input
            id="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            placeholder="At least 12 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        Already have a wallet? <Link to="/login">Sign in</Link>
      </p>
    </main>
  );
}
