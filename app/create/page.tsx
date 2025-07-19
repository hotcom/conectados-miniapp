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
import { Upload, ImageIcon, Wallet, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

export default function CreatePage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [goal, setGoal] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isConnected, address, connect } = useWallet()

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

    try {
      // Simulate blockchain transaction
      const campaignData = {
        title,
        description,
        goal: Number.parseFloat(goal),
        image: image?.name,
        creator: address,
        timestamp: Date.now(),
      }

      // In a real app, you would:
      // 1. Upload image to IPFS
      // 2. Create smart contract transaction
      // 3. Store metadata on blockchain

      console.log("Creating campaign:", campaignData)

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("Campanha criada com sucesso na blockchain!")

      // Reset form
      setTitle("")
      setDescription("")
      setGoal("")
      setImage(null)
    } catch (error) {
      console.error("Error creating campaign:", error)
      alert("Erro ao criar campanha. Tente novamente.")
    } finally {
      setIsSubmitting(false)
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
                  <Button onClick={connect} size="sm" className="ml-4">
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

              <Button type="submit" className="w-full" size="lg" disabled={!isConnected || isSubmitting}>
                {isSubmitting ? "Criando na Blockchain..." : "Criar Campanha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
