"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Heart, MessageCircle, Target, Users } from "lucide-react"
import { type Organization, type Post, type Campaign, firebaseStorage } from "@/lib/firebase-storage"
import Link from "next/link"

interface ProfilePostsProps {
  organization: Organization
}

export function ProfilePosts({ organization }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load posts for this organization
        const organizationPosts = await firebaseStorage.getPostsByOrganization(organization.id)
        setPosts(organizationPosts)
        
        // Load campaigns for this organization
        const allCampaigns = await firebaseStorage.getCampaigns()
        const organizationCampaigns = allCampaigns.filter((campaign: Campaign) => 
          campaign.organizationId === organization.walletAddress
        )
        setCampaigns(organizationCampaigns)
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
                            <span className="font-medium">{formatCurrency(campaign.raised || 0)}</span>
                            <span className="text-gray-500">de {formatCurrency(campaign.goal)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>{campaign.donorCount || 0} doadores</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((campaign.raised || 0) / campaign.goal * 100, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {((campaign.raised || 0) / campaign.goal * 100).toFixed(1)}% da meta
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
