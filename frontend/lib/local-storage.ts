// Local storage solution for DoeAgora MVP (no Firebase dependency)
export interface Organization {
  id: string
  name: string
  username: string
  description: string
  avatar: string
  walletAddress: string
  website?: string
  location?: string
  foundedYear?: number
  verified: boolean
  createdAt: number
}

export interface Campaign {
  id: string
  organizationId: string
  title: string
  description: string
  image: string
  goal: number
  raised: number
  donors: number
  daysLeft: number
  walletAddress: string
  contractAddress?: string
  status: 'active' | 'paused' | 'completed'
  createdAt: number
  onChain?: {
    campaignId: number
    contractAddress: string
    transactionHash: string
  }
}

export interface Post {
  id: string
  organizationId: string
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  timestamp: string
  goal: number
  raised: number
  progressPercentage?: number
  contractAddress?: string
  walletAddress: string
  isWalletConnected?: boolean
  donorCount?: number
}

// Mock data for demo
const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Instituto Criança Feliz',
    username: 'criancafeliz',
    description: 'Organização dedicada ao bem-estar e educação de crianças em situação de vulnerabilidade social.',
    avatar: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=150&h=150&fit=crop&crop=face',
    walletAddress: '0x742d35Cc6634C0532925a3b8D0B4E8A3E3E3E3E3',
    website: 'https://criancafeliz.org',
    location: 'São Paulo, SP',
    foundedYear: 2010,
    verified: true,
    createdAt: Date.now() - 86400000
  },
  {
    id: 'org-2',
    name: 'Ação Solidária',
    username: 'acaosolidaria',
    description: 'Promovendo ações de solidariedade e apoio às comunidades carentes.',
    avatar: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=150&h=150&fit=crop&crop=face',
    walletAddress: '0x123d35Cc6634C0532925a3b8D0B4E8A3E3E3E3E4',
    website: 'https://acaosolidaria.org',
    location: 'Rio de Janeiro, RJ',
    foundedYear: 2015,
    verified: true,
    createdAt: Date.now() - 172800000
  }
]

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    organizationId: 'org-1',
    title: 'Alimentação para 100 Famílias',
    description: 'Campanha para fornecer cestas básicas para famílias em situação de vulnerabilidade durante o período de chuvas.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop',
    goal: 5000,
    raised: 1250,
    donors: 25,
    daysLeft: 30,
    walletAddress: '0x742d35Cc6634C0532925a3b8D0B4E8A3E3E3E3E3',
    contractAddress: '0x28e4aDa7E2760F07517D9237c0419F2f025f91Da',
    status: 'active',
    createdAt: Date.now() - 3600000,
    onChain: {
      campaignId: 10,
      contractAddress: '0x28e4aDa7E2760F07517D9237c0419F2f025f91Da',
      transactionHash: '0x123...abc'
    }
  },
  {
    id: 'camp-2',
    organizationId: 'org-2',
    title: 'Educação Digital para Jovens',
    description: 'Projeto para levar educação digital e tecnologia para jovens de comunidades carentes.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
    goal: 8000,
    raised: 3200,
    donors: 45,
    daysLeft: 45,
    walletAddress: '0x123d35Cc6634C0532925a3b8D0B4E8A3E3E3E3E4',
    contractAddress: '0x38e4aDa7E2760F07517D9237c0419F2f025f91Db',
    status: 'active',
    createdAt: Date.now() - 7200000,
    onChain: {
      campaignId: 11,
      contractAddress: '0x38e4aDa7E2760F07517D9237c0419F2f025f91Db',
      transactionHash: '0x456...def'
    }
  }
]

const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    organizationId: 'org-1',
    content: 'Estamos muito felizes com o progresso da nossa campanha! Já conseguimos ajudar 25 famílias. 🙏',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop',
    likes: 42,
    comments: 8,
    shares: 12,
    timestamp: '2h',
    goal: 5000,
    raised: 1250,
    progressPercentage: 25,
    contractAddress: '0x28e4aDa7E2760F07517D9237c0419F2f025f91Da',
    walletAddress: '0x742d35Cc6634C0532925a3b8D0B4E8A3E3E3E3E3',
    isWalletConnected: true,
    donorCount: 25
  }
]

// Local storage service
class LocalStorageService {
  private getKey(type: string): string {
    return `doeagora_${type}`
  }

  private isSupported(): boolean {
    try {
      if (typeof window === 'undefined') return false
      const test = 'test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    if (!this.isSupported()) return MOCK_ORGANIZATIONS
    
    try {
      const stored = localStorage.getItem(this.getKey('organizations'))
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.length > 0 ? parsed : MOCK_ORGANIZATIONS
      }
      // Initialize with mock data
      localStorage.setItem(this.getKey('organizations'), JSON.stringify(MOCK_ORGANIZATIONS))
      return MOCK_ORGANIZATIONS
    } catch {
      return MOCK_ORGANIZATIONS
    }
  }

  async saveOrganization(organization: Organization): Promise<void> {
    if (!this.isSupported()) {
      console.log('✅ Organization saved (mock):', organization.name)
      return
    }

    try {
      const organizations = await this.getOrganizations()
      const existingIndex = organizations.findIndex(o => o.id === organization.id)
      
      if (existingIndex >= 0) {
        organizations[existingIndex] = organization
      } else {
        organizations.push(organization)
      }
      
      localStorage.setItem(this.getKey('organizations'), JSON.stringify(organizations))
      console.log('✅ Organization saved to localStorage:', organization.name)
    } catch (error) {
      console.error('❌ Failed to save organization:', error)
    }
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    if (!this.isSupported()) return MOCK_CAMPAIGNS
    
    try {
      const stored = localStorage.getItem(this.getKey('campaigns'))
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.length > 0 ? parsed : MOCK_CAMPAIGNS
      }
      // Initialize with mock data
      localStorage.setItem(this.getKey('campaigns'), JSON.stringify(MOCK_CAMPAIGNS))
      return MOCK_CAMPAIGNS
    } catch {
      return MOCK_CAMPAIGNS
    }
  }

  async saveCampaign(campaign: Campaign): Promise<void> {
    if (!this.isSupported()) {
      console.log('✅ Campaign saved (mock):', campaign.title)
      return
    }

    try {
      const campaigns = await this.getCampaigns()
      const existingIndex = campaigns.findIndex(c => c.id === campaign.id)
      
      if (existingIndex >= 0) {
        campaigns[existingIndex] = campaign
      } else {
        campaigns.push(campaign)
      }
      
      localStorage.setItem(this.getKey('campaigns'), JSON.stringify(campaigns))
      console.log('✅ Campaign saved to localStorage:', campaign.title)
    } catch (error) {
      console.error('❌ Failed to save campaign:', error)
    }
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    if (!this.isSupported()) return MOCK_POSTS
    
    try {
      const stored = localStorage.getItem(this.getKey('posts'))
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.length > 0 ? parsed : MOCK_POSTS
      }
      // Initialize with mock data
      localStorage.setItem(this.getKey('posts'), JSON.stringify(MOCK_POSTS))
      return MOCK_POSTS
    } catch {
      return MOCK_POSTS
    }
  }

  async savePost(post: Post): Promise<void> {
    if (!this.isSupported()) {
      console.log('✅ Post saved (mock):', post.content.substring(0, 50))
      return
    }

    try {
      const posts = await this.getPosts()
      posts.unshift(post) // Add to beginning
      localStorage.setItem(this.getKey('posts'), JSON.stringify(posts))
      console.log('✅ Post saved to localStorage')
    } catch (error) {
      console.error('❌ Failed to save post:', error)
    }
  }

  // Current user
  async getCurrentUser(): Promise<string | null> {
    if (!this.isSupported()) return null
    
    try {
      return localStorage.getItem(this.getKey('currentUser'))
    } catch {
      return null
    }
  }

  async setCurrentUser(organizationId: string): Promise<void> {
    if (!this.isSupported()) return
    
    try {
      localStorage.setItem(this.getKey('currentUser'), organizationId)
      console.log('✅ Current user set:', organizationId)
    } catch (error) {
      console.error('❌ Failed to set current user:', error)
    }
  }

  // Utility
  generateId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const localStorageService = new LocalStorageService()
console.log('✅ Local storage service initialized (no Firebase dependency)')
