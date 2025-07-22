import { ethers } from 'ethers'
import { CBRL_TOKEN_ADDRESS, ensureBaseSepoliaNetwork } from './campaign-factory'

// cBRL Contract ABI for minting (owner only)
const CBRL_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function owner() external view returns (address)",
  "function transfer(address to, uint256 amount) external returns (bool)"
]

/**
 * Mint cBRL tokens for testing purposes
 * Note: This only works if the connected wallet is the owner of the cBRL contract
 */
export async function mintCBRLTokens(
  recipientAddress: string,
  amountInBRL: number
): Promise<string> {
  try {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    await ensureBaseSepoliaNetwork(provider)
    
    const signer = provider.getSigner()
    const cBRLContract = new ethers.Contract(CBRL_TOKEN_ADDRESS, CBRL_ABI, signer)
    
    // Convert BRL to wei (18 decimals)
    const amountInWei = ethers.utils.parseEther(amountInBRL.toString())
    
    console.log('Minting cBRL tokens:', {
      recipient: recipientAddress,
      amount: amountInBRL,
      amountInWei: amountInWei.toString()
    })
    
    // Mint tokens
    const tx = await cBRLContract.mint(recipientAddress, amountInWei)
    console.log('Mint transaction sent:', tx.hash)
    
    // Wait for confirmation
    await tx.wait()
    console.log('Mint transaction confirmed:', tx.hash)
    
    return tx.hash
  } catch (error: any) {
    console.error('Error minting cBRL tokens:', error)
    throw new Error(`Failed to mint cBRL tokens: ${error.message}`)
  }
}

/**
 * Get cBRL balance for an address
 */
export async function getCBRLBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const cBRLContract = new ethers.Contract(CBRL_TOKEN_ADDRESS, CBRL_ABI, provider)
    
    const balance = await cBRLContract.balanceOf(address)
    return ethers.utils.formatEther(balance)
  } catch (error: any) {
    console.error('Error getting cBRL balance:', error)
    return '0'
  }
}

/**
 * Check if the connected wallet is the owner of the cBRL contract
 */
export async function isCBRLOwner(address: string): Promise<boolean> {
  try {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const cBRLContract = new ethers.Contract(CBRL_TOKEN_ADDRESS, CBRL_ABI, provider)
    
    const owner = await cBRLContract.owner()
    return owner.toLowerCase() === address.toLowerCase()
  } catch (error: any) {
    console.error('Error checking cBRL owner:', error)
    return false
  }
}
