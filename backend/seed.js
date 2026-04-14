/**
 * Wine Chain — Sample Data Seed Script
 * Run: node seed.js
 *
 * - Removes any bottles that are missing blockchain hashes (from a previous
 *   direct-insert seed run).
 * - Re-creates them properly: mines a real SHA-256 block for each bottle,
 *   sets genesisBlockHash / latestBlockHash / blockIndices on the bottle.
 * - Backdates createdAt so the monthly analytics charts show spread.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Bottle   = require("./models/Bottle");
const Block    = require("./models/Block");
const { Block: ChainBlock, Blockchain } = require("./blockchain/chain");

const blockchain = new Blockchain();

async function getLastBlock() {
  return Block.findOne().sort({ index: -1 });
}

async function addBlockToChain(data, bottleId) {
  let lastBlock = await getLastBlock();
  if (!lastBlock) {
    const genesis = blockchain.createGenesisBlock();
    lastBlock = await Block.create({
      index:        genesis.index,
      timestamp:    genesis.timestamp,
      data:         genesis.data,
      previousHash: genesis.previousHash,
      hash:         genesis.hash,
      nonce:        genesis.nonce,
      bottleId:     null,
    });
  }
  const mined = blockchain.createBlock(lastBlock, data);
  return Block.create({
    index:        mined.index,
    timestamp:    mined.timestamp,
    data:         mined.data,
    previousHash: mined.previousHash,
    hash:         mined.hash,
    nonce:        mined.nonce,
    bottleId,
  });
}

// ── 27 sample wines spread across 7 months ──────────────────────────────────
const WINES = [
  // Oct 2025
  { name: "Château Margaux Grand Cru",  vintage: 2018, type: "Red",       region: "Bordeaux, France",         producer: "Château Margaux",           quantity: 6,  purchasePrice: 850,  owner: "James Laurent",   y: 2025, m: 10, d: 4  },
  { name: "Cloudy Bay Sauvignon Blanc", vintage: 2022, type: "White",     region: "Marlborough, New Zealand", producer: "Cloudy Bay",                quantity: 12, purchasePrice: 22,   owner: "Sophie Tremblay", y: 2025, m: 10, d: 11 },
  { name: "Nyetimber Classic Cuvée",    vintage: 2019, type: "Sparkling", region: "West Sussex, England",     producer: "Nyetimber",                 quantity: 6,  purchasePrice: 38,   owner: "James Laurent",   y: 2025, m: 10, d: 19 },
  // Nov 2025
  { name: "Sassicaia Bolgheri DOC",     vintage: 2019, type: "Red",       region: "Tuscany, Italy",           producer: "Tenuta San Guido",          quantity: 3,  purchasePrice: 220,  owner: "Marco Rossi",     y: 2025, m: 11, d: 3  },
  { name: "Puligny-Montrachet 1er Cru", vintage: 2020, type: "White",     region: "Burgundy, France",         producer: "Domaine Leflaive",          quantity: 4,  purchasePrice: 185,  owner: "Sophie Tremblay", y: 2025, m: 11, d: 9  },
  { name: "Penfolds Grange Hermitage",  vintage: 2017, type: "Red",       region: "Barossa Valley, Australia",producer: "Penfolds",                  quantity: 2,  purchasePrice: 680,  owner: "James Laurent",   y: 2025, m: 11, d: 17 },
  { name: "Whispering Angel Rosé",      vintage: 2023, type: "Rosé",      region: "Provence, France",         producer: "Château d'Esclans",         quantity: 8,  purchasePrice: 26,   owner: "Emma Wilson",     y: 2025, m: 11, d: 25 },
  // Dec 2025
  { name: "Vega Sicilia Único",         vintage: 2015, type: "Red",       region: "Ribera del Duero, Spain",  producer: "Vega Sicilia",              quantity: 2,  purchasePrice: 480,  owner: "Marco Rossi",     y: 2025, m: 12, d: 2  },
  { name: "Dom Pérignon Vintage",       vintage: 2013, type: "Sparkling", region: "Champagne, France",        producer: "Moët & Chandon",            quantity: 6,  purchasePrice: 195,  owner: "James Laurent",   y: 2025, m: 12, d: 8  },
  { name: "Château d'Yquem Sauternes",  vintage: 2016, type: "Dessert",   region: "Sauternes, France",        producer: "Château d'Yquem",           quantity: 3,  purchasePrice: 320,  owner: "Sophie Tremblay", y: 2025, m: 12, d: 14 },
  { name: "Brunello di Montalcino",     vintage: 2018, type: "Red",       region: "Tuscany, Italy",           producer: "Biondi-Santi",              quantity: 4,  purchasePrice: 155,  owner: "Emma Wilson",     y: 2025, m: 12, d: 20 },
  { name: "Tignanello IGT",             vintage: 2020, type: "Red",       region: "Tuscany, Italy",           producer: "Marchesi Antinori",         quantity: 6,  purchasePrice: 95,   owner: "Marco Rossi",     y: 2025, m: 12, d: 27 },
  // Jan 2026
  { name: "Ridge Monte Bello Cabernet", vintage: 2019, type: "Red",       region: "Santa Cruz, California",   producer: "Ridge Vineyards",           quantity: 3,  purchasePrice: 210,  owner: "James Laurent",   y: 2026, m: 1,  d: 6  },
  { name: "Chablis Grand Cru Vaudésir", vintage: 2021, type: "White",     region: "Burgundy, France",         producer: "William Fèvre",             quantity: 6,  purchasePrice: 68,   owner: "Sophie Tremblay", y: 2026, m: 1,  d: 13 },
  { name: "Taylor Fladgate 20yr Tawny", vintage: 2003, type: "Fortified", region: "Douro Valley, Portugal",   producer: "Taylor Fladgate",           quantity: 4,  purchasePrice: 55,   owner: "Emma Wilson",     y: 2026, m: 1,  d: 20 },
  { name: "Bandol Rouge Mourvèdre",     vintage: 2019, type: "Red",       region: "Provence, France",         producer: "Domaine Tempier",           quantity: 6,  purchasePrice: 42,   owner: "Marco Rossi",     y: 2026, m: 1,  d: 28 },
  // Feb 2026
  { name: "Barolo DOCG Cannubi",        vintage: 2017, type: "Red",       region: "Piedmont, Italy",          producer: "Borgogno",                  quantity: 4,  purchasePrice: 130,  owner: "James Laurent",   y: 2026, m: 2,  d: 5  },
  { name: "Grüner Veltliner Smaragd",   vintage: 2022, type: "White",     region: "Wachau, Austria",          producer: "Franz Hirtzberger",         quantity: 8,  purchasePrice: 45,   owner: "Sophie Tremblay", y: 2026, m: 2,  d: 12 },
  { name: "Miraval Rosé Studio",        vintage: 2023, type: "Rosé",      region: "Provence, France",         producer: "Famille Perrin",            quantity: 12, purchasePrice: 20,   owner: "Emma Wilson",     y: 2026, m: 2,  d: 19 },
  { name: "Inniskillin Vidal Icewine",  vintage: 2021, type: "Dessert",   region: "Niagara, Canada",          producer: "Inniskillin",               quantity: 3,  purchasePrice: 75,   owner: "Marco Rossi",     y: 2026, m: 2,  d: 26 },
  // Mar 2026
  { name: "Caymus Special Selection",   vintage: 2020, type: "Red",       region: "Napa Valley, California",  producer: "Caymus Vineyards",          quantity: 3,  purchasePrice: 185,  owner: "James Laurent",   y: 2026, m: 3,  d: 4  },
  { name: "Riesling Auslese Mosel",     vintage: 2021, type: "White",     region: "Mosel, Germany",           producer: "Dr. Loosen",                quantity: 6,  purchasePrice: 35,   owner: "Sophie Tremblay", y: 2026, m: 3,  d: 11 },
  { name: "Bollinger Special Cuvée",    vintage: 2018, type: "Sparkling", region: "Champagne, France",        producer: "Bollinger",                 quantity: 6,  purchasePrice: 65,   owner: "Emma Wilson",     y: 2026, m: 3,  d: 19 },
  { name: "Penfolds Bin 389 Cabernet",  vintage: 2021, type: "Red",       region: "South Australia",          producer: "Penfolds",                  quantity: 6,  purchasePrice: 55,   owner: "Marco Rossi",     y: 2026, m: 3,  d: 26 },
  // Apr 2026
  { name: "Rioja Gran Reserva 904",     vintage: 2016, type: "Red",       region: "Rioja, Spain",             producer: "La Rioja Alta",             quantity: 6,  purchasePrice: 48,   owner: "James Laurent",   y: 2026, m: 4,  d: 2  },
  { name: "Quinta do Noval Nacional",   vintage: 2017, type: "Fortified", region: "Douro Valley, Portugal",   producer: "Quinta do Noval",           quantity: 2,  purchasePrice: 290,  owner: "Sophie Tremblay", y: 2026, m: 4,  d: 9  },
  { name: "Côtes de Provence Cru",      vintage: 2023, type: "Rosé",      region: "Provence, France",         producer: "Château Sainte Marguerite", quantity: 10, purchasePrice: 18,   owner: "Emma Wilson",     y: 2026, m: 4,  d: 12 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected\n");

  // ── Step 1: remove bottles that have no genesis hash ──
  const { deletedCount } = await Bottle.deleteMany({ genesisBlockHash: null });
  if (deletedCount > 0) {
    console.log(`🗑  Removed ${deletedCount} bottle(s) that had no block hash.\n`);
  }

  // ── Step 2: re-create each wine with a proper mined block ──
  let added = 0;
  for (const w of WINES) {
    // 1. Create the Bottle document (triggers bottleId auto-gen)
    const bottle = await Bottle.create({
      name:          w.name,
      vintage:       w.vintage,
      type:          w.type,
      region:        w.region,
      producer:      w.producer,
      quantity:      w.quantity,
      purchasePrice: w.purchasePrice,
      currentOwner:  w.owner,
    });

    // 2. Mine a block for this bottle
    const block = await addBlockToChain({
      type:     "REGISTER",
      bottleId: bottle.bottleId,
      name:     w.name,
      vintage:  w.vintage,
      wineType: w.type,
      region:   w.region,
      producer: w.producer,
      quantity: w.quantity,
      owner:    w.owner,
      action:   `Bottle "${w.name}" ${w.vintage} registered by ${w.owner}`,
    }, bottle._id);

    // 3. Write hashes back onto the bottle
    bottle.genesisBlockHash = block.hash;
    bottle.latestBlockHash  = block.hash;
    bottle.blockIndices.push(block.index);
    await bottle.save();

    // 4. Backdate createdAt so analytics monthly chart shows spread
    const createdAt = new Date(w.y, w.m - 1, w.d);
    await Bottle.collection.updateOne(
      { _id: bottle._id },
      { $set: { createdAt, updatedAt: createdAt } }
    );

    console.log(`  ✓ ${bottle.bottleId}  ${w.type.padEnd(10)} £${String(w.purchasePrice).padStart(4)}  ${w.name} ${w.vintage}`);
    console.log(`       block #${block.index}  hash: ${block.hash.slice(0, 20)}…`);
    added++;
  }

  console.log(`\n🍷 Done — ${added} wines added with real blockchain hashes.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
