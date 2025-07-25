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
    
    // More precise detection for Coinbase Super App
    const isInCoinbaseApp = (
      // Primary: Check if running in actual Coinbase app (not just extension)
      (userAgent.includes('CoinbaseWallet') && isMobile) ||
      (userAgent.includes('Coinbase') && userAgent.includes('Mobile')) ||
      // Secondary: URL-based detection (when hosted by Coinbase)
      window.location.hostname.includes('coinbase.com') ||
      // Tertiary: Referrer from Coinbase app (not extension)
      (document.referrer.includes('coinbase') && !document.referrer.includes('chrome-extension')) ||
      // Manual override for testing
      window.location.search.includes('coinbase=true') ||
      // Check for specific Coinbase app environment variables
      !!(window as any).CoinbaseAppSDK ||
      (typeof (window as any).ReactNativeWebView !== 'undefined')
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
