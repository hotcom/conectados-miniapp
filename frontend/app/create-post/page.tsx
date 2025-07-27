"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { ArrowLeft, Upload, MessageCircle } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { firebaseStorage, type Post } from "@/lib/firebase-storage"

export default function CreatePostPage() {
  const router = useRouter()
  const { isConnected, address } = useWalletContext()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    content: "",
    image: ""
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      
      // Convert to base64 for simplicity (could be improved with Firebase Storage)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result as string
        }))
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      alert('Por favor, conecte sua carteira primeiro')
      return
    }

    if (!formData.content.trim()) {
      alert('Por favor, adicione um conteúdo para o post')
      return
    }

    try {
      setLoading(true)

      // Get organization info
      const currentOrg = await firebaseStorage.getCurrentOrganization()
      if (!currentOrg) {
        alert('Perfil da organização não encontrado. Crie um perfil primeiro.')
        router.push('/setup-profile')
        return
      }

      // Create post data
      const postData: Post = {
        id: firebaseStorage.generateId(),
        organizationId: address,
        content: formData.content,
        image: formData.image || undefined,
        createdAt: Date.now(),
        likes: 0,
        shares: 0
      }

      // Save to Firebase
      await firebaseStorage.savePost(postData)

      alert('Post criado com sucesso!')
      router.push('/profile')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Erro ao criar post. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-4">Conecte sua Carteira</h2>
              <p className="text-gray-600">
                Para criar um post, você precisa conectar sua carteira primeiro.
              </p>
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
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Criar Post</h1>
          <p className="text-gray-600 mt-2">
            Compartilhe atualizações e novidades da sua organização
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Novo Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="content">Conteúdo do Post *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escreva sobre as atividades da sua organização, impacto social, agradecimentos aos doadores..."
                  className="min-h-[120px] mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Imagem (Opcional)</Label>
                <div className="mt-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mb-4"
                  />
                  {formData.image && (
                    <div className="mt-4">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="max-w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando...
                    </div>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Criar Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
