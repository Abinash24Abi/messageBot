import Message from '../models/Message.js';
import User from '../models/User.js';
import { enqueueMessage } from '../queue/queueService.js';
import { getIO } from '../sockets/socketService.js';


export const sendMessage = async (req, res) => {
  const { recipientId, message } = req.body;

  try {
    if (!recipientId || !message) {
      return res.status(400).json({ success: false, error: 'Please provide recipient and message content' });
    }

    
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient user not found' });
    }


    const newMessage = await Message.create({
      phone: recipient.phone,
      message,
      status: 'pending',
      user: req.user._id,
      recipient: recipient._id,
    });

    console.log(`[MessageController] Saved pending direct message: ${newMessage._id}`);

    
    await enqueueMessage(newMessage._id.toString());

    
    try {
      const ioInstance = getIO();
      
      ioInstance.emit('new-message', newMessage);
    } catch (socketErr) {
      console.warn('[MessageController] Socket new-message emission failed:', socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message queued and enqueued successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};


export const getMessageHistory = async (req, res) => {
  const { contactId } = req.query;

  try {
    let query = {};
    let sort = { createdAt: -1 };

    if (contactId) {
      
      query = {
        $or: [
          { user: req.user._id, recipient: contactId },
          { user: contactId, recipient: req.user._id },
        ],
      };
      sort = { createdAt: 1 }; 
    } else {
      
      query = {
        $or: [
          { user: req.user._id },
          { recipient: req.user._id },
        ],
      };
    }

    const history = await Message.find(query).sort(sort);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('GetHistory error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};
