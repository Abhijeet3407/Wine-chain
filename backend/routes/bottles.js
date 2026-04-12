const express = require("express");
const router = express.Router();
const Bottle = require("../models/Bottle");
const Block = require("../models/Block");
const { Block: ChainBlock, Blockchain } = require("../blockchain/chain");
const { upload } = require("../cloudinary");

const blockchain = new Blockchain();

async function getLastBlock() {
  return await Block.findOne().sort({ index: -1 });
}

async function addBlockToChain(data, bottleId = null) {
  let lastBlock = await getLastBlock();

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

// GET all bottles
router.get("/", async (req, res) => {
  try {
    const { search, type, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { producer: { $regex: search, $options: "i" } },
        { region: { $regex: search, $options: "i" } },
        { bottleId: { $regex: search, $options: "i" } },
      ];
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await Bottle.countDocuments(query);
    const bottles = await Bottle.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: bottles,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single bottle
router.get("/:id", async (req, res) => {
  try {
    const bottle = await Bottle.findOne({
      $or: [
        { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
        { bottleId: req.params.id },
      ],
    });
    if (!bottle)
      return res
        .status(404)
        .json({ success: false, error: "Bottle not found" });
    res.json({ success: true, data: bottle });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST register new bottle
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      vintage,
      type,
      region,
      producer,
      quantity,
      purchasePrice,
      currentOwner,
      description,
    } = req.body;

    if (!name || !vintage || !type || !region || !producer || !currentOwner) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const imageUrl = req.file ? req.file.path : "";
    const bottle = new Bottle({
      name,
      vintage,
      type,
      region,
      producer,
      quantity: quantity || 1,
      purchasePrice: purchasePrice || 0,
      currentOwner,
      description,
      imageUrl,
    });
    await bottle.save();

    const blockData = {
      type: "REGISTER",
      bottleId: bottle.bottleId,
      name,
      vintage,
      wineType: type,
      region,
      producer,
      quantity: quantity || 1,
      owner: currentOwner,
      action: `Bottle "${name}" ${vintage} registered by ${currentOwner}`,
    };

    const block = await addBlockToChain(blockData, bottle._id);
    bottle.genesisBlockHash = block.hash;
    bottle.latestBlockHash = block.hash;
    bottle.blockIndices.push(block.index);
    await bottle.save();

    res.status(201).json({ success: true, data: bottle, block });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT transfer ownership
router.put("/:id/transfer", async (req, res) => {
  try {
    const { toOwner, price, notes } = req.body;
    if (!toOwner)
      return res
        .status(400)
        .json({ success: false, error: "New owner is required" });

    const bottle = await Bottle.findOne({
      $or: [
        { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
        { bottleId: req.params.id },
      ],
    });
    if (!bottle)
      return res
        .status(404)
        .json({ success: false, error: "Bottle not found" });

    const blockData = {
      type: "TRANSFER",
      bottleId: bottle.bottleId,
      fromOwner: bottle.currentOwner,
      toOwner,
      price: price || 0,
      notes: notes || "",
      action: `Ownership transferred from ${bottle.currentOwner} to ${toOwner}`,
    };

    const block = await addBlockToChain(blockData, bottle._id);

    bottle.transferHistory.push({
      fromOwner: bottle.currentOwner,
      toOwner,
      price: price || 0,
      notes: notes || "",
      blockHash: block.hash,
    });

    bottle.currentOwner = toOwner;
    bottle.status = "Transferred";
    bottle.latestBlockHash = block.hash;
    bottle.blockIndices.push(block.index);
    await bottle.save();

    res.json({ success: true, data: bottle, block });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET verify bottle authenticity
router.get("/:id/verify", async (req, res) => {
  try {
    const bottle = await Bottle.findOne({
      $or: [
        { bottleId: req.params.id },
        { genesisBlockHash: req.params.id },
        { latestBlockHash: req.params.id },
      ],
    });
    if (!bottle)
      return res
        .status(404)
        .json({
          success: false,
          verified: false,
          error: "Bottle not found on chain",
        });

    const blocks = await Block.find({
      index: { $in: bottle.blockIndices },
    }).sort({ index: 1 });
    const allBlocks = await Block.find().sort({ index: 1 });

    const isValid = allBlocks.length <= 1 || blockchain.isChainValid(allBlocks);

    res.json({
      success: true,
      verified: isValid,
      bottle,
      blocks,
      message: isValid
        ? `Bottle ${bottle.bottleId} is authentic. ${blocks.length} blockchain record(s) verified.`
        : "Chain integrity compromised. This bottle may not be authentic.",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE bottle
router.delete("/:id", async (req, res) => {
  try {
    const bottle = await Bottle.findOneAndDelete({
      $or: [
        { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
        { bottleId: req.params.id },
      ],
    });
    if (!bottle)
      return res
        .status(404)
        .json({ success: false, error: "Bottle not found" });
    res.json({ success: true, message: "Bottle removed from inventory" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
