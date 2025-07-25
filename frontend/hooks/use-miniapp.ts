"use client"

import { useState, useEffect } from 'react'

interface MiniAppEnvironment {
  isMiniApp: boolean
  isInCoinbaseApp: boolean
  userAgent: string
  platform: 'mobile' | 'desktop' | 'unknown'
}

export function useMiniApp(): MiniAppEnvironment {
  const [environment, setEnvironment] = useState<MiniAppEnvironment>({
    isMiniApp: false,
    isInCoinbaseApp: false,
    userAgent: '',
    platform: 'unknown'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const userAgent = navigator.userAgent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    
    // Enhanced detection for Coinbase Super App
    const isInCoinbaseApp = (
      // User Agent checks
      userAgent.includes('CoinbaseWallet') || 
      userAgent.includes('Coinbase') ||
      userAgent.includes('CBWallet') ||
      // URL checks
      window.location.hostname.includes('coinbase') ||
      // Window object checks
      !!(window as any).coinbase ||
      !!(window as any).CoinbaseWalletSDK ||
      // Ethereum provider checks
      (typeof (window as any).ethereum !== 'undefined' && 
       ((window as any).ethereum.isCoinbaseWallet === true ||
        (window as any).ethereum.isCoinbase === true)) ||
      // Referrer checks
      document.referrer.includes('coinbase') ||
      // Manual override for testing
      window.location.search.includes('coinbase=true')
    )

    // Check if it's a MiniApp environment
    const isMiniApp = isInCoinbaseApp || 
                     window.location.search.includes('miniapp=true') ||
                     localStorage.getItem('miniapp_mode') === 'true'

    // Debug logging
    console.log('🔍 MiniApp Detection Debug:')
    console.log('- User Agent:', userAgent)
    console.log('- Hostname:', window.location.hostname)
    console.log('- Search params:', window.location.search)
    console.log('- Referrer:', document.referrer)
    console.log('- window.coinbase:', !!(window as any).coinbase)
    console.log('- window.ethereum.isCoinbaseWallet:', (window as any).ethereum?.isCoinbaseWallet)
    console.log('- isInCoinbaseApp:', isInCoinbaseApp)
    console.log('- isMiniApp:', isMiniApp)

    setEnvironment({
      isMiniApp,
      isInCoinbaseApp,
      userAgent,
      platform: isMobile ? 'mobile' : 'desktop'
    })

    // Add MiniApp specific styles
    if (isMiniApp) {
      document.body.classList.add('miniapp-mode')
      document.documentElement.style.setProperty('--miniapp-safe-area-top', '44px')
      document.documentElement.style.setProperty('--miniapp-safe-area-bottom', '34px')
    }
  }, [])

  return environment
}

// MiniApp specific utilities
export const MiniAppUtils = {
  // Check if feature is available in MiniApp
  isFeatureAvailable: (feature: string): boolean => {
    if (typeof window === 'undefined') return false
    
    const features = ['wallet', 'network', 'transactions', 'camera', 'location']
    return features.includes(feature)
  },

  // Send message to parent Coinbase app
  sendMessageToParent: (message: any) => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({
        type: 'MINIAPP_MESSAGE',
        payload: message
      }, '*')
    }
  },

  // Request permission for features
  requestPermission: async (permission: string): Promise<boolean> => {
    try {
      // In a real MiniApp, this would use Coinbase's permission API
      console.log(`Requesting permission: ${permission}`)
      return true
    } catch (error) {
      console.error('Permission request failed:', error)
      return false
    }
  }
}
