const scEventsHandler = require('../utils/burnEventHelper');
const { WEB3 } = require('../../app/services/vars');

module.exports = async (job) => {
  try {
    await scEventsHandler.burnEvent({ contractAddress: WEB3.TOKEN_CONTRACT_ADDRESS });
    return Promise.resolve('event handling done ');
  } catch (error) {
    job.log(`Error occured ${error}`);
    console.log('error', error);
    return Promise.reject(error.message);
  }
};
