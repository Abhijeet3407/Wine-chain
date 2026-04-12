const crypto = require("crypto");

class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.timestamp +
          this.previousHash +
          JSON.stringify(this.data) +
          this.nonce
      )
      .digest("hex");
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.difficulty = 2;
  }

  createGenesisBlock() {
    return new Block(0, new Date().toISOString(), { type: "GENESIS", message: "Wine Chain Genesis Block" }, "0");
  }

  createBlock(previousBlock, data) {
    const block = new Block(
      previousBlock.index + 1,
      new Date().toISOString(),
      data,
      previousBlock.hash
    );
    block.mineBlock(this.difficulty);
    return block;
  }

  isChainValid(blocks) {
    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const previous = blocks[i - 1];

      const recalculated = crypto
        .createHash("sha256")
        .update(
          current.index +
            current.timestamp +
            current.previousHash +
            JSON.stringify(current.data) +
            current.nonce
        )
        .digest("hex");

      if (current.hash !== recalculated) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }
}

module.exports = { Block, Blockchain };
