import { Routes, Route, Link, useLocation } from "react-router-dom";
import Landing from "./pages/Landing.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import Credentials from "./pages/Credentials.js";
import VerifyRequest from "./pages/VerifyRequest.js";
import VerifierCreateRequest from "./pages/VerifierCreateRequest.js";
import History from "./pages/History.js";

function TopBar() {
  const { pathname } = useLocation();
  const link = (to: string, label: string) => (
    <Link to={to} className={pathname === to ? "active" : ""}>
      {label}
    </Link>
  );
  return (
    <nav className="topbar">
      <div className="container">
        <Link to="/" className="brand">
          PrivPass
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {link("/dashboard", "Dashboard")}
          {link("/credentials", "Wallet")}
          {link("/history", "History")}
          {link("/verifier/requests/create", "For businesses")}
          {link("/login", "Sign in")}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/history" element={<History />} />
        <Route path="/verify/:requestId" element={<VerifyRequest />} />
        <Route path="/verifier/requests/create" element={<VerifierCreateRequest />} />
      </Routes>
    </>
  );
}
