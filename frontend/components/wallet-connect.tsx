"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Wallet, ChevronDown, Copy, LogOut, User, Settings, AlertTriangle, CheckCircle, Plus } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { WalletSelectionModal } from "@/components/wallet-selection-modal"

export function WalletConnect() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const wallet = useWalletContext()
  
  // Extract wallet state
  const isConnected = wallet.isConnected
  const address = wallet.address
  const balance = wallet.balance
  const network = wallet.network
  const connect = wallet.connect
  const disconnect = wallet.disconnect
  const isConnecting = wallet.isConnecting
  const addBaseSepolia = wallet.addBaseSepolia
  const isCorrectNetwork = wallet.isCorrectNetwork

  console.log('=== WALLET CONNECT DEBUG ===')
  console.log('isConnected:', isConnected)
  console.log('address:', address)
  console.log('isConnecting:', isConnecting)
  console.log('network:', network)
  console.log('isCorrectNetwork:', isCorrectNetwork)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      alert("Endereço copiado!")
    }
  }

  const connectWithWallet = async (walletType?: 'metamask' | 'coinbase') => {
    try {
      console.log(`🔌 Attempting to connect with ${walletType || 'auto-detect'}`)
      await connect(walletType)
      console.log('✅ Wallet connected successfully')
    } catch (error) {
      console.error('❌ Erro ao conectar carteira:', error)
      // Force reset connecting state on error
      setTimeout(() => {
        if (wallet.isConnecting) {
          console.log('🔄 Forcing reset of connecting state after error')
          wallet.disconnect() // This will reset the state
        }
      }, 2000)
    }
  }

  const handleAddNetwork = async () => {
    try {
      await addBaseSepolia()
      alert("Rede Base Sepolia adicionada! Agora mude para ela manualmente na sua carteira.")
    } catch (error) {
      console.error('Error adding network:', error)
      alert(
        "Erro ao adicionar rede. Tente adicionar manualmente:\n\nNome: Base Sepolia\nRPC: https://sepolia.base.org\nChain ID: 84532",
      )
    }
  }

  if (!isConnected) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              console.log('=== OPENING WALLET MODAL ===')
              setIsModalOpen(true)
            }}
            disabled={isConnecting} 
            className={`relative ${isConnecting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Wallet className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-pulse' : ''}`} />
            <span className={isConnecting ? 'opacity-0' : ''}>
              {isConnecting ? "Conectando..." : "Conectar Carteira"}
            </span>
            {isConnecting && (
              <span className="absolute inset-0 flex items-center justify-center">
                Conectando...
              </span>
            )}
          </Button>
          
          {/* Emergency reset button - only show if stuck connecting for too long */}
          {isConnecting && (
            <Button 
              onClick={() => {
                console.log('🚨 Emergency reset of wallet state')
                disconnect()
              }}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              title="Reset se travou"
            >
              ✕
            </Button>
          )}
        </div>
        
        <WalletSelectionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConnect={connectWithWallet}
        />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
              {address?.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs">{formatAddress(address!)}</span>
            <div className="flex items-center gap-1">
              {isCorrectNetwork ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-orange-500" />
              )}
              <span className="text-xs text-gray-500">{network}</span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Coinbase Wallet</p>
            <Badge variant={isCorrectNetwork ? "default" : "destructive"} className="text-xs">
              {network}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 font-mono">{formatAddress(address!)}</p>
          {balance && <p className="text-xs text-green-600 font-medium mt-1">{balance}</p>}
          
          {/* Network Status */}
          {isCorrectNetwork && (
            <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-green-50 rounded-md">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-700 font-medium">Conectado à Base Sepolia</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600">Online</span>
            </div>
          )}
        </div>

        {!isCorrectNetwork && (
          <>
            <DropdownMenuSeparator />
            <div className="px-3 py-2 bg-orange-50">
              <p className="text-xs text-orange-800 mb-2 font-medium">⚠️ Rede Incorreta</p>
              <p className="text-xs text-orange-700 mb-3">Você precisa estar na Base Sepolia para usar a plataforma.</p>
              <Button
                size="sm"
                onClick={handleAddNetwork}
                className="w-full bg-orange-600 hover:bg-orange-700 text-xs mb-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar Base Sepolia
              </Button>
              <p className="text-xs text-orange-600">
                Depois de adicionar, mude para a rede manualmente na sua carteira.
              </p>
            </div>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="w-4 h-4 mr-2" />
          Copiar Endereço
        </DropdownMenuItem>
        <DropdownMenuItem>
          <User className="w-4 h-4 mr-2" />
          Meu Perfil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Desconectar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
