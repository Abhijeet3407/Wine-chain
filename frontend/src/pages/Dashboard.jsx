import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { getStats, getAnalytics, validateChain } from "../utils/api";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const TYPE_COLORS = {
  Red:       "#7b1c2e",
  White:     "#c8a840",
  Rosé:      "#e06880",
  Sparkling: "#4a9fd4",
  Dessert:   "#9b6abf",
  Fortified: "#3aab8c",
};

const PRODUCER_COLORS = [
  "#7b1c2e","#c0392b","#9b59b6","#2980b9",
  "#16a085","#d35400","#8e44ad","#2c3e50",
];

const typeColors = { Red: "badge-red", White: "badge-white", Rosé: "badge-rose", Sparkling: "badge-sparkling", Dessert: "badge-dessert", Fortified: "badge-fortified" };

const baseScale = {
  grid: { color: "#f0ede6" },
  ticks: { font: { size: 11, family: "Inter, system-ui, sans-serif" } },
};
const noGridX = { ...baseScale, grid: { display: false } };

function ChartCard({ title, children }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      {children}
    </div>
  );
}

function Empty() {
  return <div className="empty" style={{ padding: "36px 0" }}>No data yet</div>;
}

export default function Dashboard() {
  const [stats, setStats]           = useState(null);
  const [analytics, setAnalytics]   = useState(null);
  const [chainValid, setChainValid] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getAnalytics(), validateChain()])
      .then(([s, a, c]) => {
        setStats(s.data.data);
        setAnalytics(a.data.data);
        setChainValid(c.data.valid);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard…</div>;

  // ── Analytics derived data ──
  const byType      = analytics?.byType      || [];
  const byRegion    = analytics?.byRegion    || [];
  const byProducer  = analytics?.byProducer  || [];
  const monthlyData = analytics?.monthlyData || [];
  const mostValuable = analytics?.mostValuable;
  const summary      = analytics?.summary || {};

  const sorted = [...monthlyData].sort((a, b) =>
    a._id.year !== b._id.year ? a._id.year - b._id.year : a._id.month - b._id.month
  );
  const monthLabels   = sorted.map(m => `${MONTHS[m._id.month - 1]} '${String(m._id.year).slice(2)}`);
  let running = 0;
  const cumValues     = sorted.map(m => { running += m.value; return running; });
  const monthlyCounts = sorted.map(m => m.bottles);

  const typeLabels  = byType.map(t => t._id);
  const typeCounts  = byType.map(t => t.count);
  const typeBg      = typeLabels.map(l => TYPE_COLORS[l] || "#aaa");

  const regionLabels = byRegion.map(r => r._id);
  const regionCounts = byRegion.map(r => r.count);
  const regionBg     = regionLabels.map((_, i) =>
    `rgba(123,28,46,${Math.max(0.25, 1 - i * 0.1).toFixed(2)})`
  );

  const prodLabels = byProducer.map(p => p._id);
  const prodCounts = byProducer.map(p => p.count);
  const prodBg     = prodLabels.map((_, i) => PRODUCER_COLORS[i % PRODUCER_COLORS.length]);

  const mostCommonType  = byType[0]?._id  || "—";
  const mostCommonCount = byType[0]?.count || 0;
  const avgValue = summary.totalBottles
    ? Math.round(summary.totalValue / summary.totalBottles) : 0;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Wine Chain blockchain inventory overview</p>

      {/* ── Inventory metrics ── */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Bottles</div>
          <div className="metric-value">{stats?.totalBottles || 0}</div>
          <div className="metric-sub">{stats?.uniqueWines || 0} unique wines</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Portfolio Value</div>
          <div className="metric-value">
            £{(stats?.totalValue || 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}
          </div>
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

      {/* ── Analytics summary metrics ── */}
      <div className="metrics-grid" style={{ marginBottom: 28 }}>
        <div className="metric-card">
          <div className="metric-label">Most Valuable Bottle</div>
          <div className="metric-value" style={{ fontSize: 16, lineHeight: 1.3 }}>
            {mostValuable?.name || "—"}
          </div>
          <div className="metric-sub">
            {mostValuable
              ? `£${mostValuable.purchasePrice.toLocaleString("en-GB")} · ${mostValuable.vintage} · ${mostValuable.type}`
              : "No bottles with price"}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Most Common Type</div>
          <div className="metric-value" style={{ fontSize: 22 }}>{mostCommonType}</div>
          <div className="metric-sub">{mostCommonCount} bottles</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg. Bottle Value</div>
          <div className="metric-value">£{avgValue.toLocaleString("en-GB")}</div>
          <div className="metric-sub">per bottle</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Top Region</div>
          <div className="metric-value" style={{ fontSize: 18, lineHeight: 1.3 }}>
            {byRegion[0]?._id || "—"}
          </div>
          <div className="metric-sub">{byRegion[0]?.count || 0} bottles</div>
        </div>
      </div>

      {/* ── Row 1: Portfolio value + Wine type doughnut ── */}
      <div className="chart-grid-3-2">
        <ChartCard title="Portfolio Value Over Time">
          {cumValues.length === 0 ? <Empty /> : (
            <Line
              data={{
                labels: monthLabels,
                datasets: [{
                  label: "Portfolio Value (£)",
                  data: cumValues,
                  fill: true,
                  borderColor: "#7b1c2e",
                  backgroundColor: "rgba(123,28,46,0.07)",
                  pointBackgroundColor: "#7b1c2e",
                  pointBorderColor: "#fff",
                  pointBorderWidth: 2,
                  tension: 0.4,
                  borderWidth: 2.5,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                }],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: ctx => ` £${ctx.raw.toLocaleString("en-GB")}` } },
                },
                scales: {
                  y: { ...baseScale, ticks: { ...baseScale.ticks, callback: v => `£${v >= 1000 ? (v/1000).toFixed(1)+"k" : v}` } },
                  x: noGridX,
                },
              }}
            />
          )}
        </ChartCard>

        <ChartCard title="Bottles by Wine Type">
          {typeCounts.length === 0 ? <Empty /> : (
            <div style={{ maxWidth: 240, margin: "0 auto" }}>
              <Doughnut
                data={{
                  labels: typeLabels,
                  datasets: [{ data: typeCounts, backgroundColor: typeBg, borderColor: "#fff", borderWidth: 3, hoverOffset: 8 }],
                }}
                options={{
                  responsive: true,
                  cutout: "65%",
                  plugins: {
                    legend: { position: "bottom", labels: { padding: 12, font: { size: 11 }, boxWidth: 11 } },
                    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} bottles` } },
                  },
                }}
              />
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: Monthly registrations + Top regions ── */}
      <div className="chart-grid-half">
        <ChartCard title="Monthly Registrations">
          {monthlyCounts.length === 0 ? <Empty /> : (
            <Bar
              data={{
                labels: monthLabels,
                datasets: [{
                  label: "Bottles",
                  data: monthlyCounts,
                  backgroundColor: "rgba(123,28,46,0.8)",
                  borderRadius: 6,
                  borderSkipped: false,
                }],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ...baseScale, ticks: { ...baseScale.ticks, stepSize: 1 } },
                  x: noGridX,
                },
              }}
            />
          )}
        </ChartCard>

        <ChartCard title="Top Regions">
          {regionCounts.length === 0 ? <Empty /> : (
            <Bar
              data={{
                labels: regionLabels,
                datasets: [{
                  label: "Bottles",
                  data: regionCounts,
                  backgroundColor: regionBg,
                  borderRadius: 6,
                  borderSkipped: false,
                }],
              }}
              options={{
                indexAxis: "y",
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ...baseScale, ticks: { ...baseScale.ticks, stepSize: 1 } },
                  y: noGridX,
                },
              }}
            />
          )}
        </ChartCard>
      </div>

      {/* ── Row 3: Top producers ── */}
      <ChartCard title="Top Producers">
        {prodCounts.length === 0 ? <Empty /> : (
          <Bar
            data={{
              labels: prodLabels,
              datasets: [{
                label: "Wines",
                data: prodCounts,
                backgroundColor: prodBg,
                borderRadius: 6,
                borderSkipped: false,
              }],
            }}
            options={{
              indexAxis: "y",
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ...baseScale, ticks: { ...baseScale.ticks, stepSize: 1 } },
                y: noGridX,
              },
            }}
          />
        )}
      </ChartCard>

      {/* ── Row 4: Inventory tables ── */}
      <div className="chart-grid-tables">
        <div className="card">
          <div className="card-title">Inventory by type</div>
          {stats?.byType?.length === 0 && <Empty />}
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
          {stats?.byStatus?.length === 0 && <Empty />}
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
