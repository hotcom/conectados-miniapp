'use client'

import { ReactNode, useEffect, useState } from 'react'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base, baseSepolia } from 'wagmi/chains'

interface MiniKitProviderProps {
  children: ReactNode
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isMiniApp, setIsMiniApp] = useState(false)
  
  useEffect(() => {
    // Detect if running inside Coinbase Super App
    const detectMiniApp = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isCoinbaseApp = userAgent.includes('coinbase') || 
                           userAgent.includes('miniapp') ||
                           window.location.href.includes('coinbase.com/miniapp')
      
      console.log('🔍 MiniKit Detection:', {
        userAgent,
        isCoinbaseApp,
        location: window.location.href
      })
      
      setIsMiniApp(isCoinbaseApp)
      
      // Add MiniApp specific styles
      if (isCoinbaseApp) {
        document.body.classList.add('miniapp-mode')
        console.log('✅ MiniApp mode activated')
      }
    }
    
    detectMiniApp()
  }, [])
  
  // Use Base Sepolia for testnet
  const chain = baseSepolia
  
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={chain}
      config={{
        appearance: {
          mode: 'auto',
          theme: 'base'
        }
      }}
    >
      <div className={`minikit-app ${isMiniApp ? 'in-super-app' : 'in-browser'}`}>
        {children}
      </div>
    </OnchainKitProvider>
  )
}
