"use client"

import { useParams } from 'next/navigation'
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Globe, Users, Heart, Share2 } from "lucide-react"
import { storage } from "@/lib/storage"
import { useEffect, useState } from "react"

export default function OrganizationPage() {
  const params = useParams()
  const username = params.username as string
  const [organization, setOrganization] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    // Load organization data
    const orgs = storage.getOrganizations()
    const org = orgs.find(o => o.username === username.replace('@', ''))
    
    if (org) {
      setOrganization(org)
      
      // Load organization posts
      const allPosts = storage.getPosts()
      const orgPosts = allPosts.filter(p => p.organizationId === org.walletAddress)
      setPosts(orgPosts)
    }
  }, [username])

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <CardContent>
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Organização não encontrada</h2>
              <p className="text-muted-foreground">
                A organização {username} não foi encontrada ou ainda não criou um perfil.
              </p>
              <Button className="mt-4" onClick={() => window.history.back()}>
                Voltar
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Organization Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {organization.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{organization.name}</h1>
                  {organization.verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      ✓ Verificada
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-2">@{organization.username}</p>
                
                {organization.description && (
                  <p className="text-gray-700 mb-4">{organization.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {organization.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{organization.location}</span>
                    </div>
                  )}
                  
                  {organization.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a href={organization.website} target="_blank" rel="noopener noreferrer" 
                         className="hover:text-blue-600">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Seguir
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Organization Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{posts.length}</div>
              <div className="text-sm text-muted-foreground">Campanhas Criadas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">R$ 0,00</div>
              <div className="text-sm text-muted-foreground">Total Arrecadado</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-sm text-muted-foreground">Doadores Únicos</div>
            </CardContent>
          </Card>
        </div>

        {/* Organization Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Campanhas e Postagens</CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {organization.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{organization.name}</span>
                          <span className="text-muted-foreground text-sm">
                            {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        
                        {post.image && (
                          <img 
                            src={post.image} 
                            alt="Post image" 
                            className="rounded-lg max-w-full h-auto mb-3"
                          />
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>❤️ {post.likes} curtidas</span>
                          <span>🔄 {post.shares} compartilhamentos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Esta organização ainda não criou nenhuma campanha.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
