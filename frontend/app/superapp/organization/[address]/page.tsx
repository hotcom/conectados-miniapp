"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Target, Users, MessageCircle, Share2, MoreHorizontal, Wallet } from 'lucide-react'
import { firebaseStorage, type Campaign, type Post, type Organization } from '@/lib/firebase-storage'
import { CAMPAIGN_ABI, BASE_SEPOLIA_CONFIG } from '@/lib/campaign-factory'
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

export default function SuperAppOrganizationPage() {
  const { isConnected, address } = useWalletContext()
  const params = useParams()
  const router = useRouter()
  const organizationAddress = params.address as string

  const [organization, setOrganization] = useState<Organization | null>(null)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [donationModal, setDonationModal] = useState<{
    isOpen: boolean
    campaign: any
  }>({ isOpen: false, campaign: null })

  useEffect(() => {
    if (organizationAddress) {
      loadOrganizationProfile()
    }
  }, [organizationAddress])

  const loadOrganizationProfile = async () => {
    try {
      setLoading(true)
      console.log('🔄 [SUPERAPP] Loading organization profile:', organizationAddress)

      // Load organization data
      const org = await firebaseStorage.getOrganization(organizationAddress)
      if (!org) {
        console.error('❌ [SUPERAPP] Organization not found:', organizationAddress)
        return
      }
      setOrganization(org)

      // Load campaigns and posts for this organization
      const [campaigns, posts] = await Promise.all([
        firebaseStorage.getCampaigns(),
        firebaseStorage.getPosts()
      ])

      // Filter by organization
      const orgCampaigns = campaigns.filter(c => c.organizationId === organizationAddress)
      const orgPosts = posts.filter(p => p.organizationId === organizationAddress && !p.campaignId)

      // Convert campaigns to feed items with on-chain data
      const campaignItems: FeedItem[] = await Promise.all(
        orgCampaigns.map(async (campaign) => {
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
            walletAddress: campaign.organizationId,
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
      const postItems: FeedItem[] = orgPosts.map(post => ({
        id: post.id,
        type: 'post' as const,
        organizationName: org.name,
        walletAddress: post.organizationId,
        organizationAvatar: org.avatar,
        content: post.content,
        image: post.image,
        createdAt: typeof post.createdAt === 'number' ? new Date(post.createdAt) : post.createdAt.toDate(),
        likes: post.likes,
        shares: post.shares
      }))

      // Combine and sort by date (newest first)
      const allItems = [...campaignItems, ...postItems].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )

      setFeedItems(allItems)
      console.log('✅ [SUPERAPP] Organization profile loaded with', allItems.length, 'items')

    } catch (error) {
      console.error('❌ [SUPERAPP] Error loading organization profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Organização não encontrada</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{organization.name}</h1>
          </div>
        </div>
      </div>

      {/* Organization Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {organization.avatar ? (
                <img
                  src={organization.avatar}
                  alt={organization.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {organization.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{organization.name}</h2>
              <p className="text-sm text-gray-600 font-mono">
                {organizationAddress.slice(0, 6)}...{organizationAddress.slice(-4)}
              </p>
            </div>
          </div>

          {organization.description && (
            <p className="text-gray-700 text-sm mb-4">{organization.description}</p>
          )}

          {/* Stats */}
          <div className="flex justify-around py-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {feedItems.filter(item => item.type === 'campaign').length}
              </div>
              <div className="text-xs text-gray-500">Campanhas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {feedItems.filter(item => item.type === 'post').length}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">0</div>
              <div className="text-xs text-gray-500">Doadores</div>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram-style Feed */}
      <div className="max-w-md mx-auto">
        {feedItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma campanha ou post encontrado</p>
          </div>
        ) : (
          feedItems.map((item) => (
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
                    <p className="font-semibold text-sm text-gray-900">{item.organizationName}</p>
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
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Actions */}
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

                {/* Donation Button for Campaigns */}
                {item.type === 'campaign' && (
                  <div className="px-3 pb-4">
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
                      className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-center py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      💝 Doar Agora
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Donation Modal */}
      <SuperAppDonationModal
        isOpen={donationModal.isOpen}
        onClose={() => setDonationModal({ isOpen: false, campaign: null })}
        onDonationSuccess={() => {
          // Auto-refresh profile after successful donation
          console.log('🔄 [SUPERAPP] Auto-refreshing profile after donation...')
          loadOrganizationProfile()
        }}
        campaign={donationModal.campaign || {}}
      />
    </div>
  )
}
