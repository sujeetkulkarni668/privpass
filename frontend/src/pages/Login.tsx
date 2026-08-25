import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAccessToken } from "../lib/api.js";

function describeLoginError(err: unknown): string {
  const anyErr = err as { code?: string; message?: string } | undefined;
  const code = anyErr?.code ?? anyErr?.message;

  if (code === "invalid_credentials") return "Username or password didn't match. Try again.";
  if (code === "too_many_attempts") return "Too many attempts. Please wait a few minutes and try again.";
  if (typeof code === "string" && code.startsWith("request_failed_")) {
    return "Couldn't reach the server. Please check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { accessToken } = await api.login({ username, password });
      setAccessToken(accessToken);
      navigate("/dashboard");
    } catch (err) {
      setError(describeLoginError(err));
    }
  }

  return (
    <main className="container" style={{ maxWidth: 420, paddingTop: 80 }}>
      <h1 style={{ fontSize: "2rem" }}>Sign in</h1>
      <form onSubmit={onSubmit} className="card" style={{ display: "grid", gap: 16 }}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            placeholder="e.g. satoshi"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "var(--danger)", margin: 0 }}>{error}</p>}
        <button className="btn btn-primary" type="submit">
          Sign in
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </main>
  );
}
