import { PostCard } from "@/components/post-card"

const posts = [
  {
    id: "1",
    organization: {
      name: "Instituto Criança Feliz",
      username: "@criancafeliz",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content:
      "Hoje conseguimos distribuir 200 cestas básicas para famílias em situação de vulnerabilidade. Cada doação faz a diferença! 🙏❤️",
    image: "/placeholder.svg?height=400&width=400",
    likes: 1247,
    comments: 89,
    shares: 34,
    timestamp: "2h",
    goal: 50000,
    raised: 32500,
    walletAddress: "0x1234...5678",
  },
  {
    id: "2",
    organization: {
      name: "ONG Meio Ambiente Verde",
      username: "@meioambienteverde",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: "Plantamos mais 500 árvores neste mês! Juntos estamos reflorestando nossa cidade. 🌱🌳",
    image: "/placeholder.svg?height=400&width=400",
    likes: 892,
    comments: 45,
    shares: 67,
    timestamp: "4h",
    goal: 25000,
    raised: 18750,
    walletAddress: "0xabcd...efgh",
  },
  {
    id: "3",
    organization: {
      name: "Casa de Apoio São José",
      username: "@casasaojose",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: "Nosso projeto de capacitação profissional já formou 50 pessoas este ano. Educação transforma vidas! 📚✨",
    likes: 654,
    comments: 23,
    shares: 12,
    timestamp: "6h",
    goal: 15000,
    raised: 8900,
    walletAddress: "0x9876...5432",
  },
]

export function Feed() {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
