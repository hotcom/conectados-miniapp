"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QrCode, Copy, CheckCircle, Heart, Users, Target, Wallet, Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { Campaign, CampaignFactory, ensureBaseSepoliaNetwork, formatBRL, CBRL_TOKEN_ADDRESS } from "@/lib/campaign-factory"
import { ethers } from "ethers"

interface DonationPageProps {
  postId: string
}

export function DonationPage({ postId }: DonationPageProps) {
  const [donationAmount, setDonationAmount] = useState("")
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeData, setQrCodeData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [donationStatus, setDonationStatus] = useState<string>("")
  const [campaignData, setCampaignData] = useState<any>(null)
  const [onChainData, setOnChainData] = useState<any>(null)
  const [cBRLBalance, setCBRLBalance] = useState<string>("0")
  
  const { isConnected, address, connect } = useWalletContext()

  // Load campaign data from Firebase and on-chain
  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        // Load from Firebase
        const { firebaseStorage } = await import('@/lib/firebase-storage')
        const campaigns = await firebaseStorage.getCampaigns()
        const posts = await firebaseStorage.getPosts()
        const organizations = await firebaseStorage.getOrganizations()
        
        console.log('🔍 DoeAgora: Searching for campaign with postId:', postId)
        console.log('📋 Available campaigns:', campaigns.map(c => ({ id: c.id, title: c.title })))
        console.log('📝 Available posts:', posts.map(p => ({ id: p.id, campaignId: p.campaignId })))
        
        // The postId comes from the URL /donate/[postId]
        // First, find the post by its ID
        let post = posts.find(p => p.id === postId)
        let campaign: any = null
        
        if (post && post.campaignId) {
          // If we found the post, find the campaign by campaignId
          campaign = campaigns.find(c => c.id === post.campaignId)
        }
        
        // If still not found, try direct campaign search as fallback
        if (!campaign) {
          campaign = campaigns.find(c => c.id === postId)
          if (campaign) {
            // If we found campaign directly, try to find associated post
            post = posts.find(p => p.campaignId === campaign.id)
          }
        }
        
        const org = organizations.find(o => o.walletAddress === campaign?.organizationId)
        
        console.log('✅ Found campaign:', campaign)
        console.log('✅ Found post:', post)
        console.log('✅ Found org:', org)
        
        if (campaign && org) {
          setCampaignData({ campaign, post, org })
          
          // Load on-chain data if available
          if ((campaign as any).onChain && isConnected) {
            await loadOnChainData((campaign as any).onChain.contractAddress)
          }
        }
      } catch (error) {
        console.error('Error loading campaign data:', error)
      }
    }
    
    loadCampaignData()
  }, [postId, isConnected])
  
  const loadOnChainData = async (contractAddress: string) => {
    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const campaign = new Campaign(provider, contractAddress)
      
      const info = await campaign.getCampaignInfo()
      const progress = await campaign.getProgressPercentage()
      
      setOnChainData({
        ...info,
        progressPercentage: progress,
        contractAddress
      })
      
      // Load user's cBRL balance
      if (address) {
        await loadCBRLBalance()
      }
    } catch (error) {
      console.error('Error loading on-chain data:', error)
    }
  }
  
  const loadCBRLBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const cBRLContract = new ethers.Contract(
        CBRL_TOKEN_ADDRESS,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      )
      
      const balance = await cBRLContract.balanceOf(address)
      setCBRLBalance(ethers.utils.formatEther(balance))
    } catch (error) {
      console.error('Error loading cBRL balance:', error)
    }
  }
  
  // Use real data or fallback to mock
  const campaign = campaignData ? {
    id: postId,
    title: campaignData.campaign.title,
    organization: {
      name: campaignData.org.name,
      username: campaignData.org.username,
      avatar: campaignData.org.avatar || "/placeholder.svg?height=60&width=60",
      verified: campaignData.org.verified || false,
    },
    description: campaignData.campaign.description,
    image: campaignData.campaign.image || "/placeholder.svg?height=400&width=600",
    goal: onChainData ? parseFloat(onChainData.goal) : campaignData.campaign.goal,
    raised: onChainData ? parseFloat(onChainData.raised) : campaignData.campaign.raised,
    donors: campaignData.campaign.donors || 0,
    daysLeft: campaignData.campaign.daysLeft || 30,
    walletAddress: campaignData.org.walletAddress,
    contractAddress: (campaignData.campaign as any).onChain?.contractAddress,
  } : {
    id: postId,
    title: "🔍 Carregando campanha...",
    organization: {
      name: "Carregando...",
      username: "@loading",
      avatar: "/placeholder.svg?height=60&width=60",
      verified: false,
    },
    description: "Buscando informações da campanha...",
    image: "/placeholder.svg?height=400&width=600",
    goal: 1000,
    raised: 0,
    donors: 0,
    daysLeft: 30,
    walletAddress: "",
    contractAddress: undefined,
  }

  const progressPercentage = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const generateQRCode = async () => {
    try {
      // Simulate QR code generation for now
      const pixCode = `00020126580014BR.GOV.BCB.PIX0136${campaign.walletAddress}520400005303986540${donationAmount}5802BR5925${campaign.organization.name}6009SAO PAULO62070503***6304`
      setQrCodeData(pixCode)
      setShowQRCode(true)
    } catch (error) {
      console.error('Error generating PIX QR Code:', error)
      alert('Erro ao gerar QR Code PIX. Tente novamente.')
    }
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(qrCodeData)
    // You could add a toast notification here
  }

  const donateCBRL = async () => {
    if (!isConnected) {
      alert('Por favor, conecte sua carteira primeiro!')
      return
    }
    
    if (!campaign.contractAddress) {
      alert('Esta campanha não possui contrato on-chain. Use a doação via PIX.')
      return
    }
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Por favor, insira um valor válido para doação.')
      return
    }
    
    const amount = parseFloat(donationAmount)
    const userBalance = parseFloat(cBRLBalance)
    
    if (amount > userBalance) {
      alert(`Saldo insuficiente. Você possui ${formatBRL(userBalance)} cBRL.`)
      return
    }
    
    setIsLoading(true)
    setDonationStatus('Preparando doação...')
    
    try {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum)
      await ensureBaseSepoliaNetwork(provider)
      
      setDonationStatus('Aprovando tokens cBRL...')
      
      // First, approve the campaign contract to spend cBRL
      const cBRLContract = new ethers.Contract(
        CBRL_TOKEN_ADDRESS,
        [
          'function approve(address spender, uint256 amount) returns (bool)',
          'function allowance(address owner, address spender) view returns (uint256)'
        ],
        provider.getSigner()
      )
      
      const amountInWei = ethers.utils.parseEther(amount.toString())
      
      // Check current allowance
      const currentAllowance = await cBRLContract.allowance(address, campaign.contractAddress)
      
      if (currentAllowance.lt(amountInWei)) {
        const approveTx = await cBRLContract.approve(campaign.contractAddress, amountInWei)
        setDonationStatus('Aguardando confirmação de aprovação...')
        await approveTx.wait()
      }
      
      setDonationStatus('Realizando doação...')
      
      // Now donate to the campaign
      const campaignContract = new Campaign(provider, campaign.contractAddress)
      const donationTx = await campaignContract.donate(amount)
      
      setDonationStatus('Aguardando confirmação da doação...')
      
      setDonationStatus('Aguardando confirmação na blockchain...')
      
      // Wait for transaction confirmation
      const receipt = await provider.waitForTransaction(donationTx)
      
      if (receipt.status === 1) {
        setDonationStatus('Atualizando dados...')
        
        // Wait a bit for blockchain to update
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Reload all data without refreshing page
        await loadOnChainData(campaign.contractAddress)
        await loadCBRLBalance()
        
        // Show success message
        alert(`🎉 DOAÇÃO REALIZADA COM SUCESSO!\n\n💰 Valor: ${formatBRL(amount)} cBRL\n🔗 Transação: ${donationTx}\n\n✅ Sua doação foi confirmada na blockchain!\n📊 O progresso da campanha foi atualizado.\n\n🔗 Ver no BaseScan:\nhttps://sepolia.basescan.org/tx/${donationTx}\n\n💡 Volte ao feed para ver o progresso atualizado!`)
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('donationCompleted', {
          detail: { campaignId: campaign.id, amount, transactionHash: donationTx }
        }))
        
      } else {
        throw new Error('Transação falhou na blockchain')
      }
      
      // Reset form
      setDonationAmount('')
      
    } catch (error: any) {
      console.error('Error donating cBRL:', error)
      
      let errorMessage = 'Erro ao realizar doação. Tente novamente.'
      
      if (error.message.includes('user rejected')) {
        errorMessage = 'Transação cancelada pelo usuário.'
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Saldo insuficiente para pagar o gas da transação.'
      } else if (error.message.includes('ERC20: insufficient allowance')) {
        errorMessage = 'Erro na aprovação de tokens. Tente novamente.'
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
      setDonationStatus('')
    }
  }

  const predefinedAmounts = [10, 25, 50, 100, 250, 500]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-0">
              <Image
                src={campaign.image || "/placeholder.svg"}
                alt={campaign.title}
                width={600}
                height={400}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={campaign.organization.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{campaign.organization.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{campaign.organization.name}</h3>
                      {campaign.organization.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-500">{campaign.organization.username}</p>
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-4">{campaign.title}</h1>
                <p className="text-gray-700 mb-6">{campaign.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="font-bold text-lg text-blue-600">{formatCurrency(campaign.raised)}</div>
                    <div className="text-sm text-gray-600">arrecadados</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="font-bold text-lg text-blue-600">{campaign.donors}</div>
                    <div className="text-sm text-gray-600">doadores</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="font-bold text-lg text-red-600">{campaign.daysLeft}</div>
                    <div className="text-sm text-gray-600">dias restantes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Fazer Doação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso da campanha</span>
                  <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="mb-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600 font-semibold">{formatCurrency(campaign.raised)}</span>
                  <span className="text-gray-600">de {formatCurrency(campaign.goal)}</span>
                </div>
                {/* Donor count display */}
                {onChainData && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {onChainData.donorCount || 0} {(onChainData.donorCount || 0) === 1 ? 'doador único' : 'doadores únicos'}
                    </span>
                  </div>
                )}
                {campaign.contractAddress && (
                  <div className="mt-2 text-xs text-gray-500">
                    <ExternalLink className="w-3 h-3 inline mr-1" />
                    <a 
                      href={`https://sepolia.basescan.org/address/${campaign.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Ver contrato na blockchain
                    </a>
                  </div>
                )}
              </div>

              {!showQRCode ? (
                <Tabs defaultValue={campaign.contractAddress ? "cbrl" : "pix"} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    {campaign.contractAddress && (
                      <TabsTrigger value="cbrl">🪙 cBRL (On-Chain)</TabsTrigger>
                    )}
                    <TabsTrigger value="pix">💳 PIX</TabsTrigger>
                  </TabsList>
                  
                  {campaign.contractAddress && (
                    <TabsContent value="cbrl" className="space-y-4">
                      {!isConnected ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Conecte sua carteira para doar cBRL diretamente na blockchain.
                            <Button onClick={() => connect()} className="ml-2" size="sm">
                              <Wallet className="w-4 h-4 mr-1" />
                              Conectar
                            </Button>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-800 mb-1">
                              <strong>Seu saldo cBRL:</strong> {formatBRL(parseFloat(cBRLBalance))}
                            </p>
                            <p className="text-xs text-blue-600">
                              Doação direta na blockchain - transparente e auditável
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Valor da doação (cBRL)</label>
                            <Input
                              type="number"
                              placeholder="0,00"
                              value={donationAmount}
                              onChange={(e) => setDonationAmount(e.target.value)}
                              className="mb-3"
                              disabled={isLoading}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-2">Valores sugeridos:</p>
                            <div className="grid grid-cols-3 gap-2">
                              {predefinedAmounts.map((amount) => (
                                <Button
                                  key={amount}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setDonationAmount(amount.toString())}
                                  className="text-xs"
                                  disabled={isLoading}
                                >
                                  {amount} cBRL
                                </Button>
                              ))}
                            </div>
                          </div>

                          <Button 
                            onClick={donateCBRL} 
                            className="w-full bg-blue-600 hover:bg-blue-700" 
                            size="lg"
                            disabled={isLoading || !donationAmount || parseFloat(donationAmount) <= 0}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {donationStatus || "Processando..."}
                              </>
                            ) : (
                              "🚀 Doar cBRL On-Chain"
                            )}
                          </Button>
                        </>
                      )}
                    </TabsContent>
                  )}
                  
                  <TabsContent value="pix" className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Valor da doação (R$)</label>
                      <Input
                        type="number"
                        placeholder="0,00"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        className="mb-3"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Valores sugeridos:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {predefinedAmounts.map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setDonationAmount(amount.toString())}
                            className="text-xs"
                          >
                            R$ {amount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button onClick={generateQRCode} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                      Gerar QR Code PIX
                    </Button>
                    
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <strong>PIX:</strong> Doações via PIX são convertidas automaticamente em cBRL e enviadas para o contrato da campanha.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-24 h-24 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Código PIX:</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <code className="text-xs break-all">{qrCodeData}</code>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyPixCode} className="mt-2 w-full bg-transparent">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar código PIX
                    </Button>
                  </div>

                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">
                      Valor: {formatCurrency(Number.parseFloat(donationAmount))}
                    </Badge>
                    <p className="text-xs text-gray-600">
                      Escaneie o QR Code ou copie o código PIX para fazer sua doação
                    </p>
                  </div>

                  <Button variant="outline" onClick={() => setShowQRCode(false)} className="w-full">
                    Voltar
                  </Button>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Seguro e transparente:</strong> Todas as doações são rastreadas via blockchain e você receberá
                  um comprovante da transação.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
