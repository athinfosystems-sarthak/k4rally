/* eslint-disable import/no-unresolved */
const Queue = require('bull');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { REDIS_HOST, REDIS_PORT } = require('../../config/envs');

class QueueHelper {
  constructor() {
    this.serverAdapter = new ExpressAdapter();
    this.bullBoard = createBullBoard({
      queues: [],
      serverAdapter: this.serverAdapter,
    });
  }

  getServerAdapter() {
    return this.serverAdapter;
  }

  getBullBoard() {
    return this.bullBoard;
  }

  getQueueInstance(queue_name) {
    const redisConnectOptions = {
      host: REDIS_HOST,
      port: REDIS_PORT,
      maxRetriesPerRequest: 100,
    };
    const Q = new Queue(queue_name, {
      redis: redisConnectOptions,
      settings: {
        retryProcessDelay: 5000, // 5 seconds delay before retrying a failed job
      },
    });
    this.addQueueToBullBoard(Q);
    return Q;
  }

  async deleteQueueInstance(queue_name) {
    const queue = this.getQueueInstance(queue_name);
    await queue.obliterate();
    this.deleteQueueFromBullBoard(queue);
    return true;
  }

  async deleteQueueFromBullBoard(queue_instance) {
    this.bullBoard.removeQueue(new BullAdapter(queue_instance));
  }

  async addQueueToBullBoard(queue_instance) {
    this.bullBoard.addQueue(new BullAdapter(queue_instance));
  }
}

module.exports = new QueueHelper();
