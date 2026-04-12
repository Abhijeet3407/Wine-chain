import React, { useEffect, useState, useCallback } from "react";
import { getBottles, deleteBottle } from "../utils/api";
import QRModal from "../components/QRModal";
import exportToPDF from "../utils/exportPDF";
import { toast } from "react-toastify";

const TYPE_BADGE = {
  Red: "badge-red",
  White: "badge-white",
  Rosé: "badge-rose",
  Sparkling: "badge-sparkling",
  Dessert: "badge-dessert",
  Fortified: "badge-fortified",
};

export default function Inventory({ onNavigate }) {
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrBottle, setQrBottle] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchBottles = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    getBottles(params)
      .then((r) => setBottles(r.data.data))
      .catch(() => toast.error("Failed to load bottles"))
      .finally(() => setLoading(false));
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    fetchBottles();
  }, [fetchBottles]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from inventory?`)) return;
    try {
      await deleteBottle(id);
      toast.success("Bottle removed");
      fetchBottles();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-sub">All registered bottles on the blockchain</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn"
            onClick={() => exportToPDF(bottles)}
            disabled={bottles.length === 0}
          >
            📄 Export PDF
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate("add")}>
            + Register bottle
          </button>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search name, region, producer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All types</option>
            {["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified"].map(
              (t) => (
                <option key={t}>{t}</option>
              ),
            )}
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {["Active", "Transferred", "Consumed", "Lost"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className="btn btn-sm"
            onClick={() => {
              setSearch("");
              setTypeFilter("");
              setStatusFilter("");
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading…</div>
        ) : bottles.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🍷</div>No bottles found. Register your
            first bottle!
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Wine</th>
                  <th>Vintage</th>
                  <th>Type</th>
                  <th>Region</th>
                  <th>Qty</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Block hash</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bottles.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="hash-text">{b.bottleId}</span>
                    </td>
                    <td>
                      {b.imageUrl ? (
                        <img
                          src={b.imageUrl}
                          alt={b.name}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #ddd",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                            background: "#f0ede6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                          }}
                        >
                          🍷
                        </div>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontWeight: 500 }}>{b.name}</strong>
                      <br />
                      <span style={{ fontSize: 11, color: "#999" }}>
                        {b.producer}
                      </span>
                    </td>
                    <td>{b.vintage}</td>
                    <td>
                      <span
                        className={`badge ${TYPE_BADGE[b.type] || "badge-red"}`}
                      >
                        {b.type}
                      </span>
                    </td>
                    <td>{b.region}</td>
                    <td>{b.quantity}</td>
                    <td>{b.currentOwner}</td>
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <span className="hash-text">
                        {b.latestBlockHash?.substring(0, 12)}…
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="btn btn-sm"
                          onClick={() => setQrBottle(b)}
                        >
                          QR
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => onNavigate("verify", b.bottleId)}
                        >
                          Verify
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => onNavigate("transfer", b.bottleId)}
                        >
                          Transfer
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(b.bottleId, b.name)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QRModal bottle={qrBottle} onClose={() => setQrBottle(null)} />
    </div>
  );
}
