const { ethers ,upgrades } = require('hardhat');
const { VESTING_ADDRESS_TO_UPGRADE } = process.env;

async function main(){

    [deployer] = await ethers.getSigners();
    const vestingContract = await ethers.getContractFactory("VestingContract");
  
    const vestedProxyContract = await upgrades.upgradeProxy(VESTING_ADDRESS_TO_UPGRADE,vestingContract,{kind: 'uups'});
    await vestedProxyContract.waitForDeployment();
  const vestingImplContractAddress = await upgrades.erc1967.getImplementationAddress(vestedProxyContract.target);
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