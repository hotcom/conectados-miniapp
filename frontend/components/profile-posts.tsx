"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Heart, MessageCircle, Target, Users } from "lucide-react"
import { type Organization, type Post, type Campaign, firebaseStorage } from "@/lib/firebase-storage"
import { CAMPAIGN_ABI, BASE_SEPOLIA_CONFIG } from "@/lib/campaign-factory"
import { ethers } from "ethers"
import Link from "next/link"

interface ProfilePostsProps {
  organization: Organization
}

// Extended campaign type with on-chain data
interface CampaignWithOnChain extends Campaign {
  onChainRaised?: number
  onChainDonorCount?: number
}

export function ProfilePosts({ organization }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [campaigns, setCampaigns] = useState<CampaignWithOnChain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load posts for this organization (try both organizationId and walletAddress)
        const allPosts = await firebaseStorage.getPosts()
        const organizationPosts = allPosts.filter((post: Post) => {
          // Filter posts that belong to this organization
          const belongsToOrg = post.organizationId === organization.walletAddress || 
                              post.organizationId === organization.id
          // Only show simple posts (not campaign-related)
          return belongsToOrg && !post.campaignId
        })
        setPosts(organizationPosts)
        console.log('📝 [PROFILE POSTS] Loaded posts for org:', organization.walletAddress, organizationPosts.length)
        
        // Load campaigns for this organization
        const allCampaigns = await firebaseStorage.getCampaigns()
        const organizationCampaigns = allCampaigns.filter((campaign: Campaign) => 
          campaign.organizationId === organization.walletAddress || 
          campaign.organizationId === organization.id
        )
        
        // Enrich campaigns with on-chain data
        const campaignsWithOnChain: CampaignWithOnChain[] = await Promise.all(
          organizationCampaigns.map(async (campaign) => {
            if (campaign.contractAddress) {
              try {
                console.log('🔍 [PROFILE CAMPAIGN] Loading on-chain data for:', campaign.contractAddress)
                // Create RPC provider for read-only operations
                const rpcProvider = new ethers.providers.JsonRpcProvider(BASE_SEPOLIA_CONFIG.rpcUrl)
                const campaignContract = new ethers.Contract(campaign.contractAddress, CAMPAIGN_ABI, rpcProvider)
                
                // Call the raised() function to get current raised amount
                const raisedWei = await campaignContract.raised()
                const raisedBRL = parseFloat(ethers.utils.formatEther(raisedWei))
                
                console.log('✅ [PROFILE CAMPAIGN] On-chain raised:', raisedBRL, 'BRL')
                
                return {
                  ...campaign,
                  onChainRaised: raisedBRL,
                  onChainDonorCount: 0 // Always 0 as per user request
                }
              } catch (error) {
                console.error('❌ [PROFILE CAMPAIGN] Error loading on-chain data:', error)
                return {
                  ...campaign,
                  onChainRaised: undefined,
                  onChainDonorCount: 0
                }
              }
            }
            return {
              ...campaign,
              onChainRaised: undefined,
              onChainDonorCount: 0
            }
          })
        )
        
        setCampaigns(campaignsWithOnChain)
        console.log('🎯 [PROFILE CAMPAIGNS] Loaded campaigns for org:', organization.walletAddress, campaignsWithOnChain.length)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [organization.id, organization.walletAddress])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleCreateCampaign = () => {
    // Redirect to create page for new campaign
    window.location.href = '/create'
  }

  const handleCreatePost = () => {
    // Redirect to create-post page for new post
    window.location.href = '/create-post'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Perfil da Organização</h2>
        <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Criar Campanha
        </Button>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">Campanhas ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="space-y-4">
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Target className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma campanha ainda</h3>
                <p className="text-gray-600 mb-4">
                  Crie sua primeira campanha para começar a arrecadar fundos!
                </p>
                <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{campaign.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">
                              {campaign.onChainRaised !== undefined 
                                ? formatCurrency(campaign.onChainRaised) 
                                : formatCurrency(campaign.raised || 0)}
                            </span>
                            <span className="text-gray-500">de {formatCurrency(campaign.goal)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>{campaign.onChainDonorCount || 0} doadores</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min(
                                  ((campaign.onChainRaised !== undefined ? campaign.onChainRaised : (campaign.raised || 0)) / campaign.goal * 100), 
                                  100
                                )}%` 
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {(
                              (campaign.onChainRaised !== undefined ? campaign.onChainRaised : (campaign.raised || 0)) / campaign.goal * 100
                            ).toFixed(1)}% da meta
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Link href={`/donate/${campaign.id}`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Ver Campanha
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    {campaign.contractAddress && (
                      <div className="text-xs text-gray-500 border-t pt-3">
                        <span className="font-medium">Contrato:</span> {campaign.contractAddress.slice(0, 10)}...{campaign.contractAddress.slice(-8)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="posts" className="space-y-4">

          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <MessageCircle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum post ainda</h3>
                <p className="text-gray-600 mb-4">
                  Comece a compartilhar suas causas e impacto social!
                </p>
                <Button onClick={handleCreatePost} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Post
                </Button>
              </CardContent>
            </Card>
          ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-gray-700">{post.content}</p>
                  
                  {post.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt="Post image"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.shares}</span>
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(typeof post.createdAt === 'number' ? post.createdAt : post.createdAt.toMillis()).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
