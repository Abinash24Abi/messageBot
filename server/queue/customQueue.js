import Message from '../models/Message.js';
import { emitStatusUpdate } from '../sockets/socketService.js';

class CustomQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }


  async add(messageId) {
    console.log(` Enqueued message: ${messageId}`);
    this.queue.push(messageId);
    this.processNext();
  }


  async processNext() {
    if (this.isProcessing) return;
    if (this.queue.length === 0) {
      console.log(' Queue is empty. Worker is idling.');
      return;
    }

    this.isProcessing = true;
    const messageId = this.queue.shift();

    try {
      console.log(` Worker started processing message: ${messageId}`);

   
      await new Promise((resolve) => setTimeout(resolve, 3000));

      
      const message = await Message.findById(messageId);
      if (message) {
        message.status = 'sent';
        await message.save();
        console.log(` Message ${messageId} successfully processed and marked 'sent'`);

                emitStatusUpdate(messageId, 'sent');

        
        setTimeout(async () => {
          try {
            const deliveredMessage = await Message.findById(messageId);
            if (deliveredMessage && deliveredMessage.status === 'sent') {
              deliveredMessage.status = 'delivered';
              await deliveredMessage.save();
              console.log(`[CustomQueue] Message ${messageId} auto-marked 'delivered'`);
              emitStatusUpdate(messageId, 'delivered');
            }
          } catch (deliverErr) {
            console.error(` Failed auto-delivering message ${messageId}:`, deliverErr.message);
          }
        }, 3000);
      } else {
        console.warn(` Message not found: ${messageId}`);
      }
    } catch (error) {
      console.error(` Error processing message ${messageId}:`, error.message);
      
      
      try {
        const message = await Message.findById(messageId);
        if (message) {
          message.status = 'failed';
          await message.save();
          emitStatusUpdate(messageId, 'failed');
        }
      } catch (dbErr) {
        console.error(` Failed to update error status for ${messageId}:`, dbErr.message);
      }
    } finally {
      this.isProcessing = false;
      
      this.processNext();
    }
  }

  
  async recoverPending() {
    try {
      const pendingMessages = await Message.find({ status: 'pending' }).sort({ createdAt: 1 });
      if (pendingMessages.length > 0) {
        console.log(`Recovered ${pendingMessages.length} pending messages on startup. Enqueueing...`);
        for (const msg of pendingMessages) {
          this.queue.push(msg._id.toString());
        }
        this.processNext();
      }
    } catch (error) {
      console.error('Error recovering pending messages:', error.message);
    }
  }
}

const customQueueInstance = new CustomQueue();
export default customQueueInstance;
