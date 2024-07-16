const logger = require('log4js').getLogger('burn event on contract');
const config = require('../../app/models/config.model');
const web3 = require('../../app/services/web3.service');
const { addTokenForMint } = require('../add_queue');

class SmartContractEventListener {
  async burnEvent({ contractAddress }) {
    console.log('Contract address', contractAddress);
    try {
      const latestBlock = await web3.bnbInstance.getBlockNumber();
      let blocknumber = await config.findOne({ congifType: 'blockNumber', chain: 'bnb' });

      if (!blocknumber) {
        blocknumber = await config.create({
          congifType: 'blockNumber',
          value: latestBlock,
          chain: 'bnb',
        });
      }
      const event = [
        'Transfer',
      ];

      console.log(`{block from ${blocknumber?.value}------>>>>>>>- bnb blockchain -to------>>>>>>>>${latestBlock}}`);
      const logs = await web3.bnbInstance.getLogs({
        fromBlock: blocknumber?.value,
        toBlock: latestBlock,
        address: contractAddress,
      });

      for (let i = 0; i < logs.length; i++) {
        const parseLogs = (await web3.getContractInstance(contractAddress))
          .interface.parseLog({ data: logs[i].data, topics: logs[i].topics });
        if (event.includes(parseLogs.name)) {
          const from = parseLogs.args[0];
          const to = parseLogs.args[1];
          const data = parseLogs.args[2];

          if (to === '0x0000000000000000000000000000000000000000') {
            logger.info('get token burn transcation');
            const burnTime = new Date();
            addTokenForMint(from, data.toString(), burnTime);
          }
        }
      }

      blocknumber.value = latestBlock + 1;
      await blocknumber.save();
    } catch (err) {
      console.log('error insde burn event helper', err);
    }
  }
}

module.exports = new SmartContractEventListener();
