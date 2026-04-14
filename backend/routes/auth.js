const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { send2FACode, sendWelcomeEmail } = require("../mailer");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
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
    const user = await User.create({ name, email, password, phone });
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
    const { email, password } = req.body;
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
    const code = user.generate2FACode();
    await user.save();

    let emailSent = false;
    try {
      await send2FACode(email, user.name, code);
      emailSent = true;
    } catch (mailErr) {
      console.error("2FA email failed:", mailErr.message);
      // Don't block login — return the code in the response as fallback
    }

    res.json({
      success: true,
      message: emailSent
        ? "Verification code sent to your email"
        : "Email unavailable — use the code shown on screen to continue",
      userId: user._id,
      emailSent,
      // Only include the code when email couldn't be sent
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
    await user.save();
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
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
