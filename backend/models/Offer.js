const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    offerPrice: { type: Number, required: true, min: 0 },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
