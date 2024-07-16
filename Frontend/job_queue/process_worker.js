const logger = require('log4js').getLogger('process_worker');
const { eventListenerQ, tokenListenerQ, mintEventListenerQ } = require('./process_manager');
const eventListenerWorker = require('./workers/burnEventListenerWorker');
const tokenMintAndVestWorker = require('./workers/vestingContractListenerWorker');
const tokenMintListenerWorker = require('./workers/mintListenerWorker');

module.exports = {
  startWorker: async () => {
    eventListenerQ.process(async (job) => {
      logger.info('eventListener worker started');
      await eventListenerWorker(job);
    });

    mintEventListenerQ.process(async (job) => {
      logger.info('mintEventListener worker started');
      await tokenMintListenerWorker(job);
    });

    tokenListenerQ.process(async (job) => {
      logger.info('token mintAnd vest process worker started');
      await tokenMintAndVestWorker(job);
    });
  },
};
