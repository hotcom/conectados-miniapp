import { ethers, Contract, JsonRpcProvider, Wallet } from 'ethers';
import config from '../config/env';

const CBLR_ABI = [
  'function mint(address to, uint256 amount) external',
  'function balanceOf(address account) external view returns (uint256)',
] as const;

if (!config.BASE_SEPOLIA_RPC || !config.ADMIN_PRIVATE_KEY || !config.CBLR_CONTRACT_ADDRESS) {
  throw new Error('Missing required environment variables');
}

const provider = new JsonRpcProvider(config.BASE_SEPOLIA_RPC);
const adminWallet = new Wallet(config.ADMIN_PRIVATE_KEY ?? '', provider);
const cblrContract = new Contract(config.CBLR_CONTRACT_ADDRESS ?? '', CBLR_ABI, adminWallet);

export async function mintCBRL(to: string, amount: bigint): Promise<void> {
  try {
    if (!ethers.isAddress(to)) {
      throw new Error('Invalid destination address');
    }

    const tx = await cblrContract.mint(to, amount);
    await tx.wait();
    console.log(`Minted ${ethers.formatEther(amount)} cBRL to ${to}`);
  } catch (error) {
    console.error('Error minting cBRL:', error);
    throw error;
  }
}

export async function getBalance(address: string): Promise<string> {
  try {
    if (!ethers.isAddress(address)) {
      throw new Error('Invalid address');
    }

    const balance = await cblrContract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
}
