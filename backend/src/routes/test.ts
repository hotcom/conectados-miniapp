import { Router } from 'express';
import { Contract } from 'ethers';
import { rateLimit } from 'express-rate-limit';
import config from '../config/env';

const router = Router();

// Rate limit: 5 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5
});

// ABI for mint function
const ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address) view returns (uint256)"
];

router.post('/mint', limiter, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    if (!config.ADMIN_PRIVATE_KEY || !config.BASE_SEPOLIA_RPC || !config.CBLR_CONTRACT_ADDRESS) {
      throw new Error('Missing required environment variables');
    }

    // Get contract instance
    const contract = new Contract(
      config.CBLR_CONTRACT_ADDRESS,
      ABI,
      config.adminWallet
    );

    console.log('Minting tokens to:', address);

    // Mint 100 cBRL (100 * 10^18)
    const amount = BigInt('100000000000000000000');
    const tx = await contract.mint(address, amount);
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    // Get new balance
    const balance = await contract.balanceOf(address);
    console.log('New balance:', balance.toString());

    res.json({
      success: true,
      transaction: tx.hash,
      balance: balance.toString()
    });
  } catch (error: any) {
    console.error('Mint error:', error);
    res.status(500).json({
      error: 'Failed to mint tokens',
      details: error.message
    });
  }
});

export default router;
