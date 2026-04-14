import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Signup({ onNavigate }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
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
      await axios.post(
        "/api/auth/signup",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        },
      );
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
            />
          </div>
          <div className="form-group">
            <label>Email address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Phone number *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+44 7700 000000"
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="form-group">
            <label>Confirm password *</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="Repeat password"
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
            onClick={() => onNavigate("login")}
            style={{ color: "#7b1c2e", fontWeight: 700, cursor: "pointer" }}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
