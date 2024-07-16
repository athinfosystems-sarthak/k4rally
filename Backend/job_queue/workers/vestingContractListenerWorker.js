const logger = require('log4js').getLogger('vesting contract worker');
const web3 = require('../../app/services/web3.service');
const { WEB3 } = require('../../app/services/vars');
const userModel = require('../../app/models/user.model');
const vestModel = require('../../app/models/vest.model');

module.exports = async (job) => {
  try {
    const { beneficieryAddress, amount, burnTime } = job.data;
    let user = await userModel.findOne({ walletAddress: beneficieryAddress.toLowerCase() });

    if (!user) {
      user = await userModel.create({
        walletAddress: beneficieryAddress.toLowerCase(),
      });
    }

    await vestModel.create({

      user_id: user?._id,
      beneficieryAddress: beneficieryAddress.toLowerCase(),
      amount: amount,
      burnDate: burnTime,

    });
    const contract = await web3.getPolygonContractInstance(WEB3.VESTING_CONTRACT_ADDRESS);
    await contract.mintAndVest(beneficieryAddress, BigInt(amount));
    logger.info('token minted and vest in vesting contract');
  } catch (err) {
    console.log('error insidde vestincontract', err);
    logger.error('error occurs inside vesting contract');
  }
};
