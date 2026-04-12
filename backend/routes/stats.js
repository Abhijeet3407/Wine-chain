const express = require("express");
const router = express.Router();
const Bottle = require("../models/Bottle");
const Block = require("../models/Block");

router.get("/", async (req, res) => {
  try {
    const [totalBottles, totalBlocks, typeStats, statusStats] = await Promise.all([
      Bottle.aggregate([{ $group: { _id: null, totalQty: { $sum: "$quantity" }, totalValue: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } }, count: { $sum: 1 } } }]),
      Block.countDocuments(),
      Bottle.aggregate([{ $group: { _id: "$type", count: { $sum: 1 }, qty: { $sum: "$quantity" } } }]),
      Bottle.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalBottles: totalBottles[0]?.totalQty || 0,
        uniqueWines: totalBottles[0]?.count || 0,
        totalValue: totalBottles[0]?.totalValue || 0,
        totalBlocks,
        byType: typeStats,
        byStatus: statusStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
