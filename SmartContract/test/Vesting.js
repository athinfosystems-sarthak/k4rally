const { ethers } = require('hardhat');
const { expect } = require('chai');
const { TOKEN_ADDRESS } = process.env;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const { MINT_MAX_LIMIT, MONTHS, DAYSINMONTH, HARDCAP } = process.env;
const { ADMIN_ADDRESS, RECEIVER_ADDRESS } = process.env

describe('vestingContract', async function () {
  let receiver
  let addr2
  let mintor
  let admin
  let tokenContract
  let vestedProxyContract
  beforeEach(async function () {
    [admin, addr1, addr2, receiver, mintor] = await ethers.getSigners();

    const TOKEN = await ethers.getContractFactory("Token");
    const hardCap = ethers.parseEther("1000000000");
    tokenContract = await TOKEN.deploy(admin.address, receiver.address, hardCap, 'MOCKTOKEN', 'MTC');
    await tokenContract.waitForDeployment();


    const MAX_LIMIT = await ethers.parseEther(MINT_MAX_LIMIT);


    const daysInMonth = DAYSINMONTH;
    const months = MONTHS;
    const duration = months * daysInMonth * 24 * 60 * 60;
    const vestingContract = await ethers.getContractFactory("VestingContract");

    vestedProxyContract = await upgrades.deployProxy(vestingContract, [admin.address, tokenContract.target, MAX_LIMIT, duration], { kind: 'uups' });
    await vestedProxyContract.waitForDeployment();

    const vestingImplContractAddress = await upgrades.erc1967.getImplementationAddress(vestedProxyContract.target);

    // Grant MINTER_ROLE of vesting contract to admin (backend )
    const MINTER_ROLE = await vestedProxyContract.MINTER_ROLE();
    await vestedProxyContract.grantRole(MINTER_ROLE, mintor);

    // provide token mint access to vesting contact by owner
    await tokenContract.connect(admin).setVestingContractAddress(vestedProxyContract.target);


    console.log(
      "vesting contract is deployed successfully.",
      "\n",
      "vesting contract address:",
      vestedProxyContract.target,
      "vesting contract implemented contract address",
      vestingImplContractAddress
    );
    console.log(
      "token contract is deployed successfully.",
      "\n",
      "token contract address:",
      tokenContract.target,
    );
  });

  it('mintAndVest functions', async function () {


    const _amount = await ethers.parseEther("100");
    await vestedProxyContract.connect(mintor).mintAndVest(admin.address, _amount,);
    expect(await tokenContract.balanceOf(vestedProxyContract.target)).to.be.equal(_amount);


    const _amount1 = await ethers.parseEther("100");

    await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, _amount1);
    expect(await tokenContract.balanceOf(vestedProxyContract.target)).to.be.equal(_amount + _amount1);
  });


  it('mintAndVest when mint with above the maxLimit', async function () {

    const _amount = await ethers.parseEther("26000000");
    await expect(vestedProxyContract.connect(mintor).mintAndVest(admin, _amount)).to.be.revertedWithCustomError(vestedProxyContract, 'AmountMustBeLessMaxLimit');


  });

  it('mintAndVest when befenificery address are 0', async function () {
    const _amount = await ethers.parseEther("26000000");

    await expect(vestedProxyContract.connect(mintor).mintAndVest(ZERO_ADDRESS, _amount)).to.be.revertedWithCustomError(vestedProxyContract, 'AddressZeroNotAllowed');
  });


  describe('WithDraw functions', async function () {

      it('for single users', async function () {

        const _amount = await ethers.parseEther("1000");
        await vestedProxyContract.connect(mintor).mintAndVest(addr2.address, _amount);

        expect(await tokenContract.balanceOf(vestedProxyContract.target)).to.be.equal(_amount);
        // Fast-forward 1 month
        const daysInMonth = 30;
        const months = 8;
        const duration = months * daysInMonth * 24 * 60 * 60;
        await ethers.provider.send('evm_increaseTime', [duration]);
        await ethers.provider.send('evm_mine'); // Mine a new block to update the block timestamp
        const amountAfter1Month = _amount

        await vestedProxyContract.connect(addr2).withdraw(1);
        expect(await tokenContract.balanceOf(addr2.address)).to.be.equal(amountAfter1Month);


      });

      it('try to withdraw before the timeLock duration', async function () {


        const _amount = await ethers.parseEther("1000");
        await vestedProxyContract.connect(mintor).mintAndVest(addr2.address, _amount);

        expect(await tokenContract.balanceOf(vestedProxyContract.target)).to.be.equal(_amount);
        // Fast-forward 1 month
        const daysInMonth = 30;
        const months = 7;
        const duration = months * daysInMonth * 24 * 60 * 60;
        await ethers.provider.send('evm_increaseTime', [duration]);
        await ethers.provider.send('evm_mine');

        await expect(vestedProxyContract.connect(addr2).withdraw(1)).to.be.revertedWithCustomError(vestedProxyContract, "NoTokensAvailableForRelease");
      });

      it('single user mint multiple time ', async function () {

        const _amount1 = await ethers.parseEther("500");
        await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, _amount1);

        //withdraw token before durations 
        await expect(vestedProxyContract.connect(addr1).withdraw(1)).to.be.revertedWithCustomError(vestedProxyContract, 'NoTokensAvailableForRelease')

        let daysInMonth = 30;
        let months = 8;
        let duration = months * daysInMonth * 24 * 60 * 60;
        await ethers.provider.send('evm_increaseTime', [duration]);
        await ethers.provider.send('evm_mine');


        const _amount2 = await ethers.parseEther("500");
        await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, _amount2);

        //Testing VestingContract balance
        expect(await tokenContract.balanceOf(vestedProxyContract.target)).to.be.equal(_amount2 + _amount1);


        await vestedProxyContract.connect(addr1).withdraw(1);
        const amountAfter1Month = _amount1
        expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(amountAfter1Month);

       daysInMonth = 30;
        months = 8;
        duration = months * daysInMonth * 24 * 60 * 60;
        await ethers.provider.send('evm_increaseTime', [duration]);
        await ethers.provider.send('evm_mine');

        await vestedProxyContract.connect(addr1).withdraw(2);
        await expect(vestedProxyContract.connect(addr1).withdraw(1)).to.be.revertedWithCustomError(vestedProxyContract, 'TokenAlreadyClaimed');
        // withdraw token after 2nd month
        const amountAfter2Month = _amount1

        //user balance after 2 month
        expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(amountAfter1Month + amountAfter2Month);

      });

      it('multiple user mint and withdraw token at same timestamp', async function () {
        const amount1 = ethers.parseEther("1000");
        await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, amount1);
        const amount2 = ethers.parseEther("2000");
        await vestedProxyContract.connect(mintor).mintAndVest(addr2.address, amount2);

        let daysInMonth = 30;
        let months = 8;
        let duration = months * daysInMonth * 24 * 60 * 60;
        await ethers.provider.send('evm_increaseTime', [duration]);
        await ethers.provider.send('evm_mine');

        const after2month1 = amount1
        const after2month2 = amount2

        await vestedProxyContract.connect(addr2).withdraw(1);
        await vestedProxyContract.connect(addr1).withdraw(1);

        expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(after2month1);
        expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(after2month1);

      })
      it('if single user mint one time and withdraw multiple time', async function () {
        const _amount1 = await ethers.parseEther("500");
        await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, _amount1);
        await expect(vestedProxyContract.connect(addr1).withdraw(1)).to.be.revertedWithCustomError(vestedProxyContract, 'NoTokensAvailableForRelease')
        let daysInMonth = 30;
        let months = 8;
        let duration = months * daysInMonth * 24 * 60 * 60;
        await ethers.provider.send('evm_increaseTime', [duration]);
        await ethers.provider.send('evm_mine');

        await vestedProxyContract.connect(addr1).withdraw(1);
        const amountAfter1Month = _amount1
        expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(amountAfter1Month);

        await expect(vestedProxyContract.connect(addr1).withdraw(1)).to.be.revertedWithCustomError(vestedProxyContract, 'TokenAlreadyClaimed');


      })
      it('if user try to withdraw token , before mint', async function () {
        const _amount1 = await ethers.parseEther("500");
        await expect(vestedProxyContract.connect(addr1).withdraw(1)).to.be.revertedWithCustomError(vestedProxyContract, 'UserNotFound')


      });

      it('if user put scheduleId less than 1 , before mint', async function () {
        const _amount1 = await ethers.parseEther("500");
        await expect(vestedProxyContract.connect(addr1).withdraw(0)).to.be.revertedWithCustomError(vestedProxyContract, 'InvalidScheduleId')


      });

  })

  describe('getFunction', async function () {


    it("getAllVest list", async function () {
      const amount1 = ethers.parseEther("1000");
      await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, amount1);
      const amount2 = ethers.parseEther("2000");
      await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, amount2);
      const amount3 = ethers.parseEther("2000");
      await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, amount3);
      let daysInMonth = 30;
      let months = 8;
      let duration = months * daysInMonth * 24 * 60 * 60;
      await ethers.provider.send('evm_increaseTime', [duration]);
      await ethers.provider.send('evm_mine');

      await vestedProxyContract.connect(addr1).withdraw(2);

      const data = await vestedProxyContract.getAllVestingSchedule(addr1.address);

      const vestingSchedule = data;
      expect(vestingSchedule).to.have.lengthOf(3);

      // // Verify individual vesting schedules
      expect(vestingSchedule[0].id).to.equal(1);
      expect(vestingSchedule[0].beneficiary).to.equal(addr1.address);
      expect(vestingSchedule[0].amountTotal).to.equal(amount1);
      expect(vestingSchedule[0].claim).to.equal(false);




      expect(vestingSchedule[1].id).to.equal(2);
      expect(vestingSchedule[1].beneficiary).to.equal(addr1.address);
      expect(vestingSchedule[1].amountTotal).to.equal(amount2);
      expect(vestingSchedule[1].claim).to.equal(true);

      expect(vestingSchedule[2].id).to.equal(3);
      expect(vestingSchedule[2].beneficiary).to.equal(addr1.address);
      expect(vestingSchedule[2].amountTotal).to.equal(amount3);
      expect(vestingSchedule[2].claim).to.equal(false);

    })
  });


  it('Emercency withdraw  by unauthorized user', async function () {

    const value = ethers.parseEther("1000");
    await vestedProxyContract.connect(mintor).mintAndVest(addr2.address, value);
    await expect(vestedProxyContract.connect(addr2).emergencyWithdraw(value, addr2.address)).to.be.revertedWithCustomError(vestedProxyContract, "AccessControlUnauthorizedAccount");

  });
  it('Emergency withdraw fund if amount 0', async function () {
    const totalMintAmount = ethers.parseEther("1100");
    await vestedProxyContract.connect(mintor).mintAndVest(addr1.address, totalMintAmount);
    const withdrawAmount = ethers.parseEther("100");
    await vestedProxyContract.connect(admin).emergencyWithdraw(withdrawAmount, addr1.address);
    expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(withdrawAmount);

    const withdrawAmount2 = ethers.parseEther('50');
    await vestedProxyContract.connect(admin).emergencyWithdraw(withdrawAmount2, addr1.address);
    expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(withdrawAmount + withdrawAmount2);

    const zeroAmount = ethers.parseEther('0');
    await vestedProxyContract.connect(admin).emergencyWithdraw(zeroAmount, addr1.address);
    expect(await tokenContract.balanceOf(addr1.address)).to.be.equal(totalMintAmount);
  })



})

