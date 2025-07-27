"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { ProfileHeader } from "@/components/profile-header"
import { ProfilePosts } from "@/components/profile-posts"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Plus } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { firebaseStorage, type Organization } from "@/lib/firebase-storage"

export default function ProfilePage() {
  const router = useRouter()
  const { isConnected, address } = useWalletContext()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (!isConnected) {
        router.push('/')
        return
      }

      try {
        console.log('🔍 [PROFILE] Loading profile for wallet:', address)
        
        let currentOrg: Organization | null = null
        
        // ALWAYS prioritize the connected wallet address over localStorage
        if (address) {
          const organizations = await firebaseStorage.getOrganizations()
          console.log('📋 [PROFILE] All organizations:', organizations.map(org => ({ id: org.id, name: org.name, wallet: org.walletAddress })))
          
          currentOrg = organizations.find((org: Organization) => 
            org.walletAddress.toLowerCase() === address.toLowerCase()
          ) || null
          
          console.log('🎯 [PROFILE] Found organization for wallet:', currentOrg ? { id: currentOrg.id, name: currentOrg.name } : 'None')
          
          if (currentOrg) {
            // Update localStorage to match the connected wallet
            await firebaseStorage.setCurrentUser(currentOrg.id)
            console.log('✅ [PROFILE] Set current user to:', currentOrg.id)
          }
        }
        
        // Only fallback to localStorage if no wallet connected (shouldn't happen in this page)
        if (!currentOrg && !address) {
          console.log('⚠️ [PROFILE] No wallet connected, trying localStorage fallback')
          currentOrg = await firebaseStorage.getCurrentOrganization()
        }

        setOrganization(currentOrg)
        
        // If no organization found, redirect to setup
        if (!currentOrg) {
          router.push('/setup-profile')
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        router.push('/setup-profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [isConnected, address, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
              <p className="text-gray-600 mb-6">
                Você ainda não criou um perfil organizacional.
              </p>
              <Button 
                onClick={() => router.push('/setup-profile')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProfileHeader organization={organization} />
        <ProfilePosts organization={organization} />
      </div>
    </div>
  )
}
