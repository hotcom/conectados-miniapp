"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/post-card"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, MessageCircle, RefreshCw, Database } from "lucide-react"
import { firebaseStorage, type Post, type Organization } from "@/lib/firebase-storage"
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
  const loadCampaigns = async () => {
    try {
      console.log('🔄 MODO DEBUG: Carregando campanha de teste...')
      setIsLoadingBlockchain(true)
      
      // TEMPORARY: Use mock data to test on-chain functionality
      const mockCampaigns = [{
        id: 'campaign_test_10',
        title: 'Campanha de Teste On-Chain',
        description: 'Testando conexão on-chain com CampaignFactory',
        goal: 1000,
        raised: 0,
        creator: '0x300Da20E86B20A7A53e199c9e3fb2fD57D55Ceec',
        contractAddress: '0xc78A1b20909841aDd79fF6d4296bE82d7d5C4349',
        campaignId: 10,
        onChain: {
          campaignId: 10,
          transactionHash: '0x0b7b0e32964ee6b6baa437c2d79cdc5702c2b76378d6ad831d65df017d8793e5'
        },
        createdAt: new Date().toISOString(),
        image: '/api/placeholder/400/300'
      }]
      
      console.log('🆘 MOCK: Usando dados de teste para campanha 10')
      setCampaigns(mockCampaigns)
      
      // Try to load Firebase data (but don't fail if it errors)
      try {
        console.log('🔄 Tentando carregar Firebase...')
        const firebaseCampaigns = await firebaseStorage.getCampaigns()
        console.log('📊 Firebase campaigns loaded:', firebaseCampaigns.length)
        
        if (firebaseCampaigns.length > 0) {
          setCampaigns([...mockCampaigns, ...firebaseCampaigns])
        }
      } catch (firebaseError) {
        console.warn('⚠️ Firebase falhou, usando apenas dados mock:', firebaseError)
      }
      
      // If wallet is connected, also load blockchain data
      if (walletHook.isConnected && walletHook.address) {
        console.log('🔗 Carteira conectada, carregando dados da blockchain...')
        const blockchainCampaigns = await loadCampaignsFromBlockchain()
        console.log('📊 Blockchain campaigns loaded:', blockchainCampaigns.length)
        
        // Merge mock, Firebase and blockchain data
        const allCampaigns = [...mockCampaigns, ...blockchainCampaigns]
        setCampaigns(allCampaigns)
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar campanhas:', error)
      // Fallback: use empty arrays if everything fails
      setCampaigns([])
      setPosts([])
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
        
        // Check for campaignId in different possible locations
        let campaignId = campaign.onChain?.campaignId || campaign.campaignId
        
        // Emergency fallback: if this is the specific campaign with known contract, use campaignId 10
        if (!campaignId && campaign.contractAddress === '0xc78A1b20909841aDd79fF6d4296bE82d7d5C4349') {
          campaignId = 10
          console.log('🆘 EMERGENCY: Using hardcoded campaignId 10 for known contract')
        }
        
        console.log('🔍 Debug campanha:', {
          id: campaign.id,
          contractAddress: campaign.contractAddress,
          onChain: campaign.onChain,
          campaignId: campaignId,
          hasContractAddress: !!campaign.contractAddress,
          hasCampaignId: !!campaignId,
          isEmergencyFallback: !campaign.onChain?.campaignId && !campaign.campaignId && campaignId === 10
        })
        
        if (campaign.contractAddress && campaignId) {
          try {
            // Use CampaignFactory to get the correct contract address
            const factoryContract = new ethers.Contract(
              '0x28e4aDa7E2760F07517D9237c0419F2f025f91Da', // CampaignFactory address
              [
                'function getCampaignContract(uint256 campaignId) view returns (address)',
                'function getCampaignInfo(uint256 campaignId) view returns (tuple(string title, string description, address creator, address beneficiary, uint256 goal, uint256 raised, bool isActive, uint256 deadline))'
              ],
              provider
            )
            
            // Get the actual campaign contract address from factory
            const actualContractAddress = await factoryContract.getCampaignContract(campaignId)
            console.log('📍 Endereço real do contrato:', actualContractAddress)
            
            // Get campaign info from factory
            const info = await factoryContract.getCampaignInfo(campaignId)
            
            const progress = info.goal > 0 ? (info.raised / info.goal) * 100 : 0
            
            console.log('📊 Dados da campanha', campaign.id, ':', { 
              goal: ethers.utils.formatEther(info.goal), 
              raised: ethers.utils.formatEther(info.raised), 
              progress,
              isActive: info.isActive
            })
            
            onChainInfo[campaign.id] = {
              goal: parseFloat(ethers.utils.formatEther(info.goal)),
              raised: parseFloat(ethers.utils.formatEther(info.raised)),
              progressPercentage: progress,
              contractAddress: actualContractAddress,
              donorCount: 0, // We'll implement this later
              isActive: info.isActive
            }
          } catch (error) {
            console.error(`❌ Erro ao carregar dados da campanha ${campaign.id}:`, error)
            console.log('🔍 Tentando método alternativo...')
            
            // Fallback: try to connect directly to the contract
            try {
              const campaignContract = new Campaign(provider, campaign.contractAddress)
              const info = await campaignContract.getCampaignInfo()
              const progress = await campaignContract.getProgressPercentage()
              
              onChainInfo[campaign.id] = {
                ...info,
                progressPercentage: progress,
                contractAddress: campaign.contractAddress,
                donorCount: info.donorCount || 0
              }
              console.log('✅ Método alternativo funcionou para:', campaign.id)
            } catch (fallbackError) {
              console.error(`❌ Método alternativo também falhou para ${campaign.id}:`, fallbackError)
            }
          }
        } else {
          console.log('⚠️ Campanha sem contrato ou campaignId:', campaign.id)
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
      
      // ALWAYS load Firebase data first (for immediate display)
      console.log('📱 Loading from Firebase...')
      const storedPosts = await firebaseStorage.getPosts()
      const storedCampaigns = await firebaseStorage.getCampaigns()
      const storedOrganizations = await firebaseStorage.getOrganizations()
      
      console.log('📊 Loaded from Firebase:', {
        posts: storedPosts.length,
        campaigns: storedCampaigns.length,
        organizations: storedOrganizations.length
      })
      
      setPosts(storedPosts)
      setCampaigns(storedCampaigns)
      setOrganizations(storedOrganizations)
      
      // THEN try to load and merge blockchain data if wallet is connected
      if (isWalletConnected()) {
        console.log('💰 Wallet detected, loading additional blockchain data...')
        await loadCampaigns()
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
      timestamp: new Date(typeof post.createdAt === 'number' ? post.createdAt : post.createdAt.toMillis()).toLocaleDateString('pt-BR'),
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
