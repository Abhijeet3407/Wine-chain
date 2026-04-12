import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/App.css";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddBottle from "./pages/AddBottle";
import Transfer from "./pages/Transfer";
import Verify from "./pages/Verify";
import Ledger from "./pages/Ledger";

const NAV = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "inventory", icon: "🍷", label: "Inventory" },
  { id: "add", icon: "➕", label: "Register" },
  { id: "transfer", icon: "🔄", label: "Transfer" },
  { id: "verify", icon: "✅", label: "Verify" },
  { id: "ledger", icon: "⛓️", label: "Ledger" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [extra, setExtra] = useState(null);

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
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🍷 Wine Chain</h1>
          <span>Blockchain Inventory</span>
        </div>
        <nav className="sidebar-nav">
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
        </nav>
        <div className="sidebar-footer">MongoDB · Node.js · React</div>
      </aside>
      <main className="main-content">{pages[page]}</main>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}
