import { ethers } from 'ethers'

// Contract addresses
export const CAMPAIGN_FACTORY_ADDRESS = '0x28e4aDa7E2760F07517D9237c0419F2f025f91Da'
export const CBRL_TOKEN_ADDRESS = '0x0f628966ea621e7283e9AB3C7935A626b9607718'

// Base Sepolia network config
export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org'
}

// CampaignFactory ABI (simplified)
export const CAMPAIGN_FACTORY_ABI = [
  "function createCampaign(string memory title, string memory description, uint256 goal, address beneficiary) external returns (uint256 campaignId, address campaignContract)",
  "function getCampaignContract(uint256 campaignId) external view returns (address)",
  "function getCampaignInfo(uint256 campaignId) external view returns (tuple(uint256 id, address contractAddress, string title, address creator, address beneficiary, uint256 goal, uint256 createdAt, bool active))",
  "function getCampaignDetails(uint256 campaignId) external view returns (tuple(uint256 id, address contractAddress, string title, address creator, address beneficiary, uint256 goal, uint256 createdAt, bool active) info, uint256 raised, uint256 balance, uint256 progressPercentage)",
  "function campaignCount() external view returns (uint256)",
  "function getCreatorCampaigns(address creator) external view returns (uint256[] memory)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed campaignContract, address indexed creator, address beneficiary, string title, uint256 goal, uint256 timestamp)"
]

// Individual Campaign ABI (simplified)
export const CAMPAIGN_ABI = [
  "function donate(uint256 amount) external",
  "function receivePIXDonation(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function withdrawAll() external",
  "function closeCampaign() external",
  "function getCampaignInfo() external view returns (string memory title, string memory description, uint256 goal, uint256 raised, address beneficiary, address creator, uint256 createdAt, bool active, uint256 balance)",
  "function getProgressPercentage() external view returns (uint256)",
  "function getBalance() external view returns (uint256)",
  "function title() external view returns (string memory)",
  "function description() external view returns (string memory)",
  "function goal() external view returns (uint256)",
  "function raised() external view returns (uint256)",
  "function beneficiary() external view returns (address)",
  "function creator() external view returns (address)",
  "function active() external view returns (bool)",
  "event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp)",
  "event GoalReached(uint256 timestamp)"
]

// Helper functions
export class CampaignFactory {
  private provider: ethers.providers.Web3Provider
  private contract: ethers.Contract
  private signer: ethers.Signer

  constructor(provider: ethers.providers.Web3Provider) {
    this.provider = provider
    this.signer = provider.getSigner()
    this.contract = new ethers.Contract(CAMPAIGN_FACTORY_ADDRESS, CAMPAIGN_FACTORY_ABI, this.signer)
  }

  /**
   * Create a new campaign on-chain
   */
  async createCampaign(
    title: string,
    description: string,
    goalInBRL: number,
    beneficiaryAddress: string
  ): Promise<{
    campaignId: number
    campaignContract: string
    transactionHash: string
  }> {
    try {
      // Convert BRL to wei (18 decimals)
      const goalInWei = ethers.utils.parseEther(goalInBRL.toString())
      
      console.log('Creating campaign on-chain:', {
        title,
        description,
        goalInBRL,
        goalInWei: goalInWei.toString(),
        beneficiaryAddress
      })

      // Call createCampaign function
      const tx = await this.contract.createCampaign(
        title,
        description,
        goalInWei,
        beneficiaryAddress
      )

      console.log('Transaction sent:', tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      console.log('Transaction confirmed:', receipt)

      // Find CampaignCreated event
      const event = receipt.events?.find((e: any) => e.event === 'CampaignCreated')
      
      if (!event) {
        throw new Error('CampaignCreated event not found')
      }

      const campaignId = event.args.campaignId.toNumber()
      const campaignContract = event.args.campaignContract

      console.log('Campaign created successfully:', {
        campaignId,
        campaignContract,
        transactionHash: tx.hash
      })

      return {
        campaignId,
        campaignContract,
        transactionHash: tx.hash
      }

    } catch (error: any) {
      console.error('Error creating campaign:', error)
      throw new Error(`Failed to create campaign: ${error.message}`)
    }
  }

  /**
   * Get total number of campaigns
   */
  async getCampaignCount(): Promise<number> {
    try {
      const count = await this.contract.campaignCount()
      return count.toNumber()
    } catch (error: any) {
      console.error('Error getting campaign count:', error)
      throw new Error(`Failed to get campaign count: ${error.message}`)
    }
  }

  /**
   * Get all campaigns from the blockchain
   */
  async getAllCampaigns(): Promise<any[]> {
    try {
      const count = await this.getCampaignCount()
      console.log('Total campaigns on blockchain:', count)
      
      const campaigns = []
      
      for (let i = 1; i <= count; i++) {
        try {
          const details = await this.contract.getCampaignDetails(i)
          const info = details.info
          
          const campaign = {
            id: `campaign_${i}`,
            campaignId: i,
            contractAddress: info.contractAddress,
            title: info.title,
            creator: info.creator,
            beneficiary: info.beneficiary,
            goal: parseFloat(ethers.utils.formatEther(info.goal)),
            raised: parseFloat(ethers.utils.formatEther(details.raised)),
            balance: parseFloat(ethers.utils.formatEther(details.balance)),
            progress: details.progressPercentage.toNumber(),
            createdAt: info.createdAt.toNumber() * 1000, // Convert to milliseconds
            active: info.active,
            organizationId: info.creator,
            description: `Campanha criada on-chain #${i}`,
            donors: 0, // Will be updated from contract if needed
            daysLeft: 30,
            status: info.active ? 'active' : 'inactive',
            walletAddress: info.beneficiary
          }
          
          campaigns.push(campaign)
          console.log(`Campaign ${i} loaded:`, campaign.title)
        } catch (error) {
          console.warn(`Failed to load campaign ${i}:`, error)
        }
      }
      
      console.log('All campaigns loaded:', campaigns.length)
      return campaigns
    } catch (error: any) {
      console.error('Error getting all campaigns:', error)
      throw new Error(`Failed to get all campaigns: ${error.message}`)
    }
  }

  /**
   * Get campaign information by ID
   */
  async getCampaignInfo(campaignId: number) {
    try {
      const info = await this.contract.getCampaignInfo(campaignId)
      return {
        id: info.id.toNumber(),
        contractAddress: info.contractAddress,
        title: info.title,
        creator: info.creator,
        beneficiary: info.beneficiary,
        goal: ethers.utils.formatEther(info.goal),
        createdAt: new Date(info.createdAt.toNumber() * 1000),
        active: info.active
      }
    } catch (error: any) {
      console.error('Error getting campaign info:', error)
      throw new Error(`Failed to get campaign info: ${error.message}`)
    }
  }

  /**
   * Get detailed campaign information including raised amount
   */
  async getCampaignDetails(campaignId: number) {
    try {
      const details = await this.contract.getCampaignDetails(campaignId)
      return {
        info: {
          id: details.info.id.toNumber(),
          contractAddress: details.info.contractAddress,
          title: details.info.title,
          creator: details.info.creator,
          beneficiary: details.info.beneficiary,
          goal: ethers.utils.formatEther(details.info.goal),
          createdAt: new Date(details.info.createdAt.toNumber() * 1000),
          active: details.info.active
        },
        raised: ethers.utils.formatEther(details.raised),
        balance: ethers.utils.formatEther(details.balance),
        progressPercentage: details.progressPercentage.toNumber() / 100 // Convert from basis points
      }
    } catch (error: any) {
      console.error('Error getting campaign details:', error)
      throw new Error(`Failed to get campaign details: ${error.message}`)
    }
  }

  /**
   * Get total number of campaigns
   */
  async getCampaignCount(): Promise<number> {
    try {
      const count = await this.contract.campaignCount()
      return count.toNumber()
    } catch (error: any) {
      console.error('Error getting campaign count:', error)
      throw new Error(`Failed to get campaign count: ${error.message}`)
    }
  }

  /**
   * Get campaigns created by a specific address
   */
  async getCreatorCampaigns(creatorAddress: string): Promise<number[]> {
    try {
      const campaignIds = await this.contract.getCreatorCampaigns(creatorAddress)
      return campaignIds.map((id: ethers.BigNumber) => id.toNumber())
    } catch (error: any) {
      console.error('Error getting creator campaigns:', error)
      throw new Error(`Failed to get creator campaigns: ${error.message}`)
    }
  }
}

/**
 * Helper function to interact with individual campaign contracts
 */
export class Campaign {
  private provider: ethers.providers.Web3Provider
  private contract: ethers.Contract
  private signer: ethers.Signer

  constructor(provider: ethers.providers.Web3Provider, campaignAddress: string) {
    this.provider = provider
    this.signer = provider.getSigner()
    this.contract = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.signer)
  }

  /**
   * Donate cBRL to this campaign
   */
  async donate(amountInBRL: number): Promise<string> {
    try {
      const amountInWei = ethers.utils.parseEther(amountInBRL.toString())
      
      // First, user needs to approve the campaign contract to spend their cBRL
      // This would be handled by a separate approval transaction
      
      const tx = await this.contract.donate(amountInWei)
      await tx.wait()
      
      return tx.hash
    } catch (error: any) {
      console.error('Error donating to campaign:', error)
      throw new Error(`Failed to donate: ${error.message}`)
    }
  }

  /**
   * Get campaign information
   */
  async getCampaignInfo() {
    try {
      console.log('🔍 Calling contract.getCampaignInfo() for address:', this.contract.address)
      const info = await this.contract.getCampaignInfo()
      console.log('📋 Raw contract response:', info)
      console.log('📋 Raw info array length:', info.length)
      console.log('📋 Raw donorCount (info[9]):', info[9])
      console.log('📋 Raw donorCount type:', typeof info[9])
      console.log('📋 Raw donorCount toString:', info[9]?.toString())
      
      const parsedData = {
        title: info[0],
        description: info[1],
        goal: ethers.utils.formatEther(info[2]),
        raised: ethers.utils.formatEther(info[3]),
        beneficiary: info[4],
        creator: info[5],
        createdAt: new Date(info[6].toNumber() * 1000),
        active: info[7],
        balance: ethers.utils.formatEther(info[8]),
        donorCount: info[9] ? info[9].toNumber() : 0
      }
      
      console.log('✅ Parsed campaign info:', parsedData)
      console.log('✅ Final donorCount:', parsedData.donorCount)
      
      return parsedData
    } catch (error: any) {
      console.error('❌ Error getting campaign info:', error)
      console.error('❌ Contract address:', this.contract.address)
      throw new Error(`Failed to get campaign info: ${error.message}`)
    }
  }

  /**
   * Get progress percentage
   */
  async getProgressPercentage(): Promise<number> {
    try {
      const percentage = await this.contract.getProgressPercentage()
      return percentage.toNumber() / 100 // Convert from basis points
    } catch (error: any) {
      console.error('Error getting progress percentage:', error)
      return 0
    }
  }
}

/**
 * Utility function to format BRL amounts
 */
export function formatBRL(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num)
}

/**
 * Utility function to check if user is on Base Sepolia
 */
export async function ensureBaseSepoliaNetwork(provider: ethers.providers.Web3Provider): Promise<boolean> {
  try {
    const network = await provider.getNetwork()
    
    if (network.chainId !== BASE_SEPOLIA_CONFIG.chainId) {
      // Request network switch
      await provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${BASE_SEPOLIA_CONFIG.chainId.toString(16)}` }
      ])
      return true
    }
    
    return true
  } catch (error: any) {
    console.error('Error switching to Base Sepolia:', error)
    throw new Error('Please switch to Base Sepolia network')
  }
}
