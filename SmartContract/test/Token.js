const { expect } = require('chai');
const { ethers } = require('hardhat');
const { TOKEN_NAME ,TOKEN_SYMBOL } = process.env;
describe('token',function(){
  let tokenContract
  let tokenImplContractAddress
  let deployer
  let addr1

   beforeEach(async function(){
    [deployer,addr1,addr2] = await ethers.getSigners();
    const TOKEN = await ethers.getContractFactory("Token");
    const hardCap = ethers.parseEther("1000000000");
     tokenContract = await TOKEN.deploy(deployer.address, deployer.address ,hardCap,TOKEN_NAME,TOKEN_SYMBOL);    
    await tokenContract.waitForDeployment();
    
  console.log(
    "token contract is deployed successfully.",
    "\n",
    "token contract address:",
    tokenContract.target,
   
  );
   });

   it('token name and symbol',async function(){
 
    expect(await tokenContract.name()).to.be.equal('MOCKTOKEN');
    expect(await tokenContract.symbol()).to.be.equal('MTC')
   });

   it('75 milion token at creation time',async function(){
      const total_supply = ethers.parseEther("75000000");
      expect(await tokenContract.totalSupply()).to.be.equal(total_supply);

   } )

   
   it('total supply must be under the  hardcap value ', async function(){
    const mintValue = ethers.parseEther('1200000000');   
    await tokenContract.connect(deployer).setVestingContractAddress(addr1.address);
    await expect(tokenContract.connect(addr1).mint(deployer,mintValue)).to.be.revertedWithCustomError(tokenContract,'ERC20ExceededCap');
   })

   it('mint token less than hardCap value ', async function(){
    const mintValue = ethers.parseEther('10000');
    await tokenContract.connect(deployer).setVestingContractAddress(addr2.address);
    await tokenContract.connect(addr2).mint(addr1.address,mintValue);
    expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(mintValue);

   })
   it('mint token more which cross hardCap limit (1 Billion)', async function(){
    const mintValue = ethers.parseEther('926000000');
    await tokenContract.connect(deployer).setVestingContractAddress(addr2.address);
    //await tokenContract.connect(addr2).mint(addr1.address,mintValue);
    await expect(tokenContract.connect(addr2).mint(deployer.address, mintValue)).to.be.revertedWithCustomError(tokenContract,'ERC20ExceededCap');
    
   })
   it('mint token by unAuthorized user', async function(){
      const mintValue = ethers.parseEther('1000');
      await tokenContract.connect(deployer).setVestingContractAddress(addr1.address);
      await expect(tokenContract.connect(deployer).mint(addr2.address,mintValue)).to.be.revertedWithCustomError(tokenContract,"minterMustBeVestingContract");
   })

});