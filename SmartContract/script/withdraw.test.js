const { ethers ,upgrades } = require('hardhat');


async function main(){
 
  [admin, addr1, addr2, receiver] = await ethers.getSigners();
    const vestingContract = await ethers.getContractFactory("VestingContract");
    const Value = await ethers.parseEther("1");
    const withdraw =  await vestingContract.attach('0x5eF6977DfdB5f2793298528a2D66a78C7d3E0979').withdraw("0x06C2479D95AEe2C66e3369440A92EC0AA2885Ea0",1);
    console.log("function call",withdraw);


}

main().then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});