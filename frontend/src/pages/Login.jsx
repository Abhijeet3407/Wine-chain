import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login({ onNavigate, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "https://wine-chain-backend.onrender.com/api/auth/login",
        {
          email: form.email,
          password: form.password,
        },
      );
      toast.success("Verification code sent to your email!");
      onNavigate("verify2fa", res.data.userId);
    } catch (e) {
      toast.error(e.response?.data?.error || "Login failed");
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
              fontSize: 24,
              margin: "0 auto 12px",
            }}
          >
            🍷
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#1a1a1a",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
            Sign in to your Wine Chain account
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="your@email.com"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Your password"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "12px",
            fontSize: 14,
          }}
        >
          {loading ? "Signing in…" : "Sign in →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#888" }}>
            Don't have an account?{" "}
            <span
              onClick={() => onNavigate("signup")}
              style={{ color: "#7b1c2e", fontWeight: 700, cursor: "pointer" }}
            >
              Sign up
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
          🔐 After login you will receive a <strong>6-digit code</strong> to
          your email for 2FA verification
        </div>
      </div>
    </div>
  );
}
