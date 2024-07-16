const logger = require('log4js').getLogger('mintAndVestHelper');
const config = require('../../app/models/config.model');
const web3 = require('../../app/services/web3.service');
const vestModel = require('../../app/models/vest.model');
const { STATUS } = require('../../app/utils/enumHelper');

class MintEventListener {
  async mintEvent({ contractAddress }) {
    try {
      console.log('polygon contract address', contractAddress);
      const latestBlock = await web3.polygonInstance.getBlockNumber();
      const blocknumber = await config.findOne({ congifType: 'blockNumber', chain: 'polygon' });
      if (!blocknumber) {
        await config.create({
          congifType: 'blockNumber',
          value: latestBlock,
          chain: 'polygon',
        });
      }
      const event = [
        'TokensMintedAndVested',
      ];
      const withdrawEvent = [
        'TokenReleased',
      ];
      const logs = await web3.polygonInstance.getLogs({
        fromBlock: blocknumber?.value,
        toBlock: latestBlock,
        address: contractAddress,
      });
      console.log(`{block from ${blocknumber?.value}------>>>>>>>-polygon chain -to------>>>>>>>>${latestBlock}}`);
      for (let i = 0; i < logs.length; i++) {
        const parsedLog = (await web3.getPolygonContractInstance(contractAddress))
          .interface.parseLog({ data: logs[i].data, topics: logs[i].topics });

        if (event.includes(parsedLog.name)) {
          const data = await parsedLog.args;
          const scheduleId = data[0].toString();
          const beneficieryAddress = data[1].toLowerCase();
          const withdrawTime = new Date(Number(data[2] * 1000n));
          const amount = data[3];
          await vestModel.findOneAndUpdate({ beneficieryAddress, withdrawTime: { $exists: false } }, {
            scheduleId,
            beneficieryAddress,
            amount,
            withdrawTime,
            claim: STATUS.INCOMPLETE,
          }, { new: true });

          logger.info('new entry in the database');
        }

        if (withdrawEvent.includes(parsedLog.name)) {
          const data = await parsedLog.args;
          const beneficieryAddress = data[0].toLowerCase();
          const scheduleId = data[2].toString();
          await vestModel.findOneAndUpdate({ beneficieryAddress, scheduleId }, {
            claim: STATUS.SUCCESS,
          }, { new: true });
        }
      }

      blocknumber.value = latestBlock + 1;
      await blocknumber.save();
    } catch (error) {
      console.log('error', error);
    }
  }
}
module.exports = new MintEventListener();
