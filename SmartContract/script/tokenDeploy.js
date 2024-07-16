const { ethers , upgrades } = require('hardhat');
const {ADMIN_ADDRESS ,RECEIVER_ADDRESS,HARDCAP } = process.env;
const { TOKEN_NAME ,TOKEN_SYMBOL } = process.env;
async function main(){
 
  [deployer,addr1,addr2] = await ethers.getSigners();
  const TOKEN = await ethers.getContractFactory("Token");
  const hardCap = ethers.parseEther(HARDCAP);
   tokenContract = await TOKEN.deploy(ADMIN_ADDRESS, RECEIVER_ADDRESS ,hardCap,TOKEN_NAME,TOKEN_SYMBOL);    
  await tokenContract.waitForDeployment();
  
console.log(
  "token contract is deployed successfully.",
  "\n",
  "token contract address:",
  tokenContract.target,
 
);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
