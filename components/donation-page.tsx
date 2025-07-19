"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { QrCode, Copy, CheckCircle, Heart, Users, Target } from "lucide-react"

interface DonationPageProps {
  postId: string
}

export function DonationPage({ postId }: DonationPageProps) {
  const [donationAmount, setDonationAmount] = useState("")
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeData, setQrCodeData] = useState("")

  // Mock data - in real app, fetch based on postId
  const campaign = {
    id: postId,
    title: "Cestas Básicas para Famílias Vulneráveis",
    organization: {
      name: "Instituto Criança Feliz",
      username: "@criancafeliz",
      avatar: "/placeholder.svg?height=60&width=60",
      verified: true,
    },
    description:
      "Ajude-nos a distribuir cestas básicas para 500 famílias em situação de vulnerabilidade social. Cada doação faz a diferença na vida de uma família.",
    image: "/placeholder.svg?height=400&width=600",
    goal: 50000,
    raised: 32500,
    donors: 1247,
    daysLeft: 15,
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  }

  const progressPercentage = (campaign.raised / campaign.goal) * 100

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const generateQRCode = async () => {
    if (!donationAmount || Number.parseFloat(donationAmount) <= 0) {
      alert("Por favor, insira um valor válido para doação")
      return
    }

    // Simulate OpenPix API call
    const pixData = {
      value: Number.parseFloat(donationAmount) * 100, // Convert to cents
      correlationID: `donation-${campaign.id}-${Date.now()}`,
      comment: `Doação para ${campaign.title}`,
    }

    // Mock QR Code generation
    setQrCodeData(
      `00020126580014BR.GOV.BCB.PIX0136${campaign.walletAddress}520400005303986540${pixData.value.toString().padStart(10, "0")}5802BR5925${campaign.organization.name}6009SAO PAULO62070503***6304`,
    )
    setShowQRCode(true)
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(qrCodeData)
    alert("Código PIX copiado!")
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
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="font-bold text-lg text-green-600">{formatCurrency(campaign.raised)}</div>
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
                  <span className="text-green-600 font-semibold">{formatCurrency(campaign.raised)}</span>
                  <span className="text-gray-600">de {formatCurrency(campaign.goal)}</span>
                </div>
              </div>

              {!showQRCode ? (
                <>
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

                  <Button onClick={generateQRCode} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                    Gerar QR Code PIX
                  </Button>
                </>
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
