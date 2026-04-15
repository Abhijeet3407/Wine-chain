const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { send2FACode, sendWelcomeEmail } = require("../mailer");
const { protect } = require("../middleware/authMiddleware");

const DEVICE_TRUST_MS = 2 * 60 * 60 * 1000; // 2 hours

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Please fill in all fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Password must be at least 6 characters",
        });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, error: "Email already registered" });
    }
    const user = await User.create({ name, email, password });
    // Welcome email is best-effort — don't fail signup if email is unavailable
    sendWelcomeEmail(email, name).catch((e) =>
      console.error("Welcome email failed:", e.message)
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Account created successfully. Please log in.",
      });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, deviceToken } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Please enter email and password" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    // Trusted device check — skip 2FA if device token is valid
    if (
      deviceToken &&
      user.deviceToken === deviceToken &&
      user.deviceTokenExpiry &&
      user.deviceTokenExpiry > new Date()
    ) {
      // Refresh the trust window for another 2 hours
      user.deviceTokenExpiry = new Date(Date.now() + DEVICE_TRUST_MS);
      user.lastLogin = new Date();
      await user.save();
      const token = generateToken(user._id);
      return res.json({
        success: true,
        skipOtp: true,
        token,
        deviceToken: user.deviceToken,
        user: { id: user._id, name: user.name, email: user.email },
      });
    }

    // Normal 2FA flow
    const code = user.generate2FACode();
    await user.save();

    let emailSent = false;
    try {
      await send2FACode(email, user.name, code);
      emailSent = true;
    } catch (mailErr) {
      console.error("2FA email failed:", mailErr.message);
    }

    res.json({
      success: true,
      message: emailSent
        ? "Verification code sent to your email"
        : "Email unavailable — use the code shown on screen to continue",
      userId: user._id,
      emailSent,
      ...(emailSent ? {} : { fallbackCode: code }),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/verify-2fa
router.post("/verify-2fa", async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    if (user.twoFactorCode !== code) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid verification code" });
    }
    if (user.twoFactorExpiry < new Date()) {
      return res
        .status(401)
        .json({
          success: false,
          error: "Code has expired. Please login again.",
        });
    }
    user.twoFactorVerified = true;
    user.twoFactorCode = null;
    user.twoFactorExpiry = null;
    user.lastLogin = new Date();

    // Issue a device trust token valid for 2 hours
    const deviceToken = crypto.randomBytes(32).toString("hex");
    user.deviceToken = deviceToken;
    user.deviceTokenExpiry = new Date(Date.now() + DEVICE_TRUST_MS);

    await user.save();
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      deviceToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/auth/profile — update name, email, or password
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (name && name.trim()) user.name = name.trim();

    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase().trim() });
      if (exists) {
        return res.status(400).json({ success: false, error: "Email is already in use" });
      }
      user.email = email.toLowerCase().trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: "Current password is required to set a new one" });
      }
      const match = await user.matchPassword(currentPassword);
      if (!match) {
        return res.status(401).json({ success: false, error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
      }
      user.password = newPassword; // hashed by pre-save hook
    }

    await user.save();

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, error: "Not authorized" });
    }
  } catch (err) {
    res.status(401).json({ success: false, error: "Token failed" });
  }
});

module.exports = router;
