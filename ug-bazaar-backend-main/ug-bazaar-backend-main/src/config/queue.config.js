const { Queue } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let redisConnection = null;
let useMockQueues = false;

try {
  redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Failed to connect to Redis after 3 retries. Switching to in-memory simulated background scheduler.');
        useMockQueues = true;
        return null; // Stop retrying, fail connection
      }
      return Math.min(times * 100, 2000);
    }
  });

  redisConnection.on('error', (err) => {
    logger.warn(`Redis connection warning: ${err.message}. Mock scheduler fallback active: ${useMockQueues}`);
  });
} catch (e) {
  logger.warn('Redis client initialization failed. Using mock scheduler fallback.');
  useMockQueues = true;
}

class MockQueue {
  constructor(name) {
    this.name = name;
  }
  async add(jobName, data) {
    logger.info(`[MockQueue: ${this.name}] Scheduling job "${jobName}" instantly in-memory:`, data);
    
    // Simulate async dispatch
    setTimeout(async () => {
      try {
        const worker = require('../jobs/worker');
        if (worker && worker.processJobMock) {
          await worker.processJobMock(this.name, jobName, data);
        }
      } catch (err) {
        logger.error(`Error in mock worker processing: ${err.message}`);
      }
    }, 1000);
    return { id: `mock_job_${Math.random()}` };
  }
}

const getQueue = (queueName) => {
  if (useMockQueues || !redisConnection) {
    return new MockQueue(queueName);
  }
  return new Queue(queueName, { connection: redisConnection });
};

module.exports = {
  getQueue,
  redisConnection,
  useMockQueues
};
