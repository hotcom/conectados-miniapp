import dotenv from 'dotenv';
import { JsonRpcProvider, Wallet } from 'ethers';

dotenv.config();

interface Config {
  PORT: number;
  APP_URL: string;
  OPENPIX_API_KEY?: string;
  ADMIN_PRIVATE_KEY?: string;
  BASE_SEPOLIA_RPC: string;
  CBLR_CONTRACT_ADDRESS?: string;
  NODE_ENV: string;
  provider: JsonRpcProvider;
  adminWallet: Wallet;
}

const provider = new JsonRpcProvider(process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org');
const adminWallet = new Wallet(process.env.ADMIN_PRIVATE_KEY || '', provider);

const config: Config = {
  PORT: Number(process.env.PORT) || 3001,
  APP_URL: process.env.APP_URL || 'http://localhost:3001',
  OPENPIX_API_KEY: process.env.OPENPIX_API_KEY,
  ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY,
  BASE_SEPOLIA_RPC: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
  CBLR_CONTRACT_ADDRESS: process.env.CBLR_CONTRACT_ADDRESS,
  NODE_ENV: process.env.NODE_ENV || 'development',
  provider,
  adminWallet,
};

export default config;
