import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/App.css";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddBottle from "./pages/AddBottle";
import Transfer from "./pages/Transfer";
import Verify from "./pages/Verify";
import Ledger from "./pages/Ledger";
import { validateChain } from "./utils/api";

const NAV = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "inventory", icon: "🍷", label: "Inventory" },
  { id: "add", icon: "+", label: "Register" },
  { id: "transfer", icon: "⇄", label: "Transfer" },
  { id: "verify", icon: "✓", label: "Verify" },
  { id: "ledger", icon: "⛓", label: "Ledger" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [extra, setExtra] = useState(null);
  const [chainValid, setChainValid] = useState(null);

  useEffect(() => {
    validateChain()
      .then((r) => setChainValid(r.data.valid))
      .catch(() => setChainValid(false));
  }, [page]);

  const navigate = (p, e = null) => {
    setPage(p);
    setExtra(e);
  };

  const pages = {
    dashboard: <Dashboard onNavigate={navigate} />,
    inventory: <Inventory onNavigate={navigate} />,
    add: <AddBottle onNavigate={navigate} />,
    transfer: <Transfer preselect={extra} onNavigate={navigate} />,
    verify: <Verify preselect={extra} />,
    ledger: <Ledger />,
  };

  return (
    <div>
      <nav className="topnav">
        <div className="topnav-logo">
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
          <div
            className={`chain-badge ${chainValid === false ? "invalid" : ""}`}
          >
            <span>{chainValid === null ? "⏳" : chainValid ? "●" : "●"}</span>
            {chainValid === null
              ? "Checking chain"
              : chainValid
                ? "Chain valid"
                : "Chain issue"}
          </div>
        </div>
      </nav>

      <main className="main-content">{pages[page]}</main>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        toastStyle={{ borderRadius: 10, fontSize: 13 }}
      />
    </div>
  );
}
