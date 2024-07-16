const { ethers ,upgrades } = require('hardhat');
const { TOKEN_ADDRESS } = process.env;

 const { MINT_MAX_LIMIT ,MONTHS,DAYSINMONTH,HARDCAP} = process.env;
 const { ADMIN_ADDRESS } = process.env

async function main(){
 
  [admin, addr1, addr2, receiver] = await ethers.getSigners();
    const vestingContract = await ethers.getContractFactory("VestingContract");
    const MAX_LIMIT = await ethers.parseEther(MINT_MAX_LIMIT);
   
  
    const daysInMonth = 30||DAYSINMONTH;
    const months = MONTHS;
    // const duration = months * daysInMonth * 24 * 60 * 60;
    const duration = 2*60;                                                     //redeployImplementatio
    vestedProxyContract = await upgrades.deployProxy(vestingContract, [ADMIN_ADDRESS, TOKEN_ADDRESS, MAX_LIMIT, duration], { kind: 'uups' });
    await vestedProxyContract.waitForDeployment();
  
    
  const vestingImplContractAddress = await upgrades.erc1967.getImplementationAddress(vestedProxyContract.target);


  // provide access role to the vesting contract

  console.log(
    "vesting contract is deployed successfully.",
    "\n",
    "vesting contract address:",
    vestedProxyContract.target,
    "\n Impl contract address:",
    vestingImplContractAddress
  );


}

main().then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});