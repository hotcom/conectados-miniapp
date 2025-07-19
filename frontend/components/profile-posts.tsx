import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle } from "lucide-react"

const posts = [
  {
    id: "1",
    image: "/placeholder.svg?height=300&width=300",
    likes: 1247,
    comments: 89,
  },
  {
    id: "2",
    image: "/placeholder.svg?height=300&width=300",
    likes: 892,
    comments: 45,
  },
  {
    id: "3",
    image: "/placeholder.svg?height=300&width=300",
    likes: 654,
    comments: 23,
  },
  {
    id: "4",
    image: "/placeholder.svg?height=300&width=300",
    likes: 543,
    comments: 67,
  },
  {
    id: "5",
    image: "/placeholder.svg?height=300&width=300",
    likes: 789,
    comments: 34,
  },
  {
    id: "6",
    image: "/placeholder.svg?height=300&width=300",
    likes: 432,
    comments: 12,
  },
]

export function ProfilePosts() {
  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        <div className="flex gap-8 text-sm">
          <button className="flex items-center gap-2 pb-2 border-b-2 border-blue-500 text-blue-500">
            <div className="w-3 h-3 border border-current"></div>
            PUBLICAÇÕES
          </button>
          <button className="flex items-center gap-2 pb-2 text-gray-500">
            <Heart className="w-3 h-3" />
            CURTIDAS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="group cursor-pointer overflow-hidden">
            <CardContent className="p-0 relative">
              <Image
                src={post.image || "/placeholder.svg"}
                alt="Post"
                width={300}
                height={300}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{post.comments}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
