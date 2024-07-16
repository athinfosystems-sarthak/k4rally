const logger = require('log4js').getLogger('add_task');
const { eventListenerQ, mintEventListenerQ, tokenListenerQ } = require('./process_manager');

module.exports = {
  startSchedulers: async () => {
    logger.info('Schedulers started');
    eventListenerQ.add({}, {
      repeat: {
        every: 60000,
      },
    });

    mintEventListenerQ.add({}, {
      repeat: {
        every: 60000,
      },
    });
  },

  addTokenForMint: async (beneficieryAddress, amount, burnTime) => {
    logger.info('Token added for mintAndVest');
    tokenListenerQ.add({ beneficieryAddress, amount, burnTime });
  },
};
