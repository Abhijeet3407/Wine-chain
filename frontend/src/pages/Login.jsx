import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Login({ onNavigate, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const retryTimer = useRef(null);
  const countTimer = useRef(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Clean up timers on unmount
  useEffect(() => () => {
    clearTimeout(retryTimer.current);
    clearInterval(countTimer.current);
  }, []);

  const attemptLogin = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    if (res.data.emailSent) {
      toast.success("Verification code sent to your email!");
    } else {
      toast.info("Email unavailable — your code is shown on the next screen.");
    }
    // Pass both userId and optional fallbackCode to the verify screen
    onNavigate("verify2fa", {
      userId: res.data.userId,
      fallbackCode: res.data.fallbackCode || null,
    });
  };

  const scheduleRetry = (email, password, attempt) => {
    if (attempt > 7) {
      setWakingUp(false);
      setLoading(false);
      toast.error("Server took too long to wake up. Please try again.");
      return;
    }

    const WAIT = 10; // seconds between retries
    setCountdown(WAIT);
    countTimer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) clearInterval(countTimer.current);
        return c - 1;
      });
    }, 1000);

    retryTimer.current = setTimeout(async () => {
      try {
        await attemptLogin(email, password);
        setWakingUp(false);
        setLoading(false);
      } catch (err) {
        const s = err.response?.status;
        const msg = err.response?.data?.error || "";
        // Only retry on true server-sleeping signals — 500 is a permanent error
        const isRetryable = !err.response || s === 502 || s === 503 || s === 504;
        if (isRetryable) {
          scheduleRetry(email, password, attempt + 1);
        } else {
          setWakingUp(false);
          setLoading(false);
          toast.error(msg || "Login failed");
        }
      }
    }, WAIT * 1000);
  };

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }
    // Cancel any in-progress retry
    clearTimeout(retryTimer.current);
    clearInterval(countTimer.current);
    setLoading(true);
    setWakingUp(false);

    try {
      await attemptLogin(form.email, form.password);
      setLoading(false);
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.error || "";
      // Only retry on true server-sleeping signals — 500 is a permanent error
      const isRetryable = !e.response || status === 502 || status === 503 || status === 504;
      if (isRetryable) {
        // Render free tier sleeping OR email service unavailable — retry automatically
        setWakingUp(true);
        toast.info("Server is starting up (free tier). Retrying automatically…");
        scheduleRetry(form.email, form.password, 1);
      } else {
        setLoading(false);
        toast.error(msg || "Login failed");
      }
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

        {/* Waking-up banner */}
        {wakingUp && (
          <div
            style={{
              background: "#fff8e1",
              border: "1px solid #ffe082",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 13,
              color: "#795548",
              textAlign: "center",
            }}
          >
            ⏳ Server is waking up (free tier).{" "}
            {countdown > 0 ? (
              <>Retrying in <strong>{countdown}s</strong>…</>
            ) : (
              "Retrying…"
            )}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label>Email address</label>
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
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Your password"
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
          {wakingUp
            ? "Server starting up…"
            : loading
            ? "Signing in…"
            : "Sign in →"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "#888" }}>
            Don't have an account?{" "}
            <span
              onClick={() => !loading && onNavigate("signup")}
              style={{
                color: "#7b1c2e",
                fontWeight: 700,
                cursor: loading ? "default" : "pointer",
              }}
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
          A <strong>6-digit verification code</strong> will be sent to your
          email address each time you sign in
        </div>
      </div>
    </div>
  );
}
