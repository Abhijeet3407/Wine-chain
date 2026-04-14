import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/App.css";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddBottle from "./pages/AddBottle";
import Verify from "./pages/Verify";
import Ledger from "./pages/Ledger";
import Marketplace from "./pages/Marketplace";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Verify2FA from "./pages/Verify2FA";
import { validateChain } from "./utils/api";

const NAV = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "inventory", icon: "🍷", label: "Inventory" },
  { id: "marketplace", icon: "🏪", label: "Marketplace" },
  { id: "add", icon: "+", label: "Register" },
  { id: "verify", icon: "✓", label: "Verify" },
  { id: "ledger", icon: "⛓", label: "Ledger" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [extra, setExtra] = useState(null);
  const [chainValid, setChainValid] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem("winechain_token");
    const savedUser = localStorage.getItem("winechain_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      validateChain()
        .then((r) => setChainValid(r.data.valid))
        .catch(() => setChainValid(false));
    }
  }, [page, user]);

  const navigate = (p, e = null) => {
    setPage(p);
    setExtra(e);
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("winechain_token");
    localStorage.removeItem("winechain_user");
    setUser(null);
    setToken(null);
    setPage("home");
  };

  // Show login/signup/2fa pages without navbar
  if (!user) {
    if (page === "signup")
      return (
        <>
          <Signup onNavigate={navigate} />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </>
      );
    if (page === "verify2fa")
      return (
        <>
          <Verify2FA
            userId={extra?.userId || extra}
            prefillCode={extra?.fallbackCode || null}
            onLogin={handleLogin}
            onNavigate={navigate}
          />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </>
      );
    if (page !== "home" && page !== "login") {
      return (
        <>
          <Login onNavigate={navigate} onLogin={handleLogin} />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </>
      );
    }
  }

  const pages = {
    home: <Home onNavigate={navigate} />,
    dashboard: <Dashboard onNavigate={navigate} />,
    inventory: <Inventory onNavigate={navigate} user={user} />,
    marketplace: <Marketplace onNavigate={navigate} user={user} token={token} />,
    add: <AddBottle onNavigate={navigate} />,
    verify: <Verify preselect={extra} />,
    ledger: <Ledger />,
    login: <Login onNavigate={navigate} onLogin={handleLogin} />,
  };

  return (
    <div>
      <nav className="topnav">
        <div
          className="topnav-logo"
          onClick={() => navigate("home")}
          style={{ cursor: "pointer" }}
        >
          <div className="topnav-logo-icon">🍷</div>
          <div>
            <h1>Wine Chain</h1>
            <span>Blockchain Inventory</span>
          </div>
        </div>

        <div className="topnav-links">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>

        <div className="topnav-right">
          {user && (
            <>
              <div
                style={{
                  fontSize: 13,
                  color: "#555",
                  fontWeight: 500,
                  padding: "6px 12px",
                  background: "#f8f7f4",
                  borderRadius: 20,
                  border: "1px solid #ece9e2",
                }}
              >
                👤 {user.name}
              </div>
              <div
                className={`chain-badge ${chainValid === false ? "invalid" : ""}`}
              >
                <span>{chainValid === null ? "⏳" : "●"}</span>
                <span className="chain-badge-text">
                  {chainValid === null
                    ? "Checking"
                    : chainValid
                      ? "Chain valid"
                      : "Chain issue"}
                </span>
              </div>
              <button className="btn btn-sm btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
          {!user && page !== "login" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-sm" onClick={() => navigate("login")}>
                Login
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => navigate("signup")}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className={page === "home" ? "home-page" : "main-content"}>
        {pages[page] || <Home onNavigate={navigate} />}
      </main>

      {/* Mobile bottom navigation */}
      {user && (
        <nav className="bottomnav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`bottomnav-item ${page === n.id ? "active" : ""}`}
              onClick={() => navigate(n.id)}
            >
              <span className="bottomnav-icon">{n.icon}</span>
              <span className="bottomnav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        toastStyle={{ borderRadius: 10, fontSize: 13 }}
      />
    </div>
  );
}
