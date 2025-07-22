"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Upload, Building2, Wallet, Globe, MapPin, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { storage, type Organization } from "@/lib/storage"

export default function SetupProfilePage() {
  const router = useRouter()
  const { isConnected, address } = useWalletContext()
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    description: "",
    website: "",
    location: "",
    foundedYear: "",
    avatar: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Check if user already has a profile
  useEffect(() => {
    if (isConnected && address) {
      const existingOrg = storage.getOrganizations().find(org => 
        org.walletAddress.toLowerCase() === address.toLowerCase()
      )
      
      if (existingOrg) {
        // User already has a profile, redirect to profile page
        storage.setCurrentUser(existingOrg.id)
        router.push('/profile')
      }
    }
  }, [isConnected, address, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome da organização é obrigatório"
    }

    if (!formData.username.trim()) {
      newErrors.username = "Nome de usuário é obrigatório"
    } else if (!formData.username.startsWith('@')) {
      newErrors.username = "Nome de usuário deve começar com @"
    } else if (formData.username.length < 3) {
      newErrors.username = "Nome de usuário deve ter pelo menos 3 caracteres"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória"
    } else if (formData.description.length < 20) {
      newErrors.description = "Descrição deve ter pelo menos 20 caracteres"
    }

    if (formData.website && !formData.website.includes('.')) {
      newErrors.website = "Website deve ser um URL válido"
    }

    if (formData.foundedYear) {
      const year = parseInt(formData.foundedYear)
      const currentYear = new Date().getFullYear()
      if (year < 1900 || year > currentYear) {
        newErrors.foundedYear = `Ano deve estar entre 1900 e ${currentYear}`
      }
    }

    // Check if username is already taken
    const existingOrg = storage.getOrganizations().find(org => 
      org.username.toLowerCase() === formData.username.toLowerCase()
    )
    if (existingOrg) {
      newErrors.username = "Este nome de usuário já está em uso"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      alert("Por favor, conecte sua carteira primeiro!")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const newOrganization: Organization = {
        id: storage.generateId(),
        name: formData.name.trim(),
        username: formData.username.trim(),
        description: formData.description.trim(),
        avatar: formData.avatar || undefined,
        walletAddress: address,
        website: formData.website.trim() || undefined,
        location: formData.location.trim() || undefined,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        verified: false, // New organizations start unverified
        createdAt: Date.now()
      }

      // Save organization to localStorage
      storage.saveOrganization(newOrganization)
      
      // Set as current user
      storage.setCurrentUser(newOrganization.id)

      // Redirect to profile page
      router.push('/profile')
      
    } catch (error) {
      console.error('Erro ao criar perfil:', error)
      alert('Erro ao criar perfil. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For MVP, we'll use a placeholder. In production, upload to IPFS or cloud storage
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-4">Conecte sua Carteira</h2>
              <p className="text-gray-600 mb-6">
                Para criar um perfil organizacional, você precisa conectar sua carteira primeiro.
              </p>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sua carteira será usada para receber doações e identificar sua organização.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Criar Perfil Organizacional</h1>
          <p className="text-gray-600">
            Configure o perfil da sua organização para começar a receber doações
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informações da Organização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {formData.name ? formData.name[0].toUpperCase() : <Building2 className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Organização *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Instituto Criança Feliz"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="username">Nome de Usuário *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="@criancafeliz"
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição da Organização *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva a missão e objetivos da sua organização..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.description.length}/200 caracteres (mínimo 20)
                </p>
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="www.exemplo.org.br"
                      className={`pl-10 ${errors.website ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.website && <p className="text-sm text-red-500 mt-1">{errors.website}</p>}
                </div>

                <div>
                  <Label htmlFor="foundedYear">Ano de Fundação</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="foundedYear"
                      type="number"
                      value={formData.foundedYear}
                      onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                      placeholder="2015"
                      min="1900"
                      max={new Date().getFullYear()}
                      className={`pl-10 ${errors.foundedYear ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.foundedYear && <p className="text-sm text-red-500 mt-1">{errors.foundedYear}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Localização</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="São Paulo, SP"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Wallet Info */}
              <Alert>
                <Wallet className="h-4 w-4" />
                <AlertDescription>
                  <strong>Carteira conectada:</strong> {address}
                  <br />
                  Esta carteira será usada para receber doações em cBRL tokens.
                </AlertDescription>
              </Alert>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Criando perfil..."
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Criar Perfil Organizacional
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
