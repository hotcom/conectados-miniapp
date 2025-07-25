/**
 * Local Storage Service for DoeAgora MVP
 * Handles persistence of profiles, campaigns, and posts
 */

export interface Organization {
  id: string
  name: string
  username: string
  description: string
  avatar?: string
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
  image?: string
  goal: number
  raised: number
  donors: number
  daysLeft: number
  walletAddress: string
  createdAt: number
  status: 'active' | 'completed' | 'paused'
  contractAddress?: string
  onChain?: {
    campaignId: number
    contractAddress: string
    transactionHash: string
  }
}

export interface Post {
  id: string
  organizationId: string
  campaignId?: string
  content: string
  image?: string
  createdAt: number
  likes: number
  shares: number
}

class StorageService {
  private readonly ORGANIZATIONS_KEY = 'conectados_organizations'
  private readonly CAMPAIGNS_KEY = 'conectados_campaigns'
  private readonly POSTS_KEY = 'conectados_posts'
  private readonly CURRENT_USER_KEY = 'conectados_current_user'

  // Organizations
  saveOrganization(organization: Organization): void {
    const organizations = this.getOrganizations()
    const existingIndex = organizations.findIndex(org => org.id === organization.id)
    
    if (existingIndex >= 0) {
      organizations[existingIndex] = organization
    } else {
      organizations.push(organization)
    }
    
    localStorage.setItem(this.ORGANIZATIONS_KEY, JSON.stringify(organizations))
  }

  getOrganizations(): Organization[] {
    const data = localStorage.getItem(this.ORGANIZATIONS_KEY)
    return data ? JSON.parse(data) : []
  }

  getOrganization(id: string): Organization | null {
    const organizations = this.getOrganizations()
    return organizations.find(org => org.id === id) || null
  }

  // Campaigns
  saveCampaign(campaign: Campaign): void {
    const campaigns = this.getCampaigns()
    const existingIndex = campaigns.findIndex(camp => camp.id === campaign.id)
    
    if (existingIndex >= 0) {
      campaigns[existingIndex] = campaign
    } else {
      campaigns.push(campaign)
    }
    
    localStorage.setItem(this.CAMPAIGNS_KEY, JSON.stringify(campaigns))
  }

  getCampaigns(): Campaign[] {
    const data = localStorage.getItem(this.CAMPAIGNS_KEY)
    return data ? JSON.parse(data) : []
  }

  getCampaign(id: string): Campaign | null {
    const campaigns = this.getCampaigns()
    return campaigns.find(camp => camp.id === id) || null
  }

  getCampaignsByOrganization(organizationId: string): Campaign[] {
    const campaigns = this.getCampaigns()
    return campaigns.filter(camp => camp.organizationId === organizationId)
  }

  // Posts
  savePost(post: Post): void {
    const posts = this.getPosts()
    const existingIndex = posts.findIndex(p => p.id === post.id)
    
    if (existingIndex >= 0) {
      posts[existingIndex] = post
    } else {
      posts.unshift(post) // Add to beginning for chronological order
    }
    
    localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts))
  }

  getPosts(): Post[] {
    const data = localStorage.getItem(this.POSTS_KEY)
    return data ? JSON.parse(data) : []
  }

  getPostsByOrganization(organizationId: string): Post[] {
    const posts = this.getPosts()
    return posts.filter(post => post.organizationId === organizationId)
  }

  // Current User Session
  setCurrentUser(organizationId: string): void {
    localStorage.setItem(this.CURRENT_USER_KEY, organizationId)
  }

  getCurrentUser(): string | null {
    return localStorage.getItem(this.CURRENT_USER_KEY)
  }

  getCurrentOrganization(): Organization | null {
    const currentUserId = this.getCurrentUser()
    return currentUserId ? this.getOrganization(currentUserId) : null
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  // Utility functions
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  clearAllData(): void {
    localStorage.removeItem(this.ORGANIZATIONS_KEY)
    localStorage.removeItem(this.CAMPAIGNS_KEY)
    localStorage.removeItem(this.POSTS_KEY)
    localStorage.removeItem(this.CURRENT_USER_KEY)
  }

  // Clear demo data specifically
  clearDemoData(): void {
    const orgs = this.getOrganizations().filter(org => !org.id.startsWith('demo-'))
    const campaigns = this.getCampaigns().filter(camp => !camp.id.startsWith('demo-'))
    const posts = this.getPosts().filter(post => !post.id.startsWith('demo-'))
    
    localStorage.setItem(this.ORGANIZATIONS_KEY, JSON.stringify(orgs))
    localStorage.setItem(this.CAMPAIGNS_KEY, JSON.stringify(campaigns))
    localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts))
  }

  // Demo data seeding (optional - only call manually for testing)
  seedDemoData(): void {
    const demoOrg: Organization = {
      id: 'demo-org-1',
      name: 'Instituto Criança Feliz',
      username: '@criancafeliz',
      description: 'Trabalhamos para garantir direitos básicos às crianças em situação de vulnerabilidade social.',
      avatar: '/placeholder.svg?height=128&width=128',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      website: 'www.criancafeliz.org.br',
      location: 'São Paulo, SP',
      foundedYear: 2015,
      verified: true,
      createdAt: Date.now() - 86400000 * 30 // 30 days ago
    }

    const demoCampaign: Campaign = {
      id: 'demo-campaign-1',
      organizationId: 'demo-org-1',
      title: 'Cestas Básicas para Famílias Vulneráveis',
      description: 'Ajude-nos a distribuir cestas básicas para 500 famílias em situação de vulnerabilidade social.',
      image: '/placeholder.svg?height=400&width=600',
      goal: 50000,
      raised: 32500,
      donors: 1247,
      daysLeft: 15,
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      createdAt: Date.now() - 86400000 * 7, // 7 days ago
      status: 'active'
    }

    const demoPost: Post = {
      id: 'demo-post-1',
      organizationId: 'demo-org-1',
      campaignId: 'demo-campaign-1',
      content: 'Estamos muito felizes com o progresso da nossa campanha! Já conseguimos ajudar mais de 300 famílias. 🙏❤️',
      image: '/placeholder.svg?height=300&width=500',
      createdAt: Date.now() - 86400000 * 2, // 2 days ago
      likes: 156,
      shares: 23
    }

    // Save demo data
    this.saveOrganization(demoOrg)
    this.saveCampaign(demoCampaign)
    this.savePost(demoPost)
  }
}

export const storage = new StorageService()
