import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import Message from '../models/Message.js';
import { emitStatusUpdate } from '../sockets/socketService.js';

const connectionOpts = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
};

let redisConnection = null;
let messageQueue = null;
let messageWorker = null;

export const initBullQueue = () => {
  try {
    redisConnection = new IORedis(connectionOpts);
    
    
    redisConnection.on('error', (err) => {
      console.error('[BullMQ] Redis connection error:', err.message);
    });


    messageQueue = new Queue('messageQueue', { connection: redisConnection });
    console.log('[BullMQ] Queue initialized successfully.');

    
    messageWorker = new Worker('messageQueue', async (job) => {
      const { messageId } = job.data;
      console.log(`[BullMQ Worker] Processing job ${job.id} for message: ${messageId}`);

      
      await new Promise((resolve) => setTimeout(resolve, 3000));

      
      const message = await Message.findById(messageId);
      if (message) {
        message.status = 'sent';
        await message.save();
        console.log(`[BullMQ Worker] Job ${job.id} processed successfully. Message: ${messageId}`);

        
        emitStatusUpdate(messageId, 'sent');

        
        setTimeout(async () => {
          try {
            const deliveredMessage = await Message.findById(messageId);
            if (deliveredMessage && deliveredMessage.status === 'sent') {
              deliveredMessage.status = 'delivered';
              await deliveredMessage.save();
              console.log(`[BullMQ Worker] Message ${messageId} auto-marked 'delivered'`);
              emitStatusUpdate(messageId, 'delivered');
            }
          } catch (deliverErr) {
            console.error(`[BullMQ Worker] Failed auto-delivering message ${messageId}:`, deliverErr.message);
          }
        }, 3000);
      } else {
        throw new Error(`Message ${messageId} not found in database.`);
      }
    }, { 
      connection: redisConnection,
      concurrency: 1
    });

    messageWorker.on('completed', (job) => {
      console.log(`[BullMQ Worker] Job ${job.id} completed!`);
    });

    messageWorker.on('failed', async (job, err) => {
      console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
      if (job && job.data.messageId) {
        try {
          const message = await Message.findById(job.data.messageId);
          if (message) {
            message.status = 'failed';
            await message.save();
            emitStatusUpdate(job.data.messageId, 'failed');
          }
        } catch (dbErr) {
          console.error(`[BullMQ Worker] Failed to update error status for ${job.data.messageId}:`, dbErr.message);
        }
      }
    });

    return { queue: messageQueue, worker: messageWorker };
  } catch (error) {
    console.error('[BullMQ] Initialization failed:', error.message);
    throw error;
  }
};

export const enqueueBullMessage = async (messageId) => {
  if (!messageQueue) {
    throw new Error('BullMQ has not been initialized or failed to start.');
  }
  await messageQueue.add('sendMessageJob', { messageId });
  console.log(`[BullMQ] Added message ${messageId} to Redis queue`);
};
