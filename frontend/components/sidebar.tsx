"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, User, Wallet } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { firebaseStorage, type Organization } from "@/lib/firebase-storage"

export function Sidebar() {
  const wallet = useWalletContext()
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [lastAddress, setLastAddress] = useState<string | null>(null)
  
  // Extract wallet state
  const isConnected = wallet.isConnected
  const address = wallet.address

  // Debug logging
  useEffect(() => {
    console.log('=== SIDEBAR CONTEXT DEBUG ===')
    console.log('isConnected:', isConnected)
    console.log('address:', address)
    console.log('currentOrg:', currentOrg)
    console.log('==========================')
  }, [isConnected, address, currentOrg])

  // Check for organization when wallet connects or address changes
  const checkForOrganization = useCallback(async () => {
    console.log('Checking for organization - isConnected:', isConnected, 'address:', address)
    
    if (isConnected && address) {
      try {
        const organizations = await firebaseStorage.getOrganizations()
        console.log('Available organizations:', organizations)
        
        const userOrg = organizations.find((org: Organization) => {
          const match = org.walletAddress.toLowerCase() === address.toLowerCase()
          console.log(`Comparing ${org.walletAddress.toLowerCase()} === ${address.toLowerCase()}: ${match}`)
          return match
        })
        
        console.log('Found userOrg:', userOrg)
        setCurrentOrg(userOrg || null)
      } catch (error) {
        console.error('Error loading organizations:', error)
        setCurrentOrg(null)
      }
      setLastAddress(address)
    } else {
      console.log('Wallet not connected, clearing organization')
      setCurrentOrg(null)
      setLastAddress(null)
    }
  }, [isConnected, address])

  // Initial check and setup
  useEffect(() => {
    checkForOrganization()
  }, [checkForOrganization])

  // Watch for address changes
  useEffect(() => {
    if (address !== lastAddress) {
      console.log('Address changed from', lastAddress, 'to', address)
      checkForOrganization()
    }
  }, [address, lastAddress, checkForOrganization])

  // Periodic check to ensure state is correct
  useEffect(() => {
    const interval = setInterval(() => {
      checkForOrganization()
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [checkForOrganization])

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <Card>
        <CardContent className="p-4">
          {!isConnected ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-gray-400" />
              </div>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">Carteira não conectada</h3>
                <p className="text-sm text-gray-600">
                  Conecte sua carteira para acessar o perfil e começar a usar a plataforma
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => wallet.connect()}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Conectar Carteira
              </Button>
            </div>
          ) : currentOrg ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={currentOrg.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {currentOrg.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {currentOrg.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {currentOrg.username}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-blue-600">Perfil ativo</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Ver Meu Perfil
                  </Button>
                </Link>
                <Link href="/create">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Campanha
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">Perfil não encontrado</h3>
                <p className="text-sm text-gray-600">
                  Carteira conectada! Agora crie o perfil da sua organização para começar
                </p>
              </div>
              <Link href="/setup-profile">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Perfil da Organização
                </Button>
              </Link>
              <p className="text-xs text-gray-500 mt-2">
                Endereço: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Causes Categories */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Categorias de Causas</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Emergências</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Meio Ambiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Educação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Saúde</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Assistência Social</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
