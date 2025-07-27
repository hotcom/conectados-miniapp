"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Heart, MessageCircle } from "lucide-react"
import { type Organization, type Post, firebaseStorage } from "@/lib/firebase-storage"

interface ProfilePostsProps {
  organization: Organization
}

export function ProfilePosts({ organization }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Load posts for this organization
        const organizationPosts = await firebaseStorage.getPostsByOrganization(organization.id)
        setPosts(organizationPosts)
      } catch (error) {
        console.error('Error loading posts:', error)
      }
    }
    
    loadPosts()
  }, [organization.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Posts</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Postagem
        </Button>
      </div>

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
            <Button className="bg-blue-600 hover:bg-blue-700">
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
    </div>
  )
}
