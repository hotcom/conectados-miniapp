"use client"

import { useEffect, useState } from 'react'
import { Heart, Target, Users, MessageCircle, Share2, MoreHorizontal, Wallet } from 'lucide-react'
import { firebaseStorage, type Campaign, type Post } from '@/lib/firebase-storage'
import { CAMPAIGN_ABI, BASE_SEPOLIA_CONFIG, CBRL_TOKEN_ADDRESS } from '@/lib/campaign-factory'
import { useWalletContext } from '@/contexts/wallet-context'
import { ethers } from 'ethers'
import SuperAppDonationModal from '@/components/superapp-donation-modal'

// Extended types for Instagram-style feed
interface FeedItem {
  id: string
  type: 'campaign' | 'post'
  organizationName: string
  walletAddress?: string
  organizationAvatar?: string
  content: string
  image?: string
  createdAt: Date
  // Campaign specific
  goal?: number
  raised?: number
  onChainRaised?: number
  contractAddress?: string
  // Post specific
  likes?: number
  shares?: number
}

export default function SuperAppPage() {
  const { isConnected, address } = useWalletContext()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [cBRLBalance, setCBRLBalance] = useState<string>('0')
  const [donationModal, setDonationModal] = useState<{
    isOpen: boolean
    campaign: any
  }>({ isOpen: false, campaign: null })
  const [environment, setEnvironment] = useState({
    isSuperApp: false,
    userAgent: '',
    url: ''
  })

  useEffect(() => {
    // Detect environment
    const userAgent = navigator.userAgent
    const url = window.location.href
    const isSuperApp = userAgent.includes('Coinbase') || userAgent.includes('SuperApp')
    
    setEnvironment({
      isSuperApp,
      userAgent,
      url
    })
    
    loadFeed()
    loadBalance()
  }, [address])

  const loadFeed = async () => {
    try {
      console.log('🔄 [SUPERAPP] Loading Instagram-style feed...')
      setLoading(true)
      
      // Load campaigns and posts from Firebase
      const [campaigns, posts, organizations] = await Promise.all([
        firebaseStorage.getCampaigns(),
        firebaseStorage.getPosts(),
        firebaseStorage.getOrganizations()
      ])
      
      console.log('📊 [SUPERAPP] Loaded data:', { campaigns: campaigns.length, posts: posts.length, orgs: organizations.length })
      
      // Create organization lookup
      const orgLookup = organizations.reduce((acc, org) => {
        acc[org.id] = org
        acc[org.walletAddress] = org
        return acc
      }, {} as Record<string, any>)
      
      // Convert campaigns to feed items with on-chain data
      const campaignItems: FeedItem[] = await Promise.all(
        campaigns.map(async (campaign) => {
          const org = orgLookup[campaign.organizationId] || { name: 'ONG Desconhecida', avatar: undefined }
          
          // Try to get on-chain data
          let onChainRaised: number | undefined
          if (campaign.contractAddress) {
            try {
              const rpcProvider = new ethers.providers.JsonRpcProvider(BASE_SEPOLIA_CONFIG.rpcUrl)
              const campaignContract = new ethers.Contract(campaign.contractAddress, CAMPAIGN_ABI, rpcProvider)
              const raisedWei = await campaignContract.raised()
              onChainRaised = parseFloat(ethers.utils.formatEther(raisedWei))
              console.log('✅ [SUPERAPP] On-chain data for', campaign.title, ':', onChainRaised, 'BRL')
            } catch (error) {
              console.log('⚠️ [SUPERAPP] Failed to load on-chain data for', campaign.title)
            }
          }
          
          return {
            id: campaign.id,
            type: 'campaign' as const,
            organizationName: org.name,
            walletAddress: campaign.organizationId, // This is the wallet address
            organizationAvatar: org.avatar,
            content: campaign.description,
            image: campaign.image,
            createdAt: typeof campaign.createdAt === 'number' ? new Date(campaign.createdAt) : campaign.createdAt.toDate(),
            goal: campaign.goal,
            raised: campaign.raised,
            onChainRaised,
            contractAddress: campaign.contractAddress
          }
        })
      )
      
      // Convert posts to feed items
      const postItems: FeedItem[] = posts
        .filter(post => !post.campaignId) // Only simple posts
        .map(post => {
          const org = orgLookup[post.organizationId] || { name: 'ONG Desconhecida', avatar: undefined }
          return {
            id: post.id,
            type: 'post' as const,
            organizationName: org.name,
            walletAddress: post.organizationId, // This is the wallet address
            organizationAvatar: org.avatar,
            content: post.content,
            image: post.image,
            createdAt: typeof post.createdAt === 'number' ? new Date(post.createdAt) : post.createdAt.toDate(),
            likes: post.likes,
            shares: post.shares
          }
        })
      
      // Combine and sort by date (newest first)
      const allItems = [...campaignItems, ...postItems].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )
      
      setFeedItems(allItems)
      console.log('✅ [SUPERAPP] Feed loaded with', allItems.length, 'items')
      
    } catch (error) {
      console.error('❌ [SUPERAPP] Error loading feed:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  const loadBalance = async () => {
    if (!isConnected || !address) {
      setCBRLBalance('0')
      return
    }
    
    try {
      const rpcProvider = new ethers.providers.JsonRpcProvider(BASE_SEPOLIA_CONFIG.rpcUrl)
      const tokenContract = new ethers.Contract(
        CBRL_TOKEN_ADDRESS,
        ['function balanceOf(address) view returns (uint256)'],
        rpcProvider
      )
      
      const balanceWei = await tokenContract.balanceOf(address)
      const balanceBRL = ethers.utils.formatEther(balanceWei)
      setCBRLBalance(parseFloat(balanceBRL).toFixed(2))
      console.log('✅ [SUPERAPP] cBRL Balance:', balanceBRL)
    } catch (error) {
      console.error('❌ [SUPERAPP] Error loading cBRL balance:', error)
      setCBRLBalance('0')
    }
  }
  
  const handleRefresh = () => {
    setRefreshing(true)
    loadFeed()
    loadBalance()
  }
  
  const handleOrgClick = (organizationName: string, walletAddress?: string) => {
    // Navigate to organization profile using wallet address
    if (walletAddress) {
      window.location.href = `/organization/${walletAddress}`
    } else {
      // Fallback to name-based navigation
      const username = organizationName.toLowerCase().replace(/\s+/g, '')
      window.location.href = `/organization/${username}`
    }
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }
  
  const handleDonate = (campaignId: string) => {
    // Navigate to donation page
    window.location.href = `/donate/${campaignId}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Instagram-style Header with Logo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/doeagora-logo.svg" 
                alt="DoeAgora" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Wallet Info and Actions */}
            <div className="flex items-center gap-3">
              {/* Wallet Address and Balance */}
              {isConnected && address && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 min-w-fit">
                  <Wallet className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span className="text-xs font-mono text-gray-700 whitespace-nowrap">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <span className="text-xs font-semibold text-purple-600 whitespace-nowrap">{cBRLBalance} cBRL</span>
                </div>
              )}
              
              {/* SuperApp Badge */}
              {environment.isSuperApp && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">SuperApp</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <SuperAppDonationModal
        isOpen={donationModal.isOpen}
        onClose={() => setDonationModal({ isOpen: false, campaign: null })}
        campaign={donationModal.campaign || {}}
      />

      {/* Instagram-style Feed */}
      <div className="max-w-md mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-600">Carregando feed...</span>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum conteúdo ainda</h3>
            <p className="text-gray-600">As campanhas e posts aparecerão aqui!</p>
          </div>
        ) : (
          <div className="space-y-0">
            {feedItems.map((item) => (
              <div key={item.id} className="bg-white border-b border-gray-200">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {item.organizationName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <button 
                        onClick={() => handleOrgClick(item.organizationName, item.walletAddress)}
                        className="font-semibold text-sm text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {item.organizationName}
                      </button>
                      <p className="text-xs text-gray-500">
                        {item.createdAt.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                {/* Campaign/Post Description */}
                <div className="px-4 pb-3">
                  <div className="text-sm text-gray-900">
                    <span className="font-semibold">{item.organizationName}</span>{' '}
                    {item.content}
                  </div>
                </div>
                
                {/* Post Image */}
                {item.image && (
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src={item.image} 
                      alt="Post content" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/400/400'
                      }}
                    />
                  </div>
                )}
                
                {/* Post Actions */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm">{item.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {item.type === 'campaign' && (
                      <div className="px-4 pb-4">
                        <button 
                          onClick={() => setDonationModal({ 
                            isOpen: true, 
                            campaign: {
                              id: item.id,
                              title: item.content,
                              organizationName: item.organizationName,
                              contractAddress: (item as any).contractAddress,
                              goal: item.goal,
                              raised: item.raised
                            }
                          })}
                          className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          💝 Doar Agora
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Campaign Progress */}
                  {item.type === 'campaign' && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-600">
                          <span className="font-bold text-purple-600">
                            {item.onChainRaised !== undefined 
                              ? formatCurrency(item.onChainRaised)
                              : formatCurrency(item.raised || 0)
                            }
                          </span>
                          <span className="text-gray-500"> arrecadado de </span>
                          <span className="font-bold text-gray-700">
                            {formatCurrency(item.goal || 0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(
                              ((item.onChainRaised !== undefined ? item.onChainRaised : (item.raised || 0)) / (item.goal || 1) * 100), 
                              100
                            )}%` 
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {(
                            (item.onChainRaised !== undefined ? item.onChainRaised : (item.raised || 0)) / (item.goal || 1) * 100
                          ).toFixed(1)}% da meta
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-purple-600" />
                          <span className="text-xs text-gray-600">0 doadores</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
