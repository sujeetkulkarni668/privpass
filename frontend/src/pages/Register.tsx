import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAccessToken } from "../lib/api.js";

function describeAuthError(err: unknown): string {
  const anyErr = err as { code?: string; details?: any; message?: string } | undefined;
  const code = anyErr?.code ?? anyErr?.message;

  if (code === "account_exists") return "An account with this username already exists.";
  if (code === "too_many_attempts") return "Too many attempts. Please wait a few minutes and try again.";
  if (code === "invalid_input") {
    const fieldErrors = anyErr?.details?.fieldErrors ?? {};
    if (fieldErrors.password?.length) return fieldErrors.password[0];
    if (fieldErrors.username?.length) return fieldErrors.username[0];
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.register({ displayName, username, password });
      // Automatically log the user in upon successful registration
      const { accessToken } = await api.login({ username, password });
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
      <h1 style={{ fontSize: "2rem" }}>Create your account</h1>
      <p style={{ color: "var(--slate)", marginTop: 0 }}>
        No wallet required to sign up — connect one later when issuing government documents.
      </p>
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
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            placeholder="e.g. satoshi (letters, numbers, dots, hyphens)"
            minLength={3}
            maxLength={50}
            pattern="[a-zA-Z0-9._-]+"
            title="Letters, numbers, dots, underscores, and hyphens only"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </main>
  );
}
