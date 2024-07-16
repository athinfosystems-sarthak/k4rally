const mintAndWestHandler = require('../utils/mintAndVestHelper');
const { WEB3 } = require('../../app/services/vars');

module.exports = async (job) => {
  try {
    console.log('before mintEvent Listener start');
    await mintAndWestHandler.mintEvent({ contractAddress: WEB3.VESTING_CONTRACT_ADDRESS });

    return Promise.resolve('event handling done ');
  } catch (error) {
    job.log(`Error occured ${error}`);
    console.log('error inside mintEvent Listener', error);
    return Promise.reject(error.message);
  }
};
