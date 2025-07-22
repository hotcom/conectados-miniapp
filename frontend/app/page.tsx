import { Header } from "@/components/header"
import { Feed } from "@/components/feed"
import { Sidebar } from "@/components/sidebar"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [version, setVersion] = useState('')

  useEffect(() => {
    // Add logic to fetch or retrieve the version number
    // For demonstration purposes, a static version number is used
    setVersion('v1.0.0')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          <div className="lg:col-span-2">
            <Feed />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-3">Sobre o Conectados Impact</h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      Plataforma descentralizada para ONGs e organizações do terceiro setor.
                    </p>
                    <p className="mb-2">
                      Receba doações via PIX convertidas automaticamente em cBRL na blockchain Base.
                    </p>
                  </div>
                  
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Como funciona:</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>Crie o perfil da sua organização</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span>Publique suas causas e campanhas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <span>Receba doações via PIX</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <span>Tokens cBRL mintados automaticamente</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Version Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-xs text-gray-500">
          <span>Conectados MiniApp</span>
          <span id="version-info">v1.0.3 - Build 2025-01-22-07:20</span>
        </div>
      </footer>
    </div>
  )
}
