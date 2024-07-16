/* eslint-disable max-len */
/* eslint-disable no-dupe-class-members */
const ethers = require('ethers');
const path = require('path');
const fs = require('fs');
const { WEB3 } = require('./vars');

class Web3Js {
  constructor() {
    // https://1rpc.io/bnb

    this.bnbInstance = new ethers.JsonRpcProvider(WEB3.BNB_TESTNET_RPC_URL);
    this.polygonInstance = new ethers.JsonRpcProvider(WEB3.POLYGON_TESTNET_RPC_URL);
  }

  async getABIForContract(fileName) {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) {
      throw Error(`ABI file ${fileName} does not exist!`);
    }
    const abiAsStr = fs.readFileSync(filePath);
    return JSON.parse(abiAsStr.toString());
  }

  async getContractInstance(address) {
    const fileName = '../../ABI/bnbTokenAbi.json';
    const ABI = await this.getABIForContract(fileName);
    const contractInstance = new ethers.Contract(address, ABI, this.bnbInstance);
    return contractInstance;
  }

  async getPolygonContractInstance(address) {
    const fileName = '../../ABI/polygonVestingAbi.json';

    const ABI = await this.getABIForContract(fileName);
    const wallet = new ethers.Wallet(WEB3.PRIVATE_KEY, this.polygonInstance);
    const contractInstance = new ethers.Contract(address, ABI, wallet);
    return contractInstance;
  }
}
module.exports = new Web3Js();
