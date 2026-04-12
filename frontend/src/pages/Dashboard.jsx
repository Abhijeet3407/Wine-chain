import React, { useEffect, useState } from "react";
import { getStats, validateChain } from "../utils/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chainValid, setChainValid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), validateChain()])
      .then(([s, c]) => {
        setStats(s.data.data);
        setChainValid(c.data.valid);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const typeColors = { Red: "badge-red", White: "badge-white", Rosé: "badge-rose", Sparkling: "badge-sparkling", Dessert: "badge-dessert", Fortified: "badge-fortified" };

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Wine Chain blockchain inventory overview</p>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Bottles</div>
          <div className="metric-value">{stats?.totalBottles || 0}</div>
          <div className="metric-sub">{stats?.uniqueWines || 0} unique wines</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Portfolio Value</div>
          <div className="metric-value">£{(stats?.totalValue || 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}</div>
          <div className="metric-sub">at purchase price</div>
        </div>
        <div className="metric-card accent">
          <div className="metric-label">Blocks on Chain</div>
          <div className="metric-value">{stats?.totalBlocks || 0}</div>
          <div className="metric-sub">immutable records</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Chain Status</div>
          <div className="metric-value" style={{ fontSize: 18, color: chainValid ? "#1e7a40" : "#c0442a" }}>
            {chainValid === null ? "—" : chainValid ? "✓ Valid" : "✗ Compromised"}
          </div>
          <div className="metric-sub">integrity check</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-title">Inventory by type</div>
          {stats?.byType?.length === 0 && <div className="empty">No data yet</div>}
          <table>
            <thead><tr><th>Type</th><th>Wines</th><th>Bottles</th></tr></thead>
            <tbody>
              {stats?.byType?.map(t => (
                <tr key={t._id}>
                  <td><span className={`badge ${typeColors[t._id] || "badge-red"}`}>{t._id}</span></td>
                  <td>{t.count}</td>
                  <td>{t.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-title">Inventory by status</div>
          {stats?.byStatus?.length === 0 && <div className="empty">No data yet</div>}
          <table>
            <thead><tr><th>Status</th><th>Count</th></tr></thead>
            <tbody>
              {stats?.byStatus?.map(s => (
                <tr key={s._id}>
                  <td><span className={`badge badge-${s._id?.toLowerCase()}`}>{s._id}</span></td>
                  <td>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">About this system</div>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>
          Wine Chain uses a <strong>SHA-256 proof-of-work blockchain</strong> to record every bottle registration and ownership transfer as an immutable block. Each block contains the previous block's hash, making tampering detectable. All data is persisted in <strong>MongoDB</strong> via a Node.js/Express API.
        </p>
      </div>
    </div>
  );
}
