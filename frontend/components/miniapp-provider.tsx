"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMiniApp, MiniAppUtils } from '@/hooks/use-miniapp'

interface MiniAppContextType {
  isMiniApp: boolean
  isInCoinbaseApp: boolean
  platform: 'mobile' | 'desktop' | 'unknown'
  sendMessage: (message: any) => void
  requestPermission: (permission: string) => Promise<boolean>
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined)

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const { isMiniApp, isInCoinbaseApp, platform } = useMiniApp()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize MiniApp environment
    if (isMiniApp) {
      console.log('🚀 MiniApp mode activated!')
      
      // Send ready message to parent Coinbase app
      MiniAppUtils.sendMessageToParent({
        type: 'MINIAPP_READY',
        data: {
          name: 'Conectados',
          version: '1.0.0',
          capabilities: ['wallet', 'network', 'transactions']
        }
      })

      // Listen for messages from parent app
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'COINBASE_MESSAGE') {
          console.log('📨 Message from Coinbase app:', event.data)
          
          // Handle different message types
          switch (event.data.action) {
            case 'WALLET_CONNECTED':
              console.log('✅ Wallet connected via MiniApp')
              break
            case 'NETWORK_CHANGED':
              console.log('🔄 Network changed via MiniApp')
              break
            default:
              console.log('📝 Unknown message type:', event.data.action)
          }
        }
      }

      window.addEventListener('message', handleMessage)
      setIsReady(true)

      return () => {
        window.removeEventListener('message', handleMessage)
      }
    } else {
      setIsReady(true)
    }
  }, [isMiniApp])

  const contextValue: MiniAppContextType = {
    isMiniApp,
    isInCoinbaseApp,
    platform,
    sendMessage: MiniAppUtils.sendMessageToParent,
    requestPermission: MiniAppUtils.requestPermission
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">
            {isMiniApp ? 'Inicializando MiniApp...' : 'Carregando aplicação...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <MiniAppContext.Provider value={contextValue}>
      {children}
    </MiniAppContext.Provider>
  )
}

export function useMiniAppContext() {
  const context = useContext(MiniAppContext)
  if (context === undefined) {
    throw new Error('useMiniAppContext must be used within a MiniAppProvider')
  }
  return context
}

// MiniApp specific components
export function MiniAppHeader({ title, showBack = false, onBack }: {
  title: string
  showBack?: boolean
  onBack?: () => void
}) {
  const { isMiniApp } = useMiniAppContext()

  if (!isMiniApp) return null

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">
          {title}
        </h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
    </header>
  )
}

export function MiniAppStatusBar() {
  const { isMiniApp, isInCoinbaseApp } = useMiniAppContext()

  if (!isMiniApp) return null

  return (
    <div className="bg-blue-600 text-white text-xs px-4 py-1 text-center">
      {isInCoinbaseApp ? '🔗 Rodando no Coinbase Super App' : '📱 Modo MiniApp Ativo'}
    </div>
  )
}
