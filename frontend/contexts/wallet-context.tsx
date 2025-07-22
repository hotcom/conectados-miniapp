"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  isConnecting: boolean
  network: string | null
  chainId: string | null
}

interface WalletContextType extends WalletState {
  connect: (walletType?: 'metamask' | 'coinbase') => Promise<void>
  disconnect: () => void
  addBaseSepolia: () => Promise<void>
  isCorrectNetwork: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Base Sepolia network configuration
const BASE_SEPOLIA_CONFIG = {
  chainId: '0x14A34', // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia-explorer.base.org'],
}

// Helper function to get network name
const getNetworkName = (chainId: string) => {
  switch (chainId.toUpperCase()) {
    case '0x1':
      return 'Ethereum Mainnet'
    case '0x89':
      return 'Polygon'
    case '0x2105':
      return 'Base'
    case '0x14A34':
      return 'Base Sepolia'
    default:
      return `Unknown (${chainId})`
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    network: null,
    chainId: null,
  })

  const network = wallet.chainId ? getNetworkName(wallet.chainId) : null
  const isCorrectNetwork = wallet.chainId?.toUpperCase() === BASE_SEPOLIA_CONFIG.chainId.toUpperCase()

  // Setup event listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('🔄 Accounts changed:', accounts)
        if (accounts.length === 0) {
          setWallet({
            isConnected: false,
            address: null,
            balance: null,
            isConnecting: false,
            network: null,
            chainId: null,
          })
        } else {
          setWallet(prev => ({ ...prev, address: accounts[0] }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log('🔄 Chain changed:', chainId)
        const networkName = getNetworkName(chainId)
        setWallet(prev => ({ ...prev, chainId, network: networkName }))
      }

      ;(window.ethereum as any).on('accountsChanged', handleAccountsChanged)
      ;(window.ethereum as any).on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum) {
          ;(window.ethereum as any).removeListener('accountsChanged', handleAccountsChanged)
          ;(window.ethereum as any).removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [])

  // Function to get the correct provider
  const getProvider = (preferredWallet?: 'metamask' | 'coinbase') => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return null

    // If multiple providers exist
    if (ethereum.providers && ethereum.providers.length > 0) {
      console.log(`Múltiplos providers detectados (${ethereum.providers.length})`)
      
      if (preferredWallet === 'metamask') {
        const metamask = ethereum.providers.find((p: any) => p.isMetaMask)
        if (metamask) {
          console.log('✅ MetaMask encontrada')
          return metamask
        }
      } else if (preferredWallet === 'coinbase') {
        const coinbase = ethereum.providers.find((p: any) => 
          p.isCoinbaseWallet === true || 
          p.isCoinbase === true ||
          (p.constructor && p.constructor.name === 'CoinbaseWalletProvider')
        )
        if (coinbase) {
          console.log('✅ Coinbase Wallet encontrada')
          return coinbase
        } else {
          console.log('⚠️ Coinbase Wallet não encontrada')
          alert(
            "⚠️ Coinbase Wallet não detectada!\n\n" +
            "Para usar a Coinbase Wallet:\n" +
            "• Instale a extensão Coinbase Wallet no Chrome\n" +
            "• Certifique-se que está ativa no navegador\n" +
            "• Recarregue a página após instalar\n\n" +
            "Conectando com MetaMask como alternativa..."
          )
          
          // Usar MetaMask como fallback
          const metamask = ethereum.providers.find((p: any) => p.isMetaMask)
          if (metamask) {
            console.log('✅ Usando MetaMask como fallback')
            return metamask
          }
        }
      }
      
      // Fallback para detecção automática
      console.log('Usando detecção automática de provider')
      return ethereum.providers[0]
    } else {
      // Provider único
      console.log('Provider único detectado')
      return ethereum
    }
  }

  const connect = async (walletType?: 'metamask' | 'coinbase') => {
    console.log('🚀 Iniciando conexão da carteira...', walletType)
    
    if (!window.ethereum) {
      alert('Nenhuma carteira Ethereum detectada. Por favor, instale MetaMask ou Coinbase Wallet.')
      return
    }

    setWallet(prev => ({ ...prev, isConnecting: true }))

    try {
      const provider = getProvider(walletType)
      if (!provider) {
        throw new Error('Provider não encontrado')
      }

      console.log('🔍 Verificando se carteira está responsiva...')
      
      // "Wake-up" call para garantir que a carteira está responsiva
      try {
        await provider.request({ method: 'eth_accounts' })
        console.log('✅ Carteira está responsiva')
      } catch (wakeupError) {
        console.log('⚠️ Wake-up falhou, continuando...', wakeupError)
      }

      console.log('🔗 Solicitando conexão...')
      
      // Timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Carteira não respondeu em 15 segundos')), 15000)
      })

      const connectPromise = provider.request({
        method: 'eth_requestAccounts',
      })

      const accounts = await Promise.race([connectPromise, timeoutPromise]) as string[]
      
      console.log('✅ Contas obtidas:', accounts)

      if (accounts && accounts.length > 0) {
        const chainId = await provider.request({ method: 'eth_chainId' })
        const networkName = getNetworkName(chainId)
        console.log('🌐 Chain ID:', chainId, 'Network:', networkName)
        
        setWallet({
          isConnected: true,
          address: accounts[0],
          balance: null,
          isConnecting: false,
          network: networkName,
          chainId,
        })

        console.log('🎉 Carteira conectada com sucesso!')
        
        // Verificar se está na rede correta (só se não for Base Sepolia)
        if (chainId.toUpperCase() !== BASE_SEPOLIA_CONFIG.chainId.toUpperCase()) {
          console.log(`Rede atual: ${chainId}, esperada: ${BASE_SEPOLIA_CONFIG.chainId}`)
          
          const shouldSwitch = confirm(
            `Você está conectado na rede ${networkName}.\n\n` +
            'Para usar este app, você precisa estar na rede Base Sepolia.\n\n' +
            'Deseja trocar automaticamente?'
          )
          
          if (shouldSwitch) {
            await addBaseSepolia()
          }
        } else {
          console.log('✅ Já está na rede Base Sepolia!')
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao conectar carteira:', error)
      setWallet(prev => ({ ...prev, isConnecting: false }))
      
      if (error.code === 4001) {
        alert('Conexão rejeitada pelo usuário.')
      } else if (error.code === -32002) {
        alert('Já existe uma solicitação de conexão pendente. Verifique sua carteira.')
      } else if (error.message.includes('Timeout')) {
        alert(
          'A carteira não respondeu.\n\n' +
          'Tente:\n' +
          '• Desbloquear sua carteira\n' +
          '• Permitir popups neste site\n' +
          '• Recarregar a página'
        )
      } else {
        alert('Erro ao conectar carteira. Tente novamente.')
      }
    }
  }

  const disconnect = () => {
    setWallet({
      isConnected: false,
      address: null,
      balance: null,
      isConnecting: false,
      network: null,
      chainId: null,
    })
    
    // Limpar localStorage relacionado
    localStorage.removeItem('walletconnect')
    localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE')
    
    console.log('🔌 Carteira desconectada')
  }

  const addBaseSepolia = async () => {
    if (!window.ethereum) {
      throw new Error('Carteira não está instalada')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BASE_SEPOLIA_CONFIG],
      })
      console.log('✅ Rede Base Sepolia adicionada')
    } catch (error: any) {
      console.error('❌ Erro ao adicionar rede:', error)
      throw error
    }
  }

  return (
    <WalletContext.Provider
      value={{
        ...wallet,
        network,
        connect,
        disconnect,
        addBaseSepolia,
        isCorrectNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}
