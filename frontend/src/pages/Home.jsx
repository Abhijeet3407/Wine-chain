import React from "react";

export default function Home({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>

      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        padding: "clamp(48px, 8vw, 80px) clamp(16px, 4vw, 32px)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(120,80,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,100,100,0.1) 0%, transparent 40%)",
        }} />
        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20,
            padding: "6px 16px", fontSize: 12, color: "rgba(255,255,255,0.8)",
            marginBottom: 24, letterSpacing: "0.08em", fontWeight: 600
          }}>
            ◆ BLOCKCHAIN SECURED
          </div>
          <h1 style={{
            fontSize: "clamp(34px, 8vw, 56px)", fontWeight: 800, color: "#fff",
            marginBottom: 16, lineHeight: 1.1, letterSpacing: "-1.5px"
          }}>
            Wine Chain
          </h1>
          <p style={{
            fontSize: "clamp(14px, 3vw, 18px)", color: "rgba(255,255,255,0.65)",
            marginBottom: 40, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 40px"
          }}>
            The world's most secure wine inventory system. Every bottle tracked on an immutable blockchain.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onNavigate("inventory")} style={{
              padding: "14px 28px", background: "#fff", color: "#1a1a1a",
              border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: "pointer", transition: "all 0.15s"
            }}>
              View Inventory →
            </button>
            <button onClick={() => onNavigate("add")} style={{
              padding: "14px 28px", background: "rgba(255,255,255,0.1)",
              color: "#fff", border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: "pointer"
            }}>
              + Register Bottle
            </button>
          </div>
        </div>

        {/* Floating stats */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 20,
          marginTop: 60, flexWrap: "wrap"
        }}>
          {[
            { label: "SHA-256 Blockchain", icon: "◆" },
            { label: "MongoDB Atlas Cloud", icon: "●" },
            { label: "QR Code Per Bottle", icon: "▣" },
            { label: "PDF Export", icon: "▤" },
          ].map(f => (
            <div key={f.label} style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, padding: "12px 20px",
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500
            }}>
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: "clamp(40px, 6vw, 72px) clamp(16px, 4vw, 32px)", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.8px", marginBottom: 12 }}>
            Everything you need
          </h2>
          <p style={{ fontSize: 16, color: "#888", maxWidth: 480, margin: "0 auto" }}>
            A complete system for tracking, verifying and managing your wine collection.
          </p>
        </div>

        <div className="home-features-grid">
          {[
            {
              icon: "◆",
              title: "Immutable Blockchain",
              desc: "Every registration and transfer is recorded as a SHA-256 proof-of-work block. Tampering is mathematically impossible.",
              color: "#f0f0ff", accent: "#4040cc"
            },
            {
              icon: "○",
              title: "Instant Verification",
              desc: "Scan a QR code or enter a bottle ID to instantly verify its full provenance and ownership history.",
              color: "#f0fff4", accent: "#1e7a40"
            },
            {
              icon: "→",
              title: "Ownership Transfer",
              desc: "Transfer ownership between parties with full audit trail. Every transfer is permanently recorded on chain.",
              color: "#fff8f0", accent: "#c05a00"
            },
            {
              icon: "▣",
              title: "QR Codes",
              desc: "Generate a unique QR code for every bottle that links directly to its blockchain verification page.",
              color: "#f0f8ff", accent: "#1a5fa0"
            },
            {
              icon: "▤",
              title: "PDF Reports",
              desc: "Export your entire inventory as a professional PDF report with full details and portfolio value.",
              color: "#fff0f5", accent: "#a0305a"
            },
            {
              icon: "●",
              title: "Cloud Storage",
              desc: "All data is securely stored on MongoDB Atlas with automatic backups and 99.9% uptime.",
              color: "#f5f0ff", accent: "#6030a0"
            },
          ].map(f => (
            <div key={f.title} style={{
              background: f.color, borderRadius: 14,
              padding: "28px 26px", border: `1px solid ${f.accent}22`
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: `${f.accent}18`, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 22, marginBottom: 16
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 8, letterSpacing: "-0.2px" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "#faf9f7", padding: "clamp(40px, 6vw, 72px) clamp(16px, 4vw, 32px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.8px", marginBottom: 12 }}>
              How it works
            </h2>
          </div>
          <div className="home-steps-grid">
            {[
              { step: "01", title: "Register", desc: "Add your bottle with details and photo. A blockchain block is mined.", icon: "◆" },
              { step: "02", title: "Store", desc: "Data is saved to MongoDB Atlas cloud with full blockchain record.", icon: "●" },
              { step: "03", title: "Transfer", desc: "Record ownership changes permanently on the blockchain.", icon: "→" },
              { step: "04", title: "Verify", desc: "Anyone can verify authenticity using the bottle ID or QR code.", icon: "✓" },
            ].map(s => (
              <div key={s.step} style={{
                background: "#fff", borderRadius: 14,
                padding: "24px 20px", border: "1px solid #e8e6e0",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#bbb",
                  letterSpacing: "0.1em", marginBottom: 8
                }}>
                  STEP {s.step}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        padding: "clamp(40px, 6vw, 72px) clamp(16px, 4vw, 32px)", textAlign: "center"
      }}>
        <h2 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, color: "#fff", marginBottom: 16, letterSpacing: "-0.8px" }}>
          Ready to get started?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 36 }}>
          Register your first bottle on the blockchain today.
        </p>
        <button onClick={() => onNavigate("add")} style={{
          padding: "16px 36px", background: "#fff", color: "#1a1a1a",
          border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
          cursor: "pointer"
        }}>
          Register First Bottle →
        </button>
      </div>

      {/* Footer */}
      <div style={{
        background: "#0f0f0f", padding: "24px 32px",
        textAlign: "center", fontSize: 12, color: "#555"
      }}>
        Wine Chain — Blockchain Wine Inventory System &nbsp;·&nbsp; React · Node.js · MongoDB · SHA-256 PoW
      </div>
    </div>
  );
}
