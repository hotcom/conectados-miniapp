"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Heart, MessageCircle, PlusSquare, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletConnect } from "@/components/wallet-connect"
import { useWalletContext } from "@/contexts/wallet-context"
import { firebaseStorage } from "@/lib/firebase-storage"
import { Logo } from "@/components/logo"

export function Header() {
  const wallet = useWalletContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [hasProfile, setHasProfile] = useState(false)
  const isConnected = wallet.isConnected
  const address = wallet.address

  // Check if user has organization profile
  useEffect(() => {
    const checkProfile = async () => {
      if (isConnected && address) {
        try {
          const organizations = await firebaseStorage.getOrganizations()
          const userHasProfile = organizations.some((org: any) => 
            org.walletAddress.toLowerCase() === address.toLowerCase()
          )
          setHasProfile(userHasProfile)
        } catch (error) {
          console.error('Error checking profile:', error)
          setHasProfile(false)
        }
      } else {
        setHasProfile(false)
      }
    }
    
    checkProfile()
  }, [isConnected, address])

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
    // Redirect to create campaign page
    e.preventDefault()
    window.location.href = '/create'
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-16">
          {/* Logo - Smaller on mobile */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Search - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block flex-1 max-w-xs mx-4">
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

          {/* Navigation - Compact for mobile */}
          <nav className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {/* Home - Hidden on mobile */}
            <Link href="/" className="hidden sm:block">
              <Button variant="ghost" size="sm" title="Início">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            
            {/* Create */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCreateClick}
              title={!isConnected ? "Conecte sua carteira" : !hasProfile ? "Crie seu perfil" : "Criar post"}
            >
              <PlusSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            {/* Likes - Hidden on small mobile */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLikesClick}
              title="Curtidas (em breve)"
              className="opacity-50 hidden xs:block"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            {/* Messages - Hidden on small mobile */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleMessagesClick}
              title="Mensagens (em breve)"
              className="opacity-50 hidden xs:block"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            {/* Profile */}
            <div onClick={handleProfileClick}>
              <Link href={isConnected ? (hasProfile ? "/profile" : "/setup-profile") : "#"}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  title={!isConnected ? "Conectar carteira" : !hasProfile ? "Criar perfil" : "Meu perfil"}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
            
            {/* Wallet Connect - Compact */}
            <div className="ml-1">
              <WalletConnect />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
