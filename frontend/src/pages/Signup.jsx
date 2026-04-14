import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Signup({ onNavigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success("Account created! Please log in.");
      onNavigate("login");
    } catch (e) {
      toast.error(e.response?.data?.error || "Signup failed. Please try again.");
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
          maxWidth: 440,
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
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#1a1a1a",
              letterSpacing: "-0.5px",
            }}
          >
            Create account
          </h1>
          <p style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
            Join Wine Chain blockchain inventory
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label>Full name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Email address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="your@email.com"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min 6 characters"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Confirm password *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="Repeat password"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
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
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "#888",
            marginTop: 16,
          }}
        >
          Already have an account?{" "}
          <span
            onClick={() => !loading && onNavigate("login")}
            style={{
              color: "#7b1c2e",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
            }}
          >
            Log in
          </span>
        </p>

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
          A <strong>6-digit verification code</strong> will be sent to your
          email address each time you sign in
        </div>
      </div>
    </div>
  );
}
