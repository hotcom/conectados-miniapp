"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Heart, Users, MessageCircle, Target, ExternalLink } from "lucide-react"
import { firebaseStorage, type Post, type Campaign, type Organization } from "@/lib/firebase-storage"
import { useWalletContext } from "@/contexts/wallet-context"
import { Campaign as CampaignContract } from "@/lib/campaign-factory"
import { ethers } from "ethers"
import Link from "next/link"
import Image from "next/image"

interface FeedItem {
  type: 'campaign' | 'post'
  data: Campaign | Post
  organization: Organization
  onChainData?: any
}

export function FeedRedesigned() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const { isConnected, address } = useWalletContext()

  useEffect(() => {
    loadFeedData()
  }, [isConnected])

  const loadFeedData = async () => {
    try {
      setLoading(true)
      
      // Load campaigns and posts separately
      const [campaigns, posts, organizations] = await Promise.all([
        firebaseStorage.getCampaigns(),
        firebaseStorage.getPosts(),
        firebaseStorage.getOrganizations()
      ])

      // Create feed items array
      const items: FeedItem[] = []

      // Add campaigns to feed
      for (const campaign of campaigns) {
        const org = organizations.find(o => o.walletAddress === campaign.organizationId)
        if (org) {
          let onChainData = null
          
          // Load on-chain data if available
          if (campaign.contractAddress && isConnected) {
            try {
              onChainData = await loadOnChainData(campaign.contractAddress)
            } catch (error) {
              console.error('Error loading on-chain data:', error)
            }
          }

          items.push({
            type: 'campaign',
            data: campaign,
            organization: org,
            onChainData
          })
        }
      }

      // Add posts to feed (only simple posts, not campaign-related)
      for (const post of posts) {
        if (!post.campaignId) { // Only show posts that are NOT campaign announcements
          const org = organizations.find(o => o.walletAddress === post.organizationId)
          if (org) {
            items.push({
              type: 'post',
              data: post,
              organization: org
            })
          }
        }
      }

      // Sort by creation date (newest first)
      items.sort((a, b) => {
        const aTime = typeof a.data.createdAt === 'number' ? a.data.createdAt : (a.data.createdAt?.toMillis?.() || 0)
        const bTime = typeof b.data.createdAt === 'number' ? b.data.createdAt : (b.data.createdAt?.toMillis?.() || 0)
        return bTime - aTime
      })

      setFeedItems(items)
    } catch (error) {
      console.error('Error loading feed data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOnChainData = async (contractAddress: string) => {
    try {
      console.log('🔗 Loading on-chain data for contract:', contractAddress)
      
      // Try with connected wallet first
      if ((window as any).ethereum && isConnected) {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum)
        const campaign = new CampaignContract(provider, contractAddress)
        const info = await campaign.getCampaignInfo()
        console.log('📊 On-chain data loaded:', info)
        return info
      }
      
      // Fallback to public RPC if wallet not connected
      const publicProvider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org')
      const campaign = new CampaignContract(publicProvider as any, contractAddress)
      const info = await campaign.getCampaignInfo()
      console.log('📊 On-chain data loaded (public RPC):', info)
      return info
    } catch (error) {
      console.error('❌ Error loading on-chain data:', error)
      return null
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (timestamp: number | any) => {
    const time = typeof timestamp === 'number' ? timestamp : (timestamp?.toMillis?.() || Date.now())
    return new Date(time).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {feedItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo ainda</h3>
            <p className="text-gray-600">
              Quando organizações criarem campanhas ou posts, eles aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        feedItems.map((item, index) => (
          <Card key={`${item.type}-${item.data.id}-${index}`} className="hover:shadow-lg transition-shadow">
            {item.type === 'campaign' ? (
              <CampaignCard 
                campaign={item.data as Campaign} 
                organization={item.organization}
                onChainData={item.onChainData}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ) : (
              <PostCard 
                post={item.data as Post} 
                organization={item.organization}
                formatDate={formatDate}
              />
            )}
          </Card>
        ))
      )}
    </div>
  )
}

// Campaign Card Component
function CampaignCard({ 
  campaign, 
  organization, 
  onChainData, 
  formatCurrency, 
  formatDate 
}: {
  campaign: Campaign
  organization: Organization
  onChainData?: any
  formatCurrency: (value: number) => string
  formatDate: (timestamp: number) => string
}) {
  const raised = onChainData?.raised || campaign.raised || 0
  const donorCount = onChainData?.donorCount || campaign.donors || 0
  const progressPercentage = (raised / campaign.goal) * 100

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-600">@{organization.username}</span>
              <span className="text-sm text-gray-500">• {formatDate(campaign.createdAt || Date.now())}</span>
            </div>
            <p className="text-sm text-gray-600">Campanha</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-bold mb-2">{campaign.title}</h3>
          <p className="text-gray-700 text-sm">{campaign.description}</p>
        </div>

        {campaign.image && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4">
          {/* Check if wallet is connected AND we have contract address */}
          {campaign.contractAddress && onChainData ? (
            // Show actual progress when wallet connected and we have contract data
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Meta de arrecadação</span>
                <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(progressPercentage, 100)} className="mb-2" />
              <div className="flex justify-between text-sm">
                <span className="text-blue-600 font-semibold">{formatCurrency(raised)}</span>
                <span className="text-gray-600">de {formatCurrency(campaign.goal)}</span>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {donorCount} {donorCount === 1 ? 'doador único' : 'doadores únicos'}
                  </span>
                </div>
                
                <a
                  href={`https://base-sepolia.blockscout.com/address/${campaign.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Ver contrato
                </a>
              </div>
            </>
          ) : (
            // Show different messages based on wallet connection and contract state
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Meta de arrecadação</span>
                <span className="text-sm text-gray-600">--%</span>
              </div>
              <Progress value={0} className="mb-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Conecte sua carteira</span>
                <span className="text-gray-600">para ver progresso</span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    {!campaign.contractAddress 
                      ? 'Campanha ainda não possui contrato na blockchain'
                      : 'Conecte sua carteira para ver dados em tempo real'
                    }
                  </p>
                  {campaign.contractAddress && (
                    <a
                      href={`https://base-sepolia.blockscout.com/address/${campaign.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver contrato
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Link href={`/donate/${campaign.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Doar Agora
            </Button>
          </Link>
        </div>
      </CardContent>
    </>
  )
}

// Post Card Component
function PostCard({ 
  post, 
  organization, 
  formatDate 
}: {
  post: Post
  organization: Organization
  formatDate: (timestamp: number) => string
}) {
  const [likes, setLikes] = useState(post.likes || 0)

  return (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-green-600">@{organization.username}</span>
              <span className="text-sm text-gray-500">• {formatDate(post.createdAt || Date.now())}</span>
            </div>
            <p className="text-sm text-gray-600">Post</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm whitespace-pre-line">
          {post.content}
        </div>

        {post.image && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLikes(likes + 1)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600"
          >
            <Heart className="w-4 h-4" />
            <span>{likes}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.shares || 0}</span>
          </Button>
        </div>
      </CardContent>
    </>
  )
}
