const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Stripe webhook needs the raw body — must be mounted before express.json()
app.use(
  "/api/marketplace/webhook",
  require("express").raw({ type: "application/json" })
);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/bottles", require("./routes/bottles"));
app.use("/api/chain", require("./routes/chain"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/marketplace", require("./routes/marketplace"));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", message: "Wine Chain API running" })
);

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, error: "Route not found" })
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/winechain";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🍷 Wine Chain API running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
  