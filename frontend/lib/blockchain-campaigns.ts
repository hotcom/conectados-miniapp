import { ethers } from 'ethers'
import { CAMPAIGN_FACTORY_ADDRESS, CAMPAIGN_FACTORY_ABI } from './campaign-factory'

/**
 * Load all campaigns directly from the blockchain
 * This solves the localStorage isolation issue between Chrome and Coinbase Super App
 */
export async function loadCampaignsFromBlockchain(): Promise<any[]> {
  try {
    console.log('🔄 Loading campaigns from blockchain...')
    
    // Check if wallet is connected
    if (!window.ethereum) {
      console.log('❌ No wallet detected')
      return []
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(CAMPAIGN_FACTORY_ADDRESS, CAMPAIGN_FACTORY_ABI, provider)
    
    // Get total number of campaigns
    const count = await contract.campaignCount()
    const totalCampaigns = count.toNumber()
    
    console.log(`📊 Total campaigns on blockchain: ${totalCampaigns}`)
    
    if (totalCampaigns === 0) {
      return []
    }
    
    const campaigns = []
    
    // Load each campaign
    for (let i = 1; i <= totalCampaigns; i++) {
      try {
        console.log(`🔍 Loading campaign ${i}...`)
        
        const details = await contract.getCampaignDetails(i)
        const info = details.info
        
        // Create campaign object compatible with existing UI
        const campaign = {
          id: `campaign_${i}`,
          campaignId: i,
          contractAddress: info.contractAddress,
          title: info.title,
          description: `Campanha on-chain #${i}: ${info.title}`,
          creator: info.creator,
          beneficiary: info.beneficiary,
          goal: parseFloat(ethers.utils.formatEther(info.goal)),
          raised: parseFloat(ethers.utils.formatEther(details.raised)),
          balance: parseFloat(ethers.utils.formatEther(details.balance)),
          progress: details.progressPercentage.toNumber(),
          createdAt: info.createdAt.toNumber() * 1000, // Convert to milliseconds
          active: info.active,
          organizationId: info.creator,
          donors: 0, // Will be loaded separately if needed
          daysLeft: 30,
          status: info.active ? 'active' : 'inactive',
          walletAddress: info.beneficiary,
          // Add image placeholder for campaigns without image
          image: undefined
        }
        
        campaigns.push(campaign)
        console.log(`✅ Campaign ${i} loaded: ${campaign.title}`)
        
      } catch (error) {
        console.warn(`⚠️ Failed to load campaign ${i}:`, error)
      }
    }
    
    console.log(`🎉 Successfully loaded ${campaigns.length} campaigns from blockchain`)
    return campaigns
    
  } catch (error: any) {
    console.error('❌ Error loading campaigns from blockchain:', error)
    return []
  }
}

/**
 * Create posts from blockchain campaigns for the feed
 */
export function createPostsFromCampaigns(campaigns: any[]): any[] {
  return campaigns.map(campaign => ({
    id: `post_${campaign.campaignId}`,
    organizationId: campaign.creator,
    campaignId: campaign.id,
    content: `🚀 ${campaign.title}\n\n${campaign.description}\n\n💰 Meta: R$ ${campaign.goal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n📊 Arrecadado: R$ ${campaign.raised.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${campaign.progress}%)\n🔗 Contrato: ${campaign.contractAddress}`,
    image: campaign.image,
    createdAt: campaign.createdAt,
    likes: 0,
    shares: 0,
    // Add campaign data for easy access
    campaign: campaign
  }))
}

/**
 * Check if user is connected to wallet
 */
export function isWalletConnected(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window.ethereum && (window.ethereum as any).selectedAddress)
}

/**
 * Load on-chain data for a specific campaign contract
 * @param contractAddress - Address of the individual campaign contract
 * @returns Promise<any> - On-chain campaign data
 */
export async function loadCampaignOnChainData(contractAddress: string): Promise<any> {
  try {
    console.log(`🔍 Loading on-chain data for contract: ${contractAddress}`)
    
    // Check if wallet is connected
    if (!window.ethereum) {
      console.log('❌ No wallet detected')
      return null
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    
    // Individual campaign contract ABI (simplified)
    const campaignABI = [
      'function getGoal() view returns (uint256)',
      'function getTotalRaised() view returns (uint256)',
      'function getDonorCount() view returns (uint256)',
      'function getTitle() view returns (string)',
      'function getDescription() view returns (string)',
      'function getBeneficiary() view returns (address)',
      'function getCreator() view returns (address)'
    ]
    
    const contract = new ethers.Contract(contractAddress, campaignABI, provider)
    
    // Get campaign data from contract
    const [goal, raised, donorCount, title, description, beneficiary, creator] = await Promise.all([
      contract.getGoal().catch(() => ethers.BigNumber.from(0)),
      contract.getTotalRaised().catch(() => ethers.BigNumber.from(0)),
      contract.getDonorCount().catch(() => ethers.BigNumber.from(0)),
      contract.getTitle().catch(() => 'Campanha On-Chain'),
      contract.getDescription().catch(() => 'Descrição não disponível'),
      contract.getBeneficiary().catch(() => '0x0000000000000000000000000000000000000000'),
      contract.getCreator().catch(() => '0x0000000000000000000000000000000000000000')
    ])
    
    const onChainData = {
      contractAddress,
      goal: parseFloat(ethers.utils.formatEther(goal)),
      raised: parseFloat(ethers.utils.formatEther(raised)),
      donors: donorCount.toNumber(),
      title,
      description,
      beneficiary,
      creator,
      progress: goal.gt(0) ? (raised.mul(100).div(goal)).toNumber() : 0
    }
    
    console.log(`✅ On-chain data loaded for ${contractAddress}:`, onChainData)
    return onChainData
    
  } catch (error) {
    console.error(`❌ Error loading on-chain data for ${contractAddress}:`, error)
    return null
  }
}
