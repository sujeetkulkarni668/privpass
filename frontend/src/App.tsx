import { Routes, Route, Link, useLocation } from "react-router-dom";
import Landing from "./pages/Landing.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import Credentials from "./pages/Credentials.js";
import VerifyRequest from "./pages/VerifyRequest.js";
import VerifierCreateRequest from "./pages/VerifierCreateRequest.js";
import History from "./pages/History.js";
import CircuitSimulator from "./pages/CircuitSimulator.js";
import { ConnectWalletButton } from "./components/WalletModal.js";

import Logo from "./components/Logo.js";

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
          <Logo size={34} />
        </Link>

        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          {link("/dashboard", "Dashboard")}
          {link("/credentials", "ID Wallet")}
          {link("/circuits", "ZK Studio ⚡")}
          {link("/history", "History")}
          {link("/verifier/requests/create", "For Businesses")}
          {link("/login", "Sign in")}
          <div style={{ marginLeft: 8 }}>
            <ConnectWalletButton />
          </div>
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
        <Route path="/circuits" element={<CircuitSimulator />} />
        <Route path="/history" element={<History />} />
        <Route path="/verify/:requestId" element={<VerifyRequest />} />
        <Route path="/verifier/requests/create" element={<VerifierCreateRequest />} />
      </Routes>
    </>
  );
}
