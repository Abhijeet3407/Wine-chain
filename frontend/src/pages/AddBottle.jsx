import React, { useState } from "react";
import { addBottle } from "../utils/api";
import { toast } from "react-toastify";

const INITIAL = {
  name: "",
  vintage: "",
  type: "Red",
  region: "",
  producer: "",
  quantity: "",
  purchasePrice: "",
  description: "",
};

export default function AddBottle({ onNavigate }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [lastBlock, setLastBlock] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.vintage ||
      !form.region ||
      !form.producer ||
      !form.quantity ||
      !form.purchasePrice
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((k) => formData.append(k, form[k]));
      formData.set("vintage", Number(form.vintage));
      formData.set("quantity", Number(form.quantity));
      formData.set("purchasePrice", Number(form.purchasePrice) || 0);
      if (image) formData.append("image", image);
      const res = await addBottle(formData);
      setLastBlock(res.data.block);
      toast.success(
        `${res.data.data.bottleId} registered on Block #${res.data.block.index}`,
      );
      setForm(INITIAL);
      setImage(null);
      setPreview(null);
    } catch (e) {
      toast.error(e.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Register bottle</h1>
      <p className="page-sub">Add a new wine bottle to the blockchain</p>

      <div className="card">
        <div className="card-title">Bottle details</div>
        <div className="form-grid">
          <div className="form-group">
            <label>Wine name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Château Margaux"
            />
          </div>
          <div className="form-group">
            <label>Vintage year *</label>
            <input
              type="number"
              value={form.vintage}
              onChange={(e) => set("vintage", e.target.value)}
              placeholder="2018"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
          <div className="form-group">
            <label>Type *</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
            >
              {[
                "Red",
                "White",
                "Rosé",
                "Sparkling",
                "Dessert",
                "Fortified",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Region *</label>
            <input
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
              placeholder="e.g. Bordeaux, France"
            />
          </div>
          <div className="form-group">
            <label>Producer *</label>
            <input
              value={form.producer}
              onChange={(e) => set("producer", e.target.value)}
              placeholder="e.g. Château Margaux SA"
            />
          </div>
          <div className="form-group">
            <label>Quantity *</label>
            <input
              type="number"
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              placeholder="e.g. 6"
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Purchase price (£) *</label>
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => set("purchasePrice", e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group full">
            <label>
              Description / notes{" "}
              <span style={{ color: "#bbb", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional tasting notes or details…"
            />
          </div>
          <div className="form-group full">
            <label>
              Bottle image{" "}
              <span style={{ color: "#bbb", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                style={{
                  marginTop: 8,
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
            )}
          </div>
        </div>
        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Mining block…" : "Register on blockchain"}
          </button>
          <button
            className="btn"
            onClick={() => {
              setForm(INITIAL);
              setImage(null);
              setPreview(null);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {lastBlock && (
        <div className="card">
          <div className="card-title" style={{ color: "#1e7a40" }}>
            ✓ Block mined successfully
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              fontSize: 13,
            }}
          >
            <div>
              <span style={{ color: "#888" }}>Block index:</span>{" "}
              <strong>#{lastBlock.index}</strong>
            </div>
            <div>
              <span style={{ color: "#888" }}>Nonce:</span>{" "}
              <strong>{lastBlock.nonce}</strong>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <span style={{ color: "#888" }}>Hash:</span>
              <br />
              <span
                className="hash-text"
                style={{ fontSize: 12, wordBreak: "break-all" }}
              >
                {lastBlock.hash}
              </span>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <span style={{ color: "#888" }}>Previous hash:</span>
              <br />
              <span
                className="hash-text"
                style={{ fontSize: 12, wordBreak: "break-all" }}
              >
                {lastBlock.previousHash}
              </span>
            </div>
          </div>
          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={() => onNavigate("inventory")}
            >
              View inventory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
