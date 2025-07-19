import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import { verifySignature } from '../utils/pixSignature';
import { mintCBRL } from '../services/blockchain';

const router = express.Router();

interface PixWebhookPayload {
  pixId: string;
  value: number;
  destinationWallet: string;
  status: 'COMPLETED' | 'FAILED';
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-signature'];
    if (typeof signature !== 'string') {
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Verify OpenPix signature
    if (!verifySignature(signature, req.body)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = req.body as PixWebhookPayload;
    
    // Validate payload
    if (!payload.pixId || !payload.value || !payload.destinationWallet || !payload.status) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Only process completed payments
    if (payload.status !== 'COMPLETED') {
      return res.status(200).json({ message: 'Payment not completed' });
    }

    // Convert PIX value to cBRL (1:1 ratio)
    const cBRLAmount = ethers.parseEther(payload.value.toString());
    
    // Mint cBRL tokens to the destination wallet
    await mintCBRL(payload.destinationWallet, cBRLAmount);

    res.status(200).json({ 
      message: 'Payment processed successfully',
      pixId: payload.pixId,
      amount: payload.value,
      destinationWallet: payload.destinationWallet
    });
  } catch (error) {
    console.error('Error processing PIX webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
