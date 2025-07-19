import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Contract } from 'ethers';
import config from '../config/env';
import { createPixCharge, getPixCharge, createWebhook } from '../config/openpix';
import { ABI } from '../config/abi';

const router = express.Router();

// Store PIX payment info in memory (replace with database in production)
const pixPayments = new Map<string, {
  id: string;
  correlationID: string;
  amount: number;
  destinationWallet: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}>();

// Create webhook on startup
createWebhook().catch(error => {
  console.error('Error creating webhook:', error);
});

router.post('/generate', async (req, res) => {
  try {
    const { amount, destinationWallet } = req.body;

    if (!amount || !destinationWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique IDs
    const pixId = uuidv4();
    const correlationID = uuidv4();

    // Create PIX charge using OpenPix API
    // Convert amount from BRL to cents
    const amountInCents = Math.round(amount * 100);
    const charge = await createPixCharge(amountInCents, correlationID, destinationWallet);

    // Store payment info
    pixPayments.set(pixId, {
      id: pixId,
      correlationID,
      amount,
      destinationWallet,
      status: 'PENDING',
      createdAt: new Date(),
    });

    if (!charge) {
      throw new Error('Failed to create PIX charge');
    }

    res.json({
      pixId,
      qrCodeImage: charge.qrCodeImage,
      brCode: charge.brCode,
    });
  } catch (error) {
    console.error('Error generating PIX code:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const { correlationID, status } = req.body;

    // Find payment by correlationID
    const payment = Array.from(pixPayments.values()).find(
      (p) => p.correlationID === correlationID
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    if (status === 'COMPLETED' && payment.status !== 'COMPLETED') {
      payment.status = 'COMPLETED';
      // Mint tokens
      if (!config.CBLR_CONTRACT_ADDRESS) throw new Error('Contract address not configured');
      const contract = new Contract(config.CBLR_CONTRACT_ADDRESS, ABI, config.adminWallet);
      const amount = BigInt(Math.round(payment.amount * 1e18));
      const tx = await contract.mint(payment.destinationWallet, amount);
      await tx.wait();
      console.log(`Minted ${payment.amount} cBRL to ${payment.destinationWallet}`);
    } else if (status === 'EXPIRED') {
      payment.status = 'FAILED';
    }

    // Update payment in memory
    pixPayments.set(payment.id, payment);

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.get('/status/:pixId', async (req, res) => {
  try {
    const { pixId } = req.params;
    const payment = pixPayments.get(pixId);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Get latest status from OpenPix
    const charge = await getPixCharge(payment.correlationID);

    if (!charge) {
      throw new Error('Failed to get PIX charge status');
    }

    res.json({
      status: payment.status,
      amount: payment.amount,
      destinationWallet: payment.destinationWallet,
      qrCodeImage: charge.qrCodeImage,
      brCode: charge.brCode,
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
