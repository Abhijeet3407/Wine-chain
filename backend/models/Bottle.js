const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  fromOwner: { type: String, required: true },
  toOwner: { type: String, required: true },
  price: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  blockHash: { type: String },
  transferredAt: { type: Date, default: Date.now },
});

const bottleSchema = new mongoose.Schema(
  {
    bottleId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    vintage: { type: Number, required: true },
    type: {
      type: String,
      enum: ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified"],
      required: true,
    },
    region: { type: String, required: true, trim: true },
    producer: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    purchasePrice: { type: Number, default: 0 },
    currentOwner: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Transferred", "Consumed", "Lost"],
      default: "Active",
    },
    genesisBlockHash: { type: String },
    latestBlockHash: { type: String },
    transferHistory: [transferSchema],
    blockIndices: [{ type: Number }],
  },
  { timestamps: true }
);

bottleSchema.pre("save", async function (next) {
  if (!this.bottleId) {
    const count = await mongoose.model("Bottle").countDocuments();
    this.bottleId = `WINE-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Bottle", bottleSchema);
