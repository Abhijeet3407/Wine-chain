import React, { useEffect, useState } from "react";
import { verifyBottle } from "../utils/api";
import { toast } from "react-toastify";

export default function Verify({ preselect }) {
  const [query, setQuery] = useState(preselect || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (preselect) handleVerify(preselect); }, []);

  const handleVerify = async (q) => {
    const id = (q || query).trim();
    if (!id) { toast.error("Enter a bottle ID or hash"); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyBottle(id);
      setResult(res.data);
    } catch (e) {
      setResult({ verified: false, message: e.response?.data?.error || "Not found on blockchain" });
    } finally {
      setLoading(false);
    }
  };

  const TYPE_BADGE = { Red: "badge-red", White: "badge-white", Rosé: "badge-rose", Sparkling: "badge-sparkling", Dessert: "badge-dessert", Fortified: "badge-fortified" };

  return (
    <div>
      <h1 className="page-title">Verify authenticity</h1>
      <p className="page-sub">Confirm a bottle's provenance using the blockchain</p>

      <div className="card">
        <div className="card-title">Lookup</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="search-input" style={{ flex: 1, width: "auto" }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter bottle ID (e.g. WINE-0001) or block hash…" onKeyDown={e => e.key === "Enter" && handleVerify()} />
          <button className="btn btn-primary" onClick={() => handleVerify()} disabled={loading}>{loading ? "Verifying…" : "Verify"}</button>
        </div>

        {result && (
          <div className={result.verified ? "verify-success" : "verify-fail"} style={{ marginTop: 14 }}>
            <strong>{result.verified ? "✓ Authentic" : "✗ Not verified"}</strong> — {result.message}
          </div>
        )}
      </div>

      {result?.bottle && (
        <div className="card">
          <div className="card-title">Bottle record</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13, marginBottom: 16 }}>
            <div><span style={{ color: "#888" }}>ID</span><br /><strong className="hash-text">{result.bottle.bottleId}</strong></div>
            <div><span style={{ color: "#888" }}>Name</span><br /><strong style={{ fontWeight: 500 }}>{result.bottle.name} {result.bottle.vintage}</strong></div>
            <div><span style={{ color: "#888" }}>Type</span><br /><span className={`badge ${TYPE_BADGE[result.bottle.type]}`}>{result.bottle.type}</span></div>
            <div><span style={{ color: "#888" }}>Region</span><br />{result.bottle.region}</div>
            <div><span style={{ color: "#888" }}>Producer</span><br />{result.bottle.producer}</div>
            <div><span style={{ color: "#888" }}>Current owner</span><br /><strong style={{ fontWeight: 500 }}>{result.bottle.currentOwner}</strong></div>
          </div>

          {result.bottle.transferHistory?.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: "#555" }}>Transfer history ({result.bottle.transferHistory.length})</div>
              {result.bottle.transferHistory.map((t, i) => (
                <div key={i} style={{ padding: "10px 12px", background: "#faf9f6", borderRadius: 8, marginBottom: 6, fontSize: 13, border: "1px solid #ebe9e0" }}>
                  <strong style={{ fontWeight: 500 }}>{t.fromOwner}</strong> → <strong style={{ fontWeight: 500 }}>{t.toOwner}</strong>
                  {t.price > 0 && <span style={{ color: "#888" }}> · £{t.price.toLocaleString()}</span>}
                  {t.notes && <span style={{ color: "#888" }}> · {t.notes}</span>}
                  <br /><span className="hash-text" style={{ fontSize: 11 }}>{t.blockHash?.substring(0, 20)}…</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {result?.blocks?.length > 0 && (
        <div className="card">
          <div className="card-title">Provenance chain ({result.blocks.length} blocks)</div>
          {result.blocks.map(block => (
            <div className="chain-block" key={block._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span className="block-index">Block #{block.index}</span>
                <span style={{ fontSize: 11, color: "#999" }}>{new Date(block.timestamp).toLocaleString("en-GB")}</span>
              </div>
              <div className="block-type">{block.data?.type}</div>
              <div className="block-action">{block.data?.action}</div>
              <div className="block-hashes">
                <div className="block-hash-item"><span>Hash: </span><span className="hash-text">{block.hash.substring(0, 24)}…</span></div>
                <div className="block-hash-item"><span>Prev: </span><span className="hash-text">{block.previousHash.substring(0, 24)}…</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
