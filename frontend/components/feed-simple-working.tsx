"use client"

import { useState, useEffect } from "react"
import { CampaignCard } from "@/components/campaign-card"
import { PostCard } from "@/components/post-card"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, MessageCircle, RefreshCw } from "lucide-react"
import { localStorageService, type Campaign, type Post, type Organization } from "@/lib/local-storage"
import { useWalletContext } from "@/contexts/wallet-context"

export function Feed() {
  const { isConnected } = useWalletContext()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load all data from local storage
  const loadData = async () => {
    setIsLoading(true)
    try {
      console.log('📊 Loading data from local storage...')
      
      const [campaignsData, postsData, orgsData] = await Promise.all([
        localStorageService.getCampaigns(),
        localStorageService.getPosts(),
        localStorageService.getOrganizations()
      ])
      
      setCampaigns(campaignsData)
      setPosts(postsData)
      setOrganizations(orgsData)
      
      console.log(`✅ Data loaded: ${campaignsData.length} campaigns, ${postsData.length} posts, ${orgsData.length} orgs`)
      
    } catch (error) {
      console.error('❌ Failed to load data:', error)
      setCampaigns([])
      setPosts([])
      setOrganizations([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
            <p className="text-gray-600">Carregando campanhas...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{campaigns.length}</p>
            <p className="text-sm text-gray-600">Campanhas Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{organizations.length}</p>
            <p className="text-sm text-gray-600">Organizações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{posts.length}</p>
            <p className="text-sm text-gray-600">Posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns */}
      {campaigns.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Campanhas Ativas</h2>
          {campaigns.map((campaign) => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign}
              organization={organizations.find(o => o.id === campaign.organizationId)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-gray-600">
              {isConnected 
                ? "Conecte-se à rede Base Sepolia para ver campanhas on-chain"
                : "Conecte sua carteira para ver todas as campanhas disponíveis"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Atualizações</h2>
          {posts.map((post) => {
            const organization = organizations.find(o => o.id === post.organizationId)
            return (
              <PostCard 
                key={post.id} 
                post={post}
                organization={organization}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
