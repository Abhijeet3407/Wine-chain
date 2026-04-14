const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, minlength: 6 },
    twoFactorCode: { type: String, default: null },
    twoFactorExpiry: { type: Date, default: null },
    twoFactorVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate 6-digit 2FA code
userSchema.methods.generate2FACode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.twoFactorCode = code;
  this.twoFactorExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.twoFactorVerified = false;
  return code;
};

module.exports = mongoose.model("User", userSchema);
