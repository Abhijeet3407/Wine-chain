const express = require("express");
const router = express.Router();
const Bottle = require("../models/Bottle");
const Block = require("../models/Block");
const { protect } = require("../middleware/authMiddleware");

// Match bottles owned by the user OR legacy bottles with no owner
const userMatch = (userId) => ({
  $match: { $or: [{ registeredBy: userId }, { registeredBy: null }] },
});

router.get("/", protect, async (req, res) => {
  try {
    const uid = req.user._id;

    const [totalBottles, totalBlocks, typeStats, statusStats] = await Promise.all([
      Bottle.aggregate([
        userMatch(uid),
        { $group: { _id: null, totalQty: { $sum: "$quantity" }, totalValue: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } }, count: { $sum: 1 } } },
      ]),
      Block.countDocuments(),
      Bottle.aggregate([
        userMatch(uid),
        { $group: { _id: "$type", count: { $sum: 1 }, qty: { $sum: "$quantity" } } },
      ]),
      Bottle.aggregate([
        userMatch(uid),
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
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

router.get("/analytics", protect, async (req, res) => {
  try {
    const uid = req.user._id;

    const [byType, byRegion, byProducer, monthlyData, mostValuable, summary] =
      await Promise.all([
        Bottle.aggregate([
          userMatch(uid),
          { $group: { _id: "$type", count: { $sum: "$quantity" } } },
          { $sort: { count: -1 } },
        ]),
        Bottle.aggregate([
          userMatch(uid),
          { $group: { _id: "$region", count: { $sum: "$quantity" } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
        Bottle.aggregate([
          userMatch(uid),
          { $group: { _id: "$producer", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
        Bottle.aggregate([
          userMatch(uid),
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              bottles: { $sum: "$quantity" },
              value: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        Bottle.findOne({
          $or: [{ registeredBy: uid }, { registeredBy: null }],
          purchasePrice: { $gt: 0 },
        })
          .sort({ purchasePrice: -1 })
          .select("name purchasePrice vintage type"),
        Bottle.aggregate([
          userMatch(uid),
          {
            $group: {
              _id: null,
              totalValue: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } },
              totalBottles: { $sum: "$quantity" },
              uniqueWines: { $sum: 1 },
            },
          },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        byType,
        byRegion,
        byProducer,
        monthlyData,
        mostValuable,
        summary: summary[0] || { totalValue: 0, totalBottles: 0, uniqueWines: 0 },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
