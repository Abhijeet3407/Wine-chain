import React, { useState } from "react";
import { updateProfile } from "../utils/api";
import { toast } from "react-toastify";

export default function Profile({ user, onUpdate }) {
  const [infoEdit, setInfoEdit] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [infoLoading, setInfoLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState({ current: false, new: false, confirm: false });

  const setInfo = (k, v) => setInfoForm((f) => ({ ...f, [k]: v }));
  const setPw = (k, v) => setPwForm((f) => ({ ...f, [k]: v }));

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  const lastLogin = user?.lastLogin
    ? new Date(user.lastLogin).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  const handleInfoSave = async () => {
    if (!infoForm.name.trim() || !infoForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setInfoLoading(true);
    try {
      const res = await updateProfile({ name: infoForm.name.trim(), email: infoForm.email.trim() });
      onUpdate(res.data.user);
      toast.success("Profile updated");
      setInfoEdit(false);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to update profile");
    } finally {
      setInfoLoading(false);
    }
  };

  const handleInfoCancel = () => {
    setInfoForm({ name: user?.name || "", email: user?.email || "" });
    setInfoEdit(false);
  };

  const handlePasswordSave = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setPwLoading(true);
    try {
      await updateProfile({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "W";

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <h1 className="page-title">Account Profile</h1>
      <p className="page-sub">Manage your personal information and security settings</p>

      {/* ── Profile Header ─────────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "28px 32px",
          marginBottom: 20,
          background: "linear-gradient(135deg, #1a1a2e 0%, #2d1b29 100%)",
          border: "none",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "linear-gradient(135deg, #7b1c2e, #c0392b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "Georgia, serif",
            letterSpacing: "-1px",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4, letterSpacing: "-0.3px" }}>
            {user?.name}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>
            {user?.email}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.05em" }}>
              MEMBER SINCE {memberSince.toUpperCase()}
            </span>
          </div>
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 4 }}>
            LAST LOGIN
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
            {lastLogin}
          </div>
        </div>
      </div>

      {/* ── Personal Information ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div className="card-title" style={{ margin: 0 }}>Personal Information</div>
          {!infoEdit && (
            <button className="btn btn-sm" onClick={() => setInfoEdit(true)}>
              Edit
            </button>
          )}
        </div>

        {infoEdit ? (
          <>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  value={infoForm.name}
                  onChange={(e) => setInfo("name", e.target.value)}
                  placeholder="Your full name"
                  disabled={infoLoading}
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={infoForm.email}
                  onChange={(e) => setInfo("email", e.target.value)}
                  placeholder="your@email.com"
                  disabled={infoLoading}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={handleInfoSave} disabled={infoLoading}>
                {infoLoading ? "Saving…" : "Save Changes"}
              </button>
              <button className="btn" onClick={handleInfoCancel} disabled={infoLoading}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px 32px",
            }}
          >
            <InfoRow label="Full Name" value={user?.name} />
            <InfoRow label="Email Address" value={user?.email} />
            <InfoRow label="Member Since" value={memberSince} />
            <InfoRow label="Last Login" value={lastLogin} />
          </div>
        )}
      </div>

      {/* ── Change Password ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">Security — Change Password</div>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 20, marginTop: -8 }}>
          Leave blank if you do not want to change your password.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label>Current Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={pwVisible.current ? "text" : "password"}
                value={pwForm.currentPassword}
                onChange={(e) => setPw("currentPassword", e.target.value)}
                placeholder="Enter current password"
                disabled={pwLoading}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setPwVisible((v) => ({ ...v, current: !v.current }))}
                style={eyeBtn}
                tabIndex={-1}
              >
                {pwVisible.current ? "◉" : "○"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={pwVisible.new ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) => setPw("newPassword", e.target.value)}
                  placeholder="Min 6 characters"
                  disabled={pwLoading}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setPwVisible((v) => ({ ...v, new: !v.new }))}
                  style={eyeBtn}
                  tabIndex={-1}
                >
                  {pwVisible.new ? "◉" : "○"}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={pwVisible.confirm ? "text" : "password"}
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPw("confirmPassword", e.target.value)}
                  placeholder="Repeat new password"
                  disabled={pwLoading}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setPwVisible((v) => ({ ...v, confirm: !v.confirm }))}
                  style={eyeBtn}
                  tabIndex={-1}
                >
                  {pwVisible.confirm ? "◉" : "○"}
                </button>
              </div>
            </div>
          </div>

          {/* Strength indicator */}
          {pwForm.newPassword && (
            <PasswordStrength password={pwForm.newPassword} />
          )}

          <div>
            <button
              className="btn btn-primary"
              onClick={handlePasswordSave}
              disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
            >
              {pwLoading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Account Info ────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-title">Account Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
          <InfoRow label="Account Status" value="Active" valueColor="#1e7a40" />
          <InfoRow label="2FA Method" value="Email OTP" />
          <InfoRow label="Authentication" value="Email + Password" />
          <InfoRow label="Data Region" value="MongoDB Atlas Cloud" />
        </div>
        <div
          style={{
            marginTop: 20,
            padding: "12px 16px",
            background: "#f8f7f4",
            borderRadius: 8,
            fontSize: 12,
            color: "#888",
            borderLeft: "3px solid #7b1c2e",
          }}
        >
          Every login is secured with a <strong>6-digit one-time code</strong> sent to your email address.
          Your account activity is permanently recorded on the blockchain.
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#aaa", letterSpacing: "0.06em", marginBottom: 4, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: valueColor || "#1a1a1a" }}>
        {value || "—"}
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#c0392b", "#e67e22", "#f0b429", "#1e7a40"];

  return (
    <div style={{ marginTop: -6 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i < score ? colors[score - 1] : "#e8e6e0",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[score - 1] || "#aaa", fontWeight: 600 }}>
        {score > 0 ? labels[score - 1] : ""}
      </div>
    </div>
  );
}

const eyeBtn = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  color: "#aaa",
  padding: 0,
  lineHeight: 1,
};
