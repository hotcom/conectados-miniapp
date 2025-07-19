"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Heart, MessageCircle, Share, MoreHorizontal, CheckCircle } from "lucide-react"

interface Post {
  id: string
  organization: {
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
  timestamp: string
  goal: number
  raised: number
  walletAddress: string
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)

  const progressPercentage = (post.raised / post.goal) * 100

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="flex flex-row items-center p-4">
        <Link href={`/organization/${post.organization.username}`} className="flex items-center gap-3 flex-1">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.organization.avatar || "/placeholder.svg"} />
            <AvatarFallback>{post.organization.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">{post.organization.name}</span>
              {post.organization.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
            </div>
            <span className="text-xs text-gray-500">{post.timestamp}</span>
          </div>
        </Link>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {post.image && (
          <Image
            src={post.image || "/placeholder.svg"}
            alt="Post image"
            width={400}
            height={400}
            className="w-full aspect-square object-cover"
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleLike} className={liked ? "text-red-500" : ""}>
              <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="w-full text-left">
          <p className="font-semibold text-sm mb-1">{likesCount.toLocaleString()} curtidas</p>
          <p className="text-sm">
            <span className="font-semibold">{post.organization.username}</span> {post.content}
          </p>
        </div>

        <div className="w-full bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Meta de arrecadação</span>
            <span className="text-sm text-gray-600">{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="mb-2" />
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-semibold">{formatCurrency(post.raised)} arrecadados</span>
            <span className="text-gray-600">de {formatCurrency(post.goal)}</span>
          </div>
          <Link href={`/donate/${post.id}`}>
            <Button className="w-full mt-3 bg-green-600 hover:bg-green-700">Doar Agora</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
