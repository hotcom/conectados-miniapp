"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, RefreshCw, Database, FileText } from "lucide-react"
import { CBRLMintComponent } from "./cbrl-mint"
import { storage } from "@/lib/storage"

export function AdminPanel() {
  const [isVisible, setIsVisible] = useState(false)

  const clearCampaigns = () => {
    if (confirm('Tem certeza que deseja limpar todas as campanhas e posts?')) {
      localStorage.removeItem('conectados_campaigns')
      localStorage.removeItem('conectados_posts')
      alert('✅ Campanhas e posts removidos! Recarregando página...')
      window.location.reload()
    }
  }

  const clearAllData = () => {
    if (confirm('⚠️ ATENÇÃO: Isso vai remover TODOS os dados (perfil, campanhas, posts). Tem certeza?')) {
      localStorage.removeItem('conectados_organizations')
      localStorage.removeItem('conectados_campaigns')
      localStorage.removeItem('conectados_posts')
      localStorage.removeItem('conectados_current_user')
      alert('✅ Todos os dados removidos! Recarregando página...')
      window.location.reload()
    }
  }

  const showDataInfo = () => {
    const orgs = JSON.parse(localStorage.getItem('conectados_organizations') || '[]')
    const campaigns = JSON.parse(localStorage.getItem('conectados_campaigns') || '[]')
    const posts = JSON.parse(localStorage.getItem('conectados_posts') || '[]')
    
    alert(`📊 Dados atuais:
• Organizações: ${orgs.length}
• Campanhas: ${campaigns.length}
• Posts: ${posts.length}`)
  }

  // Show panel only in development or when triggered
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Database className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            🛠️ Admin Panel
            <Button
              onClick={() => setIsVisible(false)}
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            onClick={showDataInfo}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            <Database className="w-3 h-3 mr-1" />
            Ver Dados
          </Button>
          
          <Button
            onClick={clearCampaigns}
            size="sm"
            variant="outline"
            className="w-full text-xs text-orange-600 hover:text-orange-700"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Limpar Campanhas
          </Button>
          
          <Button
            onClick={clearAllData}
            size="sm"
            variant="destructive"
            className="w-full text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Limpar Tudo
          </Button>
        </CardContent>
      </Card>
      <CBRLMintComponent />
    </div>
  )
}
