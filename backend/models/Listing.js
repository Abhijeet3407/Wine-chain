const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    bottle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bottle",
      required: true,
    },
    sellerName: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    sellerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    askingPrice: { type: Number, required: true, min: 0 },
    listingType: {
      type: String,
      enum: ["Fixed Price", "Make Offer"],
      required: true,
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Pending", "AwaitingPayment", "Sold", "Unlisted"],
      default: "Active",
    },
    stripePaymentIntentId: { type: String },
    pendingBuyer: {
      name: { type: String },
      email: { type: String },
      requestedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
