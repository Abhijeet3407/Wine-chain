import React, { useEffect, useState } from "react";
import { getBottles, transferBottle } from "../utils/api";
import { toast } from "react-toastify";

export default function Transfer({ preselect, onNavigate }) {
  const [bottles, setBottles] = useState([]);
  const [selectedId, setSelectedId] = useState(preselect || "");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ toOwner: "", price: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [lastBlock, setLastBlock] = useState(null);

  useEffect(() => {
    getBottles().then(r => setBottles(r.data.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedId) setSelected(bottles.find(b => b.bottleId === selectedId) || null);
  }, [selectedId, bottles]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleTransfer = async () => {
    if (!selected) { toast.error("Select a bottle"); return; }
    if (!form.toOwner.trim()) { toast.error("Enter new owner name"); return; }
    if (form.toOwner.trim() === selected.currentOwner) { toast.error("New owner is same as current owner"); return; }
    setLoading(true);
    try {
      const res = await transferBottle(selected.bottleId, { toOwner: form.toOwner, price: Number(form.price) || 0, notes: form.notes });
      setLastBlock(res.data.block);
      toast.success(`Transfer recorded on Block #${res.data.block.index}`);
      setForm({ toOwner: "", price: "", notes: "" });
      setSelected(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.error || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Transfer ownership</h1>
      <p className="page-sub">Record a change of ownership on the blockchain</p>

      <div className="card">
        <div className="card-title">Select bottle</div>
        <div className="form-group">
          <label>Bottle</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">— Select a bottle —</option>
            {bottles.map(b => <option key={b._id} value={b.bottleId}>{b.bottleId} — {b.name} {b.vintage} ({b.currentOwner})</option>)}
          </select>
        </div>

        {selected && (
          <div style={{ marginTop: 14, padding: "12px 14px", background: "#faf9f6", borderRadius: 8, border: "1px solid #ebe9e0", fontSize: 13 }}>
            <strong style={{ fontWeight: 500 }}>{selected.name}</strong> {selected.vintage} · {selected.type} · {selected.region}<br />
            <span style={{ color: "#888" }}>Current owner:</span> {selected.currentOwner} &nbsp;|&nbsp;
            <span style={{ color: "#888" }}>Transfers:</span> {selected.transferHistory?.length || 0}
          </div>
        )}
      </div>

      {selected && (
        <div className="card">
          <div className="card-title">Transfer details</div>
          <div className="form-grid">
            <div className="form-group"><label>Current owner</label><input value={selected.currentOwner} readOnly /></div>
            <div className="form-group"><label>New owner *</label><input value={form.toOwner} onChange={e => set("toOwner", e.target.value)} placeholder="Recipient full name" /></div>
            <div className="form-group"><label>Sale price (£)</label><input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" min="0" step="0.01" /></div>
            <div className="form-group"><label>Notes</label><input value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes…" /></div>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleTransfer} disabled={loading}>{loading ? "Mining block…" : "Record transfer"}</button>
          </div>
        </div>
      )}

      {lastBlock && (
        <div className="card">
          <div className="card-title" style={{ color: "#1e7a40" }}>✓ Transfer recorded on chain</div>
          <div style={{ fontSize: 13, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><span style={{ color: "#888" }}>Block:</span> <strong>#{lastBlock.index}</strong></div>
            <div><span style={{ color: "#888" }}>Nonce:</span> <strong>{lastBlock.nonce}</strong></div>
            <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#888" }}>Hash:</span><br /><span className="hash-text" style={{ fontSize: 12, wordBreak: "break-all" }}>{lastBlock.hash}</span></div>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => onNavigate("inventory")}>View inventory</button>
          </div>
        </div>
      )}
    </div>
  );
}
