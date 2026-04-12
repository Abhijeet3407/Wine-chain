const express = require("express");
const router = express.Router();
const Block = require("../models/Block");
const { Blockchain } = require("../blockchain/chain");

const blockchain = new Blockchain();

// GET full chain
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Block.countDocuments();
    const blocks = await Block.find()
      .sort({ index: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("bottleId", "bottleId name vintage");

    res.json({ success: true, data: blocks, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET chain validity
router.get("/validate", async (req, res) => {
  try {
    const blocks = await Block.find().sort({ index: 1 });
    const isValid = blocks.length <= 1 || blockchain.isChainValid(blocks);
    res.json({ success: true, valid: isValid, totalBlocks: blocks.length, message: isValid ? "Blockchain integrity verified." : "Chain integrity issue detected." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single block
router.get("/:hash", async (req, res) => {
  try {
    const block = await Block.findOne({ hash: req.params.hash }).populate("bottleId", "bottleId name vintage currentOwner");
    if (!block) return res.status(404).json({ success: false, error: "Block not found" });
    res.json({ success: true, data: block });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
