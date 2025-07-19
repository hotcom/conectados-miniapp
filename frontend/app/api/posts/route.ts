import { type NextRequest, NextResponse } from "next/server"

// Dados mockados inicialmente, depois serão substituídos por dados do banco
const posts = [
  {
    id: "1",
    organization: {
      name: "Instituto Criança Feliz",
      username: "@criancafeliz",
      avatar: "/placeholder.svg?height=40&width=40",
      verified: true,
    },
    content: "Hoje conseguimos distribuir 200 cestas básicas para famílias em situação de vulnerabilidade. Cada doação faz a diferença! 🙏❤️",
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

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: posts,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organization, content, image, goal, walletAddress } = await request.json()

    // Validação básica dos campos obrigatórios
    if (!organization || !content || !goal || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Criar novo post (mock)
    const newPost = {
      id: (posts.length + 1).toString(),
      organization,
      content,
      image: image || "/placeholder.svg?height=400&width=400",
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: "agora",
      goal,
      raised: 0,
      walletAddress,
    }

    // Adicionar ao array de posts (mock)
    posts.unshift(newPost)

    return NextResponse.json({
      success: true,
      data: newPost,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create post" },
      { status: 500 }
    )
  }
}
