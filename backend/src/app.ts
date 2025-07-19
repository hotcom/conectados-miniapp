import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ethers } from 'ethers';
import config from './config/env';
import pixWebhookRouter from './routes/pixWebhook';
import pixRouter from './routes/pix';
import framesRouter from './routes/frames';
import testRoutes from './routes/test';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Blockchain setup
if (!config.BASE_SEPOLIA_RPC || !config.ADMIN_PRIVATE_KEY) {
  throw new Error('Missing required environment variables');
}

const provider = new ethers.JsonRpcProvider(config.BASE_SEPOLIA_RPC);
const adminWallet = new ethers.Wallet(config.ADMIN_PRIVATE_KEY, provider);

// Routes
app.use('/api/webhook/pix', pixWebhookRouter);
app.use('/api/pix', pixRouter);
app.use('/api/frames', framesRouter);

// Test routes - only in development
if (process.env.NODE_ENV === 'development') {
  app.use('/test', testRoutes);
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
