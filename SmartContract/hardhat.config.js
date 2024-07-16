
/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-chai-matchers");
require('dotenv').config();            
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ACCOUNT_PRIVATE_KEY=process.env.PRIVATE_KEY;
const POLYGON_URL = process.env.POLYGON_URL
console.log(typeof(POLYGON_URL));

module.exports = {
  solidity: "0.8.20",
  etherscan: {
   apiKey: process.env.API_KEY,
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [ACCOUNT_PRIVATE_KEY]
   
    },
    polygon: {
      url: `${POLYGON_URL}`,
      accounts: [ACCOUNT_PRIVATE_KEY]
      
    }
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY
    },
    customChains: [
      {
        network: "polygon",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        },
      }
    ]
  },
};
