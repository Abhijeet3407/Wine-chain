const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Listing = require("../models/Listing");
const Offer = require("../models/Offer");
const Bottle = require("../models/Bottle");
const Block = require("../models/Block");
const { protect } = require("../middleware/authMiddleware");
const { Block: ChainBlock, Blockchain } = require("../blockchain/chain");
const {
  sendBuyNowRequestToSeller,
  sendOfferToSeller,
  sendOfferRejectedToBuyer,
  sendSaleConfirmedToSeller,
  sendSaleConfirmedToBuyer,
  sendPaymentRequestToBuyer,
} = require("../mailer");

const blockchain = new Blockchain();

async function addBlockToChain(data, bottleId = null) {
  let lastBlock = await Block.findOne().sort({ index: -1 });

  if (!lastBlock) {
    const genesis = blockchain.createGenesisBlock();
    lastBlock = await Block.create({
      index: genesis.index,
      timestamp: genesis.timestamp,
      data: genesis.data,
      previousHash: genesis.previousHash,
      hash: genesis.hash,
      nonce: genesis.nonce,
      bottleId: null,
    });
  }

  const newChainBlock = blockchain.createBlock(lastBlock, data);
  const saved = await Block.create({
    index: newChainBlock.index,
    timestamp: newChainBlock.timestamp,
    data: newChainBlock.data,
    previousHash: newChainBlock.previousHash,
    hash: newChainBlock.hash,
    nonce: newChainBlock.nonce,
    bottleId,
  });
  return saved;
}

// Stripe webhook — must be registered with raw body in server.js before express.json()
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const { type, offerId, listingId } = pi.metadata;

    try {
      if (type === "offer") {
        const offer = await Offer.findById(offerId);
        const listing = await Listing.findById(listingId).populate("bottle");
        if (!offer || !listing) return res.json({ received: true });

        const bottle = listing.bottle;

        const block = await addBlockToChain(
          {
            type: "MARKETPLACE_OFFER_ACCEPTED",
            bottleId: bottle.bottleId,
            fromOwner: bottle.currentOwner,
            toOwner: offer.buyerName,
            price: offer.offerPrice,
            listingId: listing._id.toString(),
            offerId: offer._id.toString(),
            action: `Offer accepted: "${bottle.name}" ${bottle.vintage} from ${bottle.currentOwner} to ${offer.buyerName} for £${offer.offerPrice}`,
          },
          bottle._id
        );

        bottle.transferHistory.push({
          fromOwner: bottle.currentOwner,
          toOwner: offer.buyerName,
          price: offer.offerPrice,
          notes: "Marketplace offer accepted",
          blockHash: block.hash,
        });
        bottle.currentOwner = offer.buyerName;
        bottle.status = "Transferred";
        bottle.latestBlockHash = block.hash;
        bottle.blockIndices.push(block.index);
        await bottle.save();

        offer.status = "Accepted";
        await offer.save();

        listing.status = "Sold";
        await listing.save();

        try {
          await sendSaleConfirmedToBuyer(offer.buyerEmail, offer.buyerName, bottle, offer.offerPrice);
        } catch (e) { console.error("Mail error:", e.message); }
        try {
          await sendSaleConfirmedToSeller(listing.sellerEmail, listing.sellerName, offer.buyerName, bottle, offer.offerPrice);
        } catch (e) { console.error("Mail error:", e.message); }

      } else if (type === "buy_now") {
        const listing = await Listing.findById(listingId).populate("bottle");
        if (!listing) return res.json({ received: true });

        const bottle = listing.bottle;
        const buyer = listing.pendingBuyer;

        const block = await addBlockToChain(
          {
            type: "MARKETPLACE_SALE",
            bottleId: bottle.bottleId,
            fromOwner: bottle.currentOwner,
            toOwner: buyer.name,
            price: listing.askingPrice,
            listingId: listing._id.toString(),
            action: `Marketplace sale: "${bottle.name}" ${bottle.vintage} from ${bottle.currentOwner} to ${buyer.name} for £${listing.askingPrice}`,
          },
          bottle._id
        );

        bottle.transferHistory.push({
          fromOwner: bottle.currentOwner,
          toOwner: buyer.name,
          price: listing.askingPrice,
          notes: "Marketplace sale",
          blockHash: block.hash,
        });
        bottle.currentOwner = buyer.name;
        bottle.status = "Transferred";
        bottle.latestBlockHash = block.hash;
        bottle.blockIndices.push(block.index);
        await bottle.save();

        listing.status = "Sold";
        await listing.save();

        try {
          await sendSaleConfirmedToBuyer(buyer.email, buyer.name, bottle, listing.askingPrice);
        } catch (e) { console.error("Mail error:", e.message); }
        try {
          await sendSaleConfirmedToSeller(listing.sellerEmail, listing.sellerName, buyer.name, bottle, listing.askingPrice);
        } catch (e) { console.error("Mail error:", e.message); }
      }
    } catch (err) {
      console.error("Webhook processing error:", err.message);
    }
  }

  res.json({ received: true });
});

// GET /payment/:paymentIntentId — return client secret so frontend can render Stripe Elements
router.get("/payment/:paymentIntentId", async (req, res) => {
  try {
    const pi = await stripe.paymentIntents.retrieve(req.params.paymentIntentId);
    res.json({
      success: true,
      clientSecret: pi.client_secret,
      amount: pi.amount,
      currency: pi.currency,
      bottleName: pi.metadata.bottleName || "",
      buyerName: pi.metadata.buyerName || "",
      status: pi.status,
    });
  } catch (err) {
    res.status(404).json({ success: false, error: "Payment not found" });
  }
});

// GET / — Browse all Active, Pending, and AwaitingPayment listings
router.get("/", async (req, res) => {
  try {
    const { search, type, minPrice, maxPrice } = req.query;

    let listings = await Listing.find({
      status: { $in: ["Active", "Pending", "AwaitingPayment"] },
    }).populate("bottle");

    if (search) {
      const s = search.toLowerCase();
      listings = listings.filter((l) => {
        const b = l.bottle;
        if (!b) return false;
        return (
          b.name?.toLowerCase().includes(s) ||
          b.producer?.toLowerCase().includes(s) ||
          b.region?.toLowerCase().includes(s) ||
          b.bottleId?.toLowerCase().includes(s)
        );
      });
    }

    if (type) {
      listings = listings.filter((l) => l.listingType === type);
    }

    if (minPrice !== undefined && minPrice !== "") {
      listings = listings.filter((l) => l.askingPrice >= Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      listings = listings.filter((l) => l.askingPrice <= Number(maxPrice));
    }

    res.json({ success: true, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST / — List a bottle (protected)
router.post("/", protect, async (req, res) => {
  try {
    const { bottleId, askingPrice, listingType, description } = req.body;

    if (!bottleId || askingPrice === undefined || !listingType) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const bottle = await Bottle.findOne({
      $or: [
        { _id: bottleId.match(/^[a-f\d]{24}$/i) ? bottleId : null },
        { bottleId: bottleId },
      ],
    });

    if (!bottle) {
      return res.status(404).json({ success: false, error: "Bottle not found" });
    }

    const existing = await Listing.findOne({
      bottle: bottle._id,
      status: { $in: ["Active", "Pending", "AwaitingPayment"] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "This bottle already has an active listing",
      });
    }

    const listing = await Listing.create({
      bottle: bottle._id,
      sellerName: req.user.name,
      sellerEmail: req.user.email,
      sellerUserId: req.user._id,
      askingPrice,
      listingType,
      description: description || "",
    });

    await listing.populate("bottle");

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /:id — Unlist (protected)
router.delete("/:id", protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.sellerUserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized to unlist this bottle" });
    }

    await Offer.updateMany(
      { listing: listing._id, status: "Pending" },
      { status: "Rejected" }
    );

    listing.status = "Unlisted";
    await listing.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/buy — Buyer submits Buy Now request
router.post("/:id/buy", async (req, res) => {
  try {
    const { buyerName, buyerEmail } = req.body;

    if (!buyerName || !buyerEmail) {
      return res
        .status(400)
        .json({ success: false, error: "Buyer name and email are required" });
    }

    const listing = await Listing.findById(req.params.id).populate("bottle");
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.status !== "Active") {
      return res.status(400).json({ success: false, error: "Listing is not active" });
    }

    if (listing.listingType !== "Fixed Price") {
      return res
        .status(400)
        .json({ success: false, error: "This listing is not a fixed price listing" });
    }

    listing.status = "Pending";
    listing.pendingBuyer = { name: buyerName, email: buyerEmail, requestedAt: new Date() };
    await listing.save();

    try {
      await sendBuyNowRequestToSeller(
        listing.sellerEmail,
        listing.sellerName,
        buyerName,
        buyerEmail,
        listing.bottle
      );
    } catch (mailErr) {
      console.error("Mail error:", mailErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/buy/confirm — Seller confirms sale; creates Stripe PaymentIntent for buyer to pay
router.post("/:id/buy/confirm", protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("bottle");
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.status !== "Pending") {
      return res
        .status(400)
        .json({ success: false, error: "Listing is not in Pending state" });
    }

    if (listing.sellerUserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized to confirm this sale" });
    }

    const bottle = listing.bottle;
    const buyer = listing.pendingBuyer;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(listing.askingPrice * 100),
      currency: "gbp",
      metadata: {
        type: "buy_now",
        listingId: listing._id.toString(),
        bottleName: `${bottle.name} ${bottle.vintage}`,
        buyerName: buyer.name,
      },
    });

    listing.status = "AwaitingPayment";
    listing.stripePaymentIntentId = paymentIntent.id;
    await listing.save();

    try {
      await sendPaymentRequestToBuyer(
        buyer.email,
        buyer.name,
        bottle,
        listing.askingPrice,
        paymentIntent.id
      );
    } catch (mailErr) {
      console.error("Mail error:", mailErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/offers — Make an offer
router.post("/:id/offers", async (req, res) => {
  try {
    const { buyerName, buyerEmail, offerPrice, message } = req.body;

    if (!buyerName || !buyerEmail || offerPrice === undefined) {
      return res
        .status(400)
        .json({ success: false, error: "Buyer name, email and offer price are required" });
    }

    const listing = await Listing.findById(req.params.id).populate("bottle");
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.status !== "Active") {
      return res.status(400).json({ success: false, error: "Listing is not active" });
    }

    const offer = await Offer.create({
      listing: listing._id,
      buyerName,
      buyerEmail,
      offerPrice,
      message: message || "",
    });

    try {
      await sendOfferToSeller(
        listing.sellerEmail,
        listing.sellerName,
        buyerName,
        buyerEmail,
        offerPrice,
        message || "",
        listing.bottle
      );
    } catch (mailErr) {
      console.error("Mail error:", mailErr.message);
    }

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /:id/offers — Get offers for a listing (protected, seller only)
router.get("/:id/offers", protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.sellerUserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized to view these offers" });
    }

    const offers = await Offer.find({ listing: listing._id }).sort({ createdAt: -1 });

    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/offers/:offerId/accept — Seller accepts; creates Stripe PaymentIntent for buyer to pay
router.post("/:id/offers/:offerId/accept", protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("bottle");
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.status !== "Active") {
      return res.status(400).json({ success: false, error: "Listing is not active" });
    }

    if (listing.sellerUserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized to accept offers on this listing" });
    }

    const offer = await Offer.findById(req.params.offerId);
    if (!offer) {
      return res.status(404).json({ success: false, error: "Offer not found" });
    }

    if (offer.status !== "Pending") {
      return res.status(400).json({ success: false, error: "Offer is not in Pending state" });
    }

    const bottle = listing.bottle;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(offer.offerPrice * 100),
      currency: "gbp",
      metadata: {
        type: "offer",
        offerId: offer._id.toString(),
        listingId: listing._id.toString(),
        bottleName: `${bottle.name} ${bottle.vintage}`,
        buyerName: offer.buyerName,
      },
    });

    // Mark offer as awaiting payment
    offer.status = "AwaitingPayment";
    offer.stripePaymentIntentId = paymentIntent.id;
    await offer.save();

    // Reject all other pending offers now
    await Offer.updateMany(
      { listing: listing._id, _id: { $ne: offer._id }, status: "Pending" },
      { status: "Rejected" }
    );

    // Lock listing so no new offers come in
    listing.status = "AwaitingPayment";
    listing.stripePaymentIntentId = paymentIntent.id;
    await listing.save();

    // Send payment link to buyer
    try {
      await sendPaymentRequestToBuyer(
        offer.buyerEmail,
        offer.buyerName,
        bottle,
        offer.offerPrice,
        paymentIntent.id
      );
    } catch (mailErr) {
      console.error("Mail error:", mailErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /:id/offers/:offerId/reject — Reject offer (protected)
router.post("/:id/offers/:offerId/reject", protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate("bottle");
    if (!listing) {
      return res.status(404).json({ success: false, error: "Listing not found" });
    }

    if (listing.sellerUserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, error: "Not authorized to reject offers on this listing" });
    }

    const offer = await Offer.findById(req.params.offerId);
    if (!offer) {
      return res.status(404).json({ success: false, error: "Offer not found" });
    }

    offer.status = "Rejected";
    await offer.save();

    try {
      const bottle = listing.bottle;
      await sendOfferRejectedToBuyer(
        offer.buyerEmail,
        offer.buyerName,
        bottle.name + " " + bottle.vintage,
        offer.offerPrice
      );
    } catch (mailErr) {
      console.error("Mail error:", mailErr.message);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
