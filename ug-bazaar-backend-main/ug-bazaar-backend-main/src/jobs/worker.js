const { Worker } = require('bullmq');
const { redisConnection, useMockQueues } = require('../config/queue.config');
const logger = require('../utils/logger');
const { sendWhatsApp } = require('../config/twilio');

const processJob = async (queueName, jobName, data) => {
  logger.info(`Processing background job: ${queueName} -> ${jobName}`);
  try {
    switch (queueName) {
      case 'notificationQueue':
        if (jobName === 'sendWelcomeMessage') {
          const { mobile, name } = data;
          await sendWhatsApp(mobile, `🎉 Namaste ${name} ji!\nUG Bazaar mein swagat!\n📞 8390901925`);
        } else if (jobName === 'sendOrderStatusUpdate') {
          const { mobile, orderId, status } = data;
          await sendWhatsApp(mobile, `📦 Order Update! Aapka Order ${orderId} ab "${status}" ho gaya hai.`);
        }
        break;
      case 'emailQueue':
        if (jobName === 'sendOrderReceipt') {
          const { email, orderId, total } = data;
          const { sendEmail } = require('../utils/mailer');
          await sendEmail(
            email,
            `UG Bazaar — Order Receipt ${orderId}`,
            `Thank you for your order! Your order ${orderId} has been successfully received.\nGrand Total: ₹${total}\nYou can download your tax invoice PDF from your profile on our website.`
          );
        }
        break;
      default:
        logger.warn(`Unknown queue processing: ${queueName}`);
    }
  } catch (error) {
    logger.error(`Error processing job ${jobName}: ${error.message}`);
    throw error;
  }
};

// Start workers only if we're not falling back to mock mode
if (!useMockQueues && redisConnection) {
  logger.info('Initializing BullMQ Redis Workers...');
  
  const notifWorker = new Worker('notificationQueue', async (job) => {
    await processJob('notificationQueue', job.name, job.data);
  }, { connection: redisConnection });

  const emailWorker = new Worker('emailQueue', async (job) => {
    await processJob('emailQueue', job.name, job.data);
  }, { connection: redisConnection });

  notifWorker.on('completed', (job) => logger.info(`Job completed successfully: ${job.id}`));
  notifWorker.on('failed', (job, err) => logger.error(`Job failed: ${job.id} - ${err.message}`));
}

module.exports = {
  processJobMock: async (queueName, jobName, data) => {
    logger.info(`[Mock Worker] Running offline job logic for ${queueName}:${jobName}`);
    await processJob(queueName, jobName, data);
  }
};
