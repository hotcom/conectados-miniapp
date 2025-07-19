import Link from "next/link"
import { Search, Heart, MessageCircle, PlusSquare, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletConnect } from "@/components/wallet-connect"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            DoaçãoSocial
          </Link>

          <div className="hidden md:block flex-1 max-w-xs mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Buscar ONGs, causas..." className="pl-10 bg-gray-50 border-0 focus-visible:ring-1" />
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="w-6 h-6" />
              </Button>
            </Link>
            <Link href="/create">
              <Button variant="ghost" size="icon">
                <PlusSquare className="w-6 h-6" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Heart className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="w-6 h-6" />
              </Button>
            </Link>
            <WalletConnect />
          </nav>
        </div>
      </div>
    </header>
  )
}
