import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Verify2FA({ userId, prefillCode, onLogin, onNavigate }) {
  const [code, setCode] = useState(prefillCode || "");
  const [loading, setLoading] = useState(false);
  const emailFailed = !!prefillCode;

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verify-2fa", { userId, code });
      localStorage.setItem("winechain_token", res.data.token);
      localStorage.setItem("winechain_user", JSON.stringify(res.data.user));
      // Store device trust token — survives logout, valid for 2 hours
      if (res.data.deviceToken) {
        localStorage.setItem("winechain_device", JSON.stringify({
          email: res.data.user.email,
          token: res.data.deviceToken,
        }));
      }
      toast.success(`Welcome back, ${res.data.user.name}!`);
      onLogin(res.data.user, res.data.token);
    } catch (e) {
      toast.error(e.response?.data?.error || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "linear-gradient(135deg, #7b1c2e, #c0392b)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-1px",
              fontFamily: "Georgia, serif",
              margin: "0 auto 12px",
            }}
          >
            W
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.5px" }}>
            {emailFailed ? "Your login code" : "Check your email"}
          </h1>
          <p style={{ fontSize: 13, color: "#999", marginTop: 4, lineHeight: 1.6 }}>
            {emailFailed
              ? "Email could not be delivered. Your one-time code is shown below."
              : "We sent a 6-digit verification code to your email address."}
          </p>
        </div>

        {/* Fallback code banner — shown when email failed */}
        {emailFailed && (
          <div
            style={{
              background: "#fff8e1",
              border: "1px solid #ffe082",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "#795548", marginBottom: 8, letterSpacing: "0.06em" }}>
              YOUR ONE-TIME CODE
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: 10,
                color: "#7b1c2e",
                fontFamily: "monospace",
              }}
            >
              {prefillCode}
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>
              ⚠️ Email delivery unavailable — expires in 10 min
            </div>
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label>6-digit verification code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            style={{ textAlign: "center", fontSize: 28, fontWeight: 800, letterSpacing: 10 }}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          style={{ width: "100%", padding: "12px", fontSize: 14 }}
        >
          {loading ? "Verifying…" : "Verify & Login →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#888" }}>
            Didn't receive the code?{" "}
            <span
              onClick={() => onNavigate("login")}
              style={{ color: "#7b1c2e", fontWeight: 700, cursor: "pointer" }}
            >
              Try again
            </span>
          </p>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: "12px 14px",
            background: "#f8f7f4",
            borderRadius: 8,
            fontSize: 12,
            color: "#888",
            textAlign: "center",
          }}
        >
          Code expires in <strong>10 minutes</strong>
        </div>
      </div>
    </div>
  );
}
