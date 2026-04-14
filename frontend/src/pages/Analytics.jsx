import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { getAnalytics } from "../utils/api";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
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

const card = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #ece9e2",
  padding: "24px 26px",
};

function ChartCard({ title, children }) {
  return (
    <div style={card}>
      <div className="card-title">{title}</div>
      {children}
    </div>
  );
}

function Empty() {
  return <div className="empty" style={{ padding: "40px 0" }}>No data yet</div>;
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAnalytics()
      .then((r) => setData(r.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading analytics…</div>;
  if (error) return <div className="empty">Could not load analytics: {error}</div>;

  const { byType, byRegion, byProducer, monthlyData, mostValuable, summary } = data;

  // --- Portfolio value over time (cumulative) ---
  const sorted = [...monthlyData].sort((a, b) =>
    a._id.year !== b._id.year ? a._id.year - b._id.year : a._id.month - b._id.month
  );
  const monthLabels = sorted.map(
    (m) => `${MONTHS[m._id.month - 1]} '${String(m._id.year).slice(2)}`
  );
  let running = 0;
  const cumValues = sorted.map((m) => { running += m.value; return running; });
  const monthlyCounts = sorted.map((m) => m.bottles);

  // --- Type doughnut ---
  const typeLabels  = byType.map((t) => t._id);
  const typeCounts  = byType.map((t) => t.count);
  const typeColors  = typeLabels.map((l) => TYPE_COLORS[l] || "#aaa");

  // --- Regions ---
  const regionLabels = byRegion.map((r) => r._id);
  const regionCounts = byRegion.map((r) => r.count);
  const regionBg     = regionLabels.map((_, i) =>
    `rgba(123,28,46,${Math.max(0.25, 1 - i * 0.1).toFixed(2)})`
  );

  // --- Producers ---
  const prodLabels = byProducer.map((p) => p._id);
  const prodCounts = byProducer.map((p) => p.count);
  const prodBg     = prodLabels.map((_, i) => PRODUCER_COLORS[i % PRODUCER_COLORS.length]);

  // --- Summary ---
  const mostCommonType  = byType[0]?._id  || "—";
  const mostCommonCount = byType[0]?.count || 0;
  const avgValue = summary.totalBottles
    ? Math.round(summary.totalValue / summary.totalBottles)
    : 0;

  const baseScaleOpts = {
    grid: { color: "#f0ede6" },
    ticks: { font: { size: 11, family: "Inter, system-ui, sans-serif" } },
  };
  const noGridX = { ...baseScaleOpts, grid: { display: false } };

  return (
    <div>
      <h1 className="page-title">Analytics</h1>
      <p className="page-sub">Advanced insights about your wine collection</p>

      {/* ── Summary Cards ── */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card">
          <div className="metric-label">Total Portfolio Value</div>
          <div className="metric-value">
            £{(summary.totalValue || 0).toLocaleString("en-GB", { maximumFractionDigits: 0 })}
          </div>
          <div className="metric-sub">at purchase price</div>
        </div>

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

        <div className="metric-card accent">
          <div className="metric-label">Most Common Type</div>
          <div className="metric-value" style={{ fontSize: 24 }}>{mostCommonType}</div>
          <div className="metric-sub">{mostCommonCount} bottles</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Avg. Bottle Value</div>
          <div className="metric-value">
            £{avgValue.toLocaleString("en-GB")}
          </div>
          <div className="metric-sub">per bottle</div>
        </div>
      </div>

      {/* ── Row 1: Line + Doughnut ── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20, marginBottom: 20 }}>
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
                  tooltip: {
                    callbacks: {
                      label: (ctx) => ` £${ctx.raw.toLocaleString("en-GB")}`,
                    },
                  },
                },
                scales: {
                  y: {
                    ...baseScaleOpts,
                    ticks: {
                      ...baseScaleOpts.ticks,
                      callback: (v) => `£${v >= 1000 ? (v/1000).toFixed(1)+"k" : v}`,
                    },
                  },
                  x: noGridX,
                },
              }}
            />
          )}
        </ChartCard>

        <ChartCard title="Bottles by Wine Type">
          {typeCounts.length === 0 ? <Empty /> : (
            <div style={{ maxWidth: 260, margin: "0 auto" }}>
              <Doughnut
                data={{
                  labels: typeLabels,
                  datasets: [{
                    data: typeCounts,
                    backgroundColor: typeColors,
                    borderColor: "#fff",
                    borderWidth: 3,
                    hoverOffset: 8,
                  }],
                }}
                options={{
                  responsive: true,
                  cutout: "65%",
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { padding: 14, font: { size: 12 }, boxWidth: 12 },
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.raw} bottles`,
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: Monthly registrations + Top regions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
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
                  y: { ...baseScaleOpts, ticks: { ...baseScaleOpts.ticks, stepSize: 1 } },
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
                  x: { ...baseScaleOpts, ticks: { ...baseScaleOpts.ticks, stepSize: 1 } },
                  y: { ...noGridX },
                },
              }}
            />
          )}
        </ChartCard>
      </div>

      {/* ── Row 3: Top Producers ── */}
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
                x: { ...baseScaleOpts, ticks: { ...baseScaleOpts.ticks, stepSize: 1 } },
                y: { ...noGridX },
              },
            }}
          />
        )}
      </ChartCard>
    </div>
  );
}
