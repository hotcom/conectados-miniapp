"use client"

import { useEffect, useState } from 'react'
import { Heart, RefreshCw } from 'lucide-react'

export default function SuperAppPage() {
  const [status, setStatus] = useState('Loading...')
  const [environment, setEnvironment] = useState({
    isSuperApp: false,
    userAgent: '',
    url: ''
  })

  useEffect(() => {
    try {
      // Detect environment
      const userAgent = navigator.userAgent
      const url = window.location.href
      const isSuperApp = userAgent.includes('Coinbase') || userAgent.includes('SuperApp')
      
      setEnvironment({
        isSuperApp,
        userAgent,
        url
      })
      
      setStatus('✅ SuperApp interface loaded successfully')
    } catch (error) {
      console.error('SuperApp initialization error:', error)
      setStatus(`❌ Error: ${error}`)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">DoeAgora</h1>
            {environment.isSuperApp && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">SuperApp</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold text-center mb-4">🎉 Bem-vindo ao DoeAgora!</h2>
          
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">💝</div>
            <p className="text-gray-600">
              Plataforma descentralizada para doações transparentes na blockchain Base
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-800">Doações via PIX convertidas em cBRL</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-800">Transparência total na blockchain</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-purple-800">Para ONGs e organizações sociais</span>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md"
            >
              🚀 Explorar Campanhas
            </button>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-2">📊 Status:</h3>
          <p className="text-sm text-gray-600 mb-2">{status}</p>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Environment:</strong> {environment.isSuperApp ? 'Coinbase SuperApp' : 'Web Browser'}</p>
            <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
