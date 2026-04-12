import React from "react";
import { QRCodeSVG } from "qrcode.react";

export default function QRModal({ bottle, onClose }) {
  if (!bottle) return null;

  const verifyURL = `http://localhost:3000/verify/${bottle.bottleId}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-title">QR Code — {bottle.bottleId}</div>

        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <QRCodeSVG value={verifyURL} size={200} level="H" />
        </div>

        <div style={{ fontSize: 13, color: "#555", marginBottom: 12 }}>
          <strong style={{ fontWeight: 500 }}>{bottle.name}</strong> {bottle.vintage}<br />
          {bottle.producer} · {bottle.region}<br />
          Owner: <strong style={{ fontWeight: 500 }}>{bottle.currentOwner}</strong>
        </div>

        <div style={{ fontSize: 11, color: "#999", wordBreak: "break-all", fontFamily: "monospace", background: "#f5f4f0", padding: "8px 10px", borderRadius: 6 }}>
          {verifyURL}
        </div>

        <div className="btn-group" style={{ marginTop: 14 }}>
          <button className="btn" onClick={() => window.print()}>🖨 Print QR</button>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}