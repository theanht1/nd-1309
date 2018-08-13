/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const { initDB, getDBLength, getLevelDBData, addDataToLevelDB } = require('./levelSandbox');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
     this.hash = '';
     this.height = 0;
     this.body = data;
     this.time = 0;
     this.previousBlockHash = '';
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    this.initChain()
  }

  // Initial chain's data
  async initChain() {

    // Get chain height
    this.chainHeight = Number(await getDBLength());
    // Initial db and genesis block
    if (Number(this.chainHeight) === 0) {
      await initDB();
      await this.addBlock(new Block("First block in the chain - Genesis block"));
    }
  }

  // Add new block
  async addBlock(newBlock) {
    // Block height
    newBlock.height = this.chainHeight;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if (this.chainHeight > 0){
      newBlock.previousBlockHash = (await this.getBlock(this.chainHeight - 1)).hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    this.chainHeight++;
    addDataToLevelDB(JSON.stringify(newBlock));
    return newBlock;
  }

  // Get block height
  getBlockHeight() {
    return this.chainHeight;
  }

  // get block
  async getBlock(blockHeight) {
    // return object as a single string
    const blockString = await getLevelDBData(blockHeight);
    try {
      return JSON.parse(blockString);
    } catch (e) {
      return false;
    }
  }

  // validate block
  async validateBlock(blockHeight) {
    // get block object
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
        return true;
      } else {
        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
        return false;
      }
  }

  // Validate blockchain
  async validateChain(){
    let errorLog = [];
    for (let i = 0; i < this.chainHeight - 1; i++) {
      // validate block
      if (!(await this.validateBlock(i))) errorLog.push(i);
      // compare blocks hash link
      const currentBlock = await this.getBlock(i);
      const blockHash = currentBlock.hash;
      const nextBlock = await this.getBlock(i+1);
      const previousHash = nextBlock.previousBlockHash;
      if (blockHash !== previousHash) {
        errorLog.push(i);
      }
    }
    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: ' + errorLog);
      return false;
    } else {
      console.log('No errors detected');
      return true;
    }
  }

  // Generate n test blocks
  async generateTestBlocks(n) {
    for (let i = 0; i <= n; i++) {
      await this.addBlock(new Block("test data "+i));
    }
  }
}

module.exports = {
  Block,
  Blockchain,
};
