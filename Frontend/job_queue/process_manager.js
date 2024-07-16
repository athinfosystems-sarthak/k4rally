const QueueHelper = require('./utils/queueHelper');

const eventListenerQ = QueueHelper.getQueueInstance('eventListenerQ');
const tokenListenerQ = QueueHelper.getQueueInstance('tokenListenerQ');
const mintEventListenerQ = QueueHelper.getQueueInstance('mintEventListenerQ');

module.exports = {
  serverAdapter: QueueHelper.getServerAdapter(),
  eventListenerQ,
  tokenListenerQ,
  mintEventListenerQ,
};
