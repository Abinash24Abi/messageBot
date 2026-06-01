import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';


import { initSocket } from './sockets/socketService.js';
import { initQueueService } from './queue/queueService.js';


import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import aiRoutes from './routes/aiRoutes.js';


dotenv.config();

const app = express();
const server = http.createServer(app);


initSocket(server);


app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'Server is running smoothly!' });
});


app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/ai', aiRoutes);


app.use((err, req, res, next) => {
  console.error('[Error Middleware]', err.stack);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});


const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

console.log(' Connecting to MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB database.');

    
    await initQueueService();

  
    server.listen(PORT, () => {
      console.log(`The server is Running on port ${PORT}`);
      console.log(` Webhook  at http://localhost:${PORT}/api/webhook`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed!', err.message);
    process.exit(1);
  });
