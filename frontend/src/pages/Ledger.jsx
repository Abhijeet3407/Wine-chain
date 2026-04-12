import React, { useEffect, useState } from "react";
import { getChain, validateChain } from "../utils/api";

export default function Ledger() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchChain = (p = 1) => {
    setLoading(true);
    getChain({ page: p, limit: 15 })
      .then(r => { setBlocks(r.data.data); setPages(r.data.pages); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChain(page);
    validateChain().then(r => setValid(r.data.valid)).catch(() => setValid(false));
  }, [page]);

  const TYPE_COLORS = { REGISTER: "#1e7a40", TRANSFER: "#1a5fa0", GENESIS: "#5a3aa0" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Blockchain ledger</h1>
          <p className="page-sub">{total} total blocks · newest first</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 8, background: valid ? "#edf7f0" : "#fdf0ee", border: `1px solid ${valid ? "#a0ddb0" : "#f5c8c0"}`, fontSize: 13, fontWeight: 500, color: valid ? "#1e5a35" : "#8a2a18" }}>
          {valid === null ? "Checking…" : valid ? "✓ Chain valid" : "✗ Chain issue"}
        </div>
      </div>

      {loading ? <div className="loading">Loading chain…</div> : blocks.length === 0 ? (
        <div className="card"><div className="empty"><div className="empty-icon">⛓️</div>No blocks yet. Register a bottle to create the genesis block.</div></div>
      ) : (
        <>
          {blocks.map(block => (
            <div className="chain-block" key={block._id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="block-index">Block #{block.index}</span>
                <span style={{ fontSize: 11, color: "#999" }}>{new Date(block.timestamp).toLocaleString("en-GB")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: TYPE_COLORS[block.data?.type] || "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>{block.data?.type}</span>
                {block.bottleId && <span style={{ fontSize: 11, color: "#888" }}>· {block.bottleId.bottleId} {block.bottleId.name}</span>}
              </div>
              {block.data?.action && <div className="block-action">{block.data.action}</div>}
              <div className="block-hashes" style={{ marginTop: 8 }}>
                <div className="block-hash-item"><span style={{ color: "#999", fontSize: 11 }}>Hash: </span><span className="hash-text">{block.hash}</span></div>
                <div className="block-hash-item"><span style={{ color: "#999", fontSize: 11 }}>Prev: </span><span className="hash-text">{block.previousHash.substring(0, 32)}…</span></div>
                <div className="block-hash-item"><span style={{ color: "#999", fontSize: 11 }}>Nonce: </span><span style={{ fontFamily: "monospace", fontSize: 11 }}>{block.nonce}</span></div>
              </div>
            </div>
          ))}

          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
              <button className="btn btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ fontSize: 13, color: "#888", padding: "5px 0" }}>Page {page} of {pages}</span>
              <button className="btn btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
