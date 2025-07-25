"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/post-card"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, MessageCircle, RefreshCw, Database } from "lucide-react"
import { storage, type Post, type Organization } from "@/lib/storage"
import { useWalletContext } from "@/contexts/wallet-context"
import { Campaign } from "@/lib/campaign-factory"
import { loadCampaignsFromBlockchain, createPostsFromCampaigns, isWalletConnected } from "@/lib/blockchain-campaigns"
import { ethers } from "ethers"

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [onChainData, setOnChainData] = useState<{[key: string]: any}>({})
  const [isLoadingOnChain, setIsLoadingOnChain] = useState(false)
  const [isLoadingBlockchain, setIsLoadingBlockchain] = useState(false)
  const walletHook = useWalletContext()
  const isConnected = walletHook.isConnected

  // Load campaigns from blockchain (solves localStorage isolation)
  const loadBlockchainCampaigns = async () => {
    console.log('🔄 Loading campaigns from blockchain...')
    setIsLoadingBlockchain(true)
    
    try {
      const blockchainCampaigns = await loadCampaignsFromBlockchain()
      console.log('✅ Loaded campaigns from blockchain:', blockchainCampaigns.length)
      
      setCampaigns(blockchainCampaigns)
      
      // Create posts from blockchain campaigns
      const blockchainPosts = createPostsFromCampaigns(blockchainCampaigns)
      
      // Also load localStorage posts (for backward compatibility)
      const localPosts = storage.getPosts()
      
      // Combine and deduplicate posts
      const allPosts = [...blockchainPosts, ...localPosts]
      const uniquePosts = allPosts.filter((post, index, self) => 
        index === self.findIndex(p => p.id === post.id)
      )
      
      setPosts(uniquePosts)
      console.log('📊 Total posts loaded:', uniquePosts.length)
      
    } catch (error) {
      console.error('❌ Error loading blockchain campaigns:', error)
      // Fallback to localStorage only
      const localPosts = storage.getPosts()
      const localCampaigns = storage.getCampaigns()
      setPosts(localPosts)
      setCampaigns(localCampaigns)
    } finally {
      setIsLoadingBlockchain(false)
    }
  }

  // Load on-chain data for campaigns
  const loadOnChainData = async () => {
    console.log('🔄 Carregando dados on-chain...', { isConnected, campaignsCount: campaigns.length })
    
    if (!isConnected) {
      console.log('❌ Carteira não conectada')
      return
    }
    
    if (campaigns.length === 0) {
      console.log('❌ Nenhuma campanha encontrada')
      return
    }
    
    setIsLoadingOnChain(true)
    const onChainInfo: {[key: string]: any} = {}
    
    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      console.log('✅ Provider criado')
      
      for (const campaign of campaigns) {
        console.log('🔍 Processando campanha:', campaign.id, 'Contrato:', campaign.contractAddress)
        
        if (campaign.contractAddress) {
          try {
            const campaignContract = new Campaign(provider, campaign.contractAddress)
            const info = await campaignContract.getCampaignInfo()
            const progress = await campaignContract.getProgressPercentage()
            
            console.log('📊 Dados da campanha', campaign.id, ':', { 
              goal: info.goal, 
              raised: info.raised, 
              progress,
              donorCount: info.donorCount
            })
            
            onChainInfo[campaign.id] = {
              ...info,
              progressPercentage: progress,
              contractAddress: campaign.contractAddress,
              donorCount: info.donorCount || 0
            }
          } catch (error) {
            console.error(`❌ Erro ao carregar dados da campanha ${campaign.id}:`, error)
          }
        } else {
          console.log('⚠️ Campanha sem contrato:', campaign.id)
        }
      }
      
      console.log('✅ Dados on-chain carregados:', onChainInfo)
      setOnChainData(onChainInfo)
    } catch (error) {
      console.error('❌ Erro geral ao carregar dados on-chain:', error)
    } finally {
      setIsLoadingOnChain(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Loading feed data...')
      
      // Try to load campaigns from blockchain first
      if (isWalletConnected()) {
        console.log('💰 Wallet detected, loading from blockchain...')
        await loadBlockchainCampaigns()
      } else {
        console.log('📱 No wallet, loading from localStorage...')
        // Fallback to localStorage when no wallet
        const storedPosts = storage.getPosts()
        const storedCampaigns = storage.getCampaigns()
        const storedOrganizations = storage.getOrganizations()
        
        console.log('📊 Loaded from storage:', {
          posts: storedPosts.length,
          campaigns: storedCampaigns.length,
          organizations: storedOrganizations.length
        })
        
        setPosts(storedPosts)
        setCampaigns(storedCampaigns)
        setOrganizations(storedOrganizations)
      }
    }
    
    loadData()
  }, [isConnected]) // Reload when wallet connection changes

  // Load on-chain data when campaigns are loaded and wallet is connected
  useEffect(() => {
    if (campaigns.length > 0 && isConnected) {
      loadOnChainData()
    }
  }, [campaigns, isConnected])
  
  // Auto-refresh on-chain data every 30 seconds
  useEffect(() => {
    if (!isConnected || campaigns.length === 0) return
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-atualizando dados on-chain...')
      loadOnChainData()
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [isConnected, campaigns.length])
  
  // Listen for donation completion events
  useEffect(() => {
    const handleDonationCompleted = (event: CustomEvent) => {
      console.log('🎉 Doação completada detectada no feed:', event.detail)
      // Reload on-chain data after donation
      if (isConnected && campaigns.length > 0) {
        setTimeout(() => {
          loadOnChainData()
        }, 1000) // Small delay to ensure blockchain is updated
      }
    }
    
    window.addEventListener('donationCompleted', handleDonationCompleted as EventListener)
    
    return () => {
      window.removeEventListener('donationCompleted', handleDonationCompleted as EventListener)
    }
  }, [isConnected, campaigns.length])

  // Transform posts to match PostCard expected format
  const transformedPosts = posts.map(post => {
    // Find organization by wallet address (since organizationId is the wallet address)
    const org = organizations.find(o => o.walletAddress.toLowerCase() === post.organizationId.toLowerCase())
    if (!org) {
      console.log('Organization not found for post:', post.organizationId, 'Available orgs:', organizations.map(o => o.walletAddress))
      return null
    }

    // Find campaign data if this post is related to a campaign
    const campaign = post.campaignId ? campaigns.find(c => c.id === post.campaignId) : null
    const onChainCampaign = campaign ? onChainData[campaign.id] : null

    return {
      id: post.id,
      organization: {
        name: org.name,
        username: org.username,
        avatar: org.avatar || "/placeholder.svg?height=40&width=40",
        verified: org.verified,
      },
      content: post.content,
      image: post.image,
      likes: post.likes,
      comments: 0, // We don't have comments system yet
      shares: post.shares,
      timestamp: new Date(post.createdAt).toLocaleDateString('pt-BR'),
      goal: onChainCampaign?.goal || campaign?.goal || 0,
      raised: onChainCampaign?.raised || campaign?.raised || 0,
      progressPercentage: onChainCampaign?.progressPercentage || 0,
      contractAddress: onChainCampaign?.contractAddress || campaign?.contractAddress,
      walletAddress: org.walletAddress,
      isWalletConnected: isConnected,
      donorCount: onChainCampaign?.donorCount || 0,
    }
  }).filter((post): post is NonNullable<typeof post> => post !== null)

  if (isLoadingBlockchain) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <Database className="mx-auto mb-4 h-12 w-12 text-blue-500 animate-pulse" />
          <p className="text-lg font-semibold mb-2">Carregando campanhas da blockchain...</p>
          <p className="text-muted-foreground">
            Buscando campanhas diretamente dos contratos inteligentes
          </p>
        </CardContent>
      </Card>
    )
  }

  if (transformedPosts.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Bem-vindo ao DoeAgora!</h3>
            <p className="text-gray-600 mb-4">
              Este é o feed de causas sociais. Quando ONGs criarem perfis e postarem sobre suas causas, elas aparecerão aqui.
            </p>
            {!isConnected && (
              <p className="text-sm text-gray-500">
                Conecte sua carteira para criar um perfil de organização e começar a compartilhar suas causas.
              </p>
            )}
          </CardContent>
        </Card>
        
        {isConnected && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold">Pronto para começar?</h4>
                  <p className="text-sm text-gray-600">
                    Crie o perfil da sua organização e comece a compartilhar suas causas!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status indicator - apenas quando carregando */}
      {isConnected && isLoadingOnChain && (
        <div className="flex justify-center items-center bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Atualizando dados on-chain...</span>
          </div>
        </div>
      )}
      
      {transformedPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
