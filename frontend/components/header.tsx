"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Heart, MessageCircle, PlusSquare, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletConnect } from "@/components/wallet-connect"
import { useWalletContext } from "@/contexts/wallet-context"
import { storage } from "@/lib/storage"

export function Header() {
  const wallet = useWalletContext()
  const [searchQuery, setSearchQuery] = useState("")
  const isConnected = wallet.isConnected
  const address = wallet.address

  // Check if user has organization profile
  const hasProfile = isConnected && address ? 
    storage.getOrganizations().some(org => 
      org.walletAddress.toLowerCase() === address.toLowerCase()
    ) : false

  const handleLikesClick = () => {
    // TODO: Implement likes/favorites page
    console.log("Likes clicked - feature coming soon")
  }

  const handleMessagesClick = () => {
    // TODO: Implement messages/notifications
    console.log("Messages clicked - feature coming soon")
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isConnected) {
      e.preventDefault()
      wallet.connect()
      return
    }
    // Let the Link handle navigation normally
  }

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!isConnected) {
      e.preventDefault()
      wallet.connect()
      return
    }
    // If connected but no profile, redirect to setup
    if (!hasProfile) {
      e.preventDefault()
      window.location.href = '/setup-profile'
      return
    }
    // TODO: Implement create post/campaign page
    e.preventDefault()
    console.log("Create clicked - feature coming soon")
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Conectados Impact
          </Link>

          <div className="hidden md:block flex-1 max-w-xs mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Buscar ONGs, causas..." 
                className="pl-10 bg-gray-50 border-0 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" title="Início">
                <Home className="w-6 h-6" />
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCreateClick}
              title={!isConnected ? "Conecte sua carteira" : !hasProfile ? "Crie seu perfil" : "Criar post"}
            >
              <PlusSquare className="w-6 h-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLikesClick}
              title="Curtidas (em breve)"
              className="opacity-50"
            >
              <Heart className="w-6 h-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleMessagesClick}
              title="Mensagens (em breve)"
              className="opacity-50"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            
            <div onClick={handleProfileClick}>
              <Link href={isConnected ? (hasProfile ? "/profile" : "/setup-profile") : "#"}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title={!isConnected ? "Conectar carteira" : !hasProfile ? "Criar perfil" : "Meu perfil"}
                >
                  <User className="w-6 h-6" />
                </Button>
              </Link>
            </div>
            
            <WalletConnect />
          </nav>
        </div>
      </div>
    </header>
  )
}
