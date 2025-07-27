"use client"

import type React from "react"
import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, ImageIcon, Wallet, AlertCircle, Loader2 } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { CampaignFactory, ensureBaseSepoliaNetwork, formatBRL } from "@/lib/campaign-factory"
import { firebaseStorage, type Campaign, type Post } from "@/lib/firebase-storage"
import { firebaseImageUpload } from "@/lib/firebase-image-upload"
import { ethers } from "ethers"

export default function CreatePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goal, setGoal] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<string>("") 

  const { isConnected, address, connect } = useWalletContext()

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      alert("Por favor, conecte sua carteira primeiro!")
      return
    }

    setIsSubmitting(true)
    setDeploymentStatus("Preparando dados...")

    try {
      // Upload image to Firebase Storage if provided
      let imageUrl: string | undefined = undefined
      if (image) {
        setDeploymentStatus("Enviando imagem para Firebase Storage...")
        try {
          // Generate unique campaign ID for filename
          const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          // Add timeout to prevent infinite hanging
          const uploadPromise = firebaseImageUpload.uploadCampaignImage(image, campaignId)
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Firebase Storage upload timeout after 10 seconds')), 10000)
          })
          
          imageUrl = await Promise.race([uploadPromise, timeoutPromise])
          console.log('✅ Campaign image uploaded to Firebase Storage:', imageUrl)
        } catch (error) {
          console.error('❌ Firebase Storage upload failed, using base64:', error)
          setDeploymentStatus("Firebase Storage falhou, usando fallback...")
          // Fallback to base64
          imageUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.readAsDataURL(image)
          })
        }
      }

      // Get provider and ensure Base Sepolia network
      setDeploymentStatus("Conectando à Base Sepolia...")
      const provider = new ethers.providers.Web3Provider(window.ethereum as any)
      await ensureBaseSepoliaNetwork(provider)

      // Create campaign on-chain
      setDeploymentStatus("Criando campanha na blockchain...")
      const campaignFactory = new CampaignFactory(provider)
      
      const onChainResult = await campaignFactory.createCampaign(
        title,
        description,
        Number.parseFloat(goal),
        address! // beneficiary is the connected wallet
      )

      console.log("Campaign created on-chain:", onChainResult)
      setDeploymentStatus("Salvando dados no Firebase...")

      // Create campaign data for Firebase (now with on-chain info)
      const campaignData: Campaign = {
        id: firebaseStorage.generateId(),
        organizationId: address!,
        title,
        description,
        goal: Number.parseFloat(goal),
        raised: 0,
        donors: 0,
        daysLeft: 30,
        image: imageUrl,
        walletAddress: address!,
        createdAt: Date.now(),
        status: 'active' as const,
        // Contract address at root level for feed compatibility
        contractAddress: onChainResult.campaignContract,
        // On-chain data
        onChain: {
          campaignId: onChainResult.campaignId,
          contractAddress: onChainResult.campaignContract,
          transactionHash: onChainResult.transactionHash
        }
      }

      console.log("Saving campaign data:", campaignData)

      // Save to Firebase
      await firebaseStorage.saveCampaign(campaignData)

      // Get organization name for post
      const currentOrg = await firebaseStorage.getCurrentOrganization()
      const orgName = currentOrg?.name || 'Organização'
      
      // Create a post for the campaign
      const postData: Post = {
        id: firebaseStorage.generateId(),
        organizationId: address!,
        campaignId: campaignData.id,
        content: `@${orgName}

${title}

${description}`,
        image: imageUrl,
        createdAt: Date.now(),
        likes: 0,
        shares: 0
      }
      await firebaseStorage.savePost(postData)

      setDeploymentStatus("Finalizando...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      alert(`🎉 Campanha criada com SUCESSO!\n\n📋 Detalhes:\n• ID da Campanha: ${onChainResult.campaignId}\n• Contrato: ${onChainResult.campaignContract}\n• Transação: ${onChainResult.transactionHash}\n• Meta: ${formatBRL(goal)}\n\n🔗 Visualizar no BaseScan:\nhttps://sepolia.basescan.org/tx/${onChainResult.transactionHash}`)

      // Reset form
      setTitle("")
      setDescription("")
      setGoal("")
      setImage(null)
    } catch (error: any) {
      console.error("Error creating campaign:", error)
      
      let errorMessage = "Erro ao criar campanha. Tente novamente."
      
      if (error.message.includes('user rejected')) {
        errorMessage = "Transação cancelada pelo usuário."
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = "Saldo insuficiente para pagar o gas da transação."
      } else if (error.message.includes('network')) {
        errorMessage = "Erro de rede. Verifique sua conexão e tente novamente."
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
      setDeploymentStatus("")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Criar Nova Campanha
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Você precisa conectar sua carteira para criar uma campanha.</span>
                  <Button onClick={() => connect()} size="sm" className="ml-4">
                    <Wallet className="w-4 h-4 mr-2" />
                    Conectar Carteira
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <Wallet className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Carteira conectada: {address?.slice(0, 6)}...{address?.slice(-4)}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Título da Campanha</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Cestas Básicas para Famílias Vulneráveis"
                  required
                  disabled={!isConnected}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva sua campanha, objetivos e como as doações serão utilizadas..."
                  rows={4}
                  required
                  disabled={!isConnected}
                />
              </div>

              <div>
                <Label htmlFor="goal">Meta de Arrecadação (R$)</Label>
                <Input
                  id="goal"
                  type="number"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="0,00"
                  required
                  disabled={!isConnected}
                />
              </div>

              <div>
                <Label htmlFor="image">Imagem da Campanha</Label>
                <div className="mt-2">
                  <label
                    htmlFor="image"
                    className={`cursor-pointer ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      {image ? (
                        <div>
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-green-600">{image.name}</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Clique para fazer upload da imagem</p>
                        </div>
                      )}
                    </div>
                  </label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={!isConnected}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !title || !description || !goal}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {deploymentStatus || "Criando..."}
                  </>
                ) : (
                  "🚀 Criar Campanha On-Chain"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
