/**
 * Firebase Storage Service for DoeAgora MVP
 * Handles persistence of profiles, campaigns, and posts in Firestore
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Interfaces (same as before but with Firebase timestamps)
export interface Organization {
  id: string
  name: string
  username: string
  description: string
  avatar?: string // IPFS URL
  walletAddress: string
  website?: string
  location?: string
  foundedYear?: number
  verified: boolean
  createdAt: Timestamp | number
}

export interface Campaign {
  id: string
  organizationId: string
  title: string
  description: string
  image?: string // IPFS URL
  goal: number
  raised: number
  donors: number
  daysLeft: number
  walletAddress: string
  createdAt: Timestamp | number
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
  image?: string // IPFS URL
  createdAt: Timestamp | number
  likes: number
  shares: number
}

class FirebaseStorageService {
  // Collections
  private readonly ORGANIZATIONS_COLLECTION = 'organizations'
  private readonly CAMPAIGNS_COLLECTION = 'campaigns'
  private readonly POSTS_COLLECTION = 'posts'
  private readonly USERS_COLLECTION = 'users' // For current user session

  // Organizations
  async saveOrganization(organization: Organization): Promise<void> {
    try {
      const orgData = {
        ...organization,
        createdAt: organization.createdAt || serverTimestamp()
      }
      
      await setDoc(doc(db, this.ORGANIZATIONS_COLLECTION, organization.id), orgData)
      console.log('✅ Organization saved to Firebase:', organization.id)
    } catch (error) {
      console.error('❌ Error saving organization:', error)
      throw error
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.ORGANIZATIONS_COLLECTION), orderBy('createdAt', 'desc'))
      )
      
      const organizations: Organization[] = []
      querySnapshot.forEach((doc) => {
        organizations.push({ id: doc.id, ...doc.data() } as Organization)
      })
      
      console.log('✅ Organizations loaded from Firebase:', organizations.length)
      return organizations
    } catch (error) {
      console.error('❌ Error loading organizations:', error)
      return []
    }
  }

  async getOrganization(id: string): Promise<Organization | null> {
    try {
      const docRef = doc(db, this.ORGANIZATIONS_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Organization
      }
      
      return null
    } catch (error) {
      console.error('❌ Error loading organization:', error)
      return null
    }
  }

  // Campaigns
  async saveCampaign(campaign: Campaign): Promise<void> {
    try {
      const campaignData = {
        ...campaign,
        createdAt: campaign.createdAt || serverTimestamp()
      }
      
      await setDoc(doc(db, this.CAMPAIGNS_COLLECTION, campaign.id), campaignData)
      console.log('✅ Campaign saved to Firebase:', campaign.id)
    } catch (error) {
      console.error('❌ Error saving campaign:', error)
      throw error
    }
  }

  async getCampaigns(): Promise<Campaign[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.CAMPAIGNS_COLLECTION), orderBy('createdAt', 'desc'))
      )
      
      const campaigns: Campaign[] = []
      querySnapshot.forEach((doc) => {
        campaigns.push({ id: doc.id, ...doc.data() } as Campaign)
      })
      
      console.log('✅ Campaigns loaded from Firebase:', campaigns.length)
      return campaigns
    } catch (error) {
      console.error('❌ Error loading campaigns:', error)
      return []
    }
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    try {
      const docRef = doc(db, this.CAMPAIGNS_COLLECTION, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Campaign
      }
      
      return null
    } catch (error) {
      console.error('❌ Error loading campaign:', error)
      return null
    }
  }

  async getCampaignsByOrganization(organizationId: string): Promise<Campaign[]> {
    try {
      const q = query(
        collection(db, this.CAMPAIGNS_COLLECTION),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const campaigns: Campaign[] = []
      
      querySnapshot.forEach((doc) => {
        campaigns.push({ id: doc.id, ...doc.data() } as Campaign)
      })
      
      return campaigns
    } catch (error) {
      console.error('❌ Error loading campaigns by organization:', error)
      return []
    }
  }

  // Posts
  async savePost(post: Post): Promise<void> {
    try {
      const postData = {
        ...post,
        createdAt: post.createdAt || serverTimestamp()
      }
      
      await setDoc(doc(db, this.POSTS_COLLECTION, post.id), postData)
      console.log('✅ Post saved to Firebase:', post.id)
    } catch (error) {
      console.error('❌ Error saving post:', error)
      throw error
    }
  }

  async getPosts(): Promise<Post[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.POSTS_COLLECTION), orderBy('createdAt', 'desc'))
      )
      
      const posts: Post[] = []
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post)
      })
      
      console.log('✅ Posts loaded from Firebase:', posts.length)
      return posts
    } catch (error) {
      console.error('❌ Error loading posts:', error)
      return []
    }
  }

  async getPostsByOrganization(organizationId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.POSTS_COLLECTION),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const posts: Post[] = []
      
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() } as Post)
      })
      
      return posts
    } catch (error) {
      console.error('❌ Error loading posts by organization:', error)
      return []
    }
  }

  // Current User Session (stored in localStorage for session management)
  setCurrentUser(organizationId: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('doeagora_current_user', organizationId)
      console.log('✅ Current user set:', organizationId)
    }
  }

  getCurrentUser(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('doeagora_current_user')
    }
    return null
  }

  async getCurrentOrganization(): Promise<Organization | null> {
    const currentUserId = this.getCurrentUser()
    if (!currentUserId) return null
    
    return await this.getOrganization(currentUserId)
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('doeagora_current_user')
      console.log('✅ User logged out')
    }
  }

  // Utility functions
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    console.warn('🚨 This will clear ALL data from Firebase!')
    // Implementation would require admin SDK or batch operations
    // For MVP, we'll skip this dangerous operation
  }

  // Demo data seeding
  async seedDemoData(): Promise<void> {
    console.log('🌱 Seeding demo data to Firebase...')
    
    const demoOrg: Organization = {
      id: 'demo-org-1',
      name: 'ONG Esperança',
      username: 'ongesperanca',
      description: 'Trabalhamos para levar esperança e oportunidades para comunidades carentes.',
      avatar: undefined, // Will be set via IPFS later
      walletAddress: '0x1234567890123456789012345678901234567890',
      website: 'https://ongesperanca.org',
      location: 'São Paulo, SP',
      foundedYear: 2015,
      verified: true,
      createdAt: Date.now()
    }

    await this.saveOrganization(demoOrg)
    console.log('✅ Demo data seeded successfully!')
  }
}

export const firebaseStorage = new FirebaseStorageService()
