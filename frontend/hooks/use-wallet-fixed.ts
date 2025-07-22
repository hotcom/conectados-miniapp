"use client"

import { useState, useEffect } from "react"

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  isConnecting: boolean
  network: string | null
  chainId: string | null
}

// Base Sepolia network configuration
const BASE_SEPOLIA_CONFIG = {
  chainId: "0x14A34", // 84532 in hex
  chainName: "Base Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.base.org"],
  blockExplorerUrls: ["https://sepolia-explorer.base.org"],
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    network: null,
    chainId: null,
  })

  // Setup wallet listeners on mount (but don't auto-connect)
  useEffect(() => {
    // Verificar se estamos no browser e se a wallet está disponível
    const isClient = typeof window !== 'undefined'
    const hasEthereum = isClient && typeof window.ethereum !== 'undefined'

    if (!isClient) {
      console.log('Ambiente não é browser, wallet não disponível')
      return
    }

    if (!hasEthereum) {
      console.log('Wallet não detectada, redirecionando para instalação')
      return
    }

    const ethereum = (window as any).ethereum

    // Setup event listeners
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Contas alteradas:', accounts)
      if (accounts.length === 0) {
        // User disconnected
        setWallet({
          isConnected: false,
          address: null,
          balance: null,
          isConnecting: false,
          network: null,
          chainId: null,
        })
      } else {
        // Account changed
        setWallet(prev => ({ ...prev, address: accounts[0] }))
        updateBalance(accounts[0])
      }
    }

    const handleChainChanged = (chainId: string) => {
      console.log('Rede alterada:', chainId)
      setWallet(prev => ({ ...prev, chainId, network: getNetworkName(chainId) }))
    }

    // Add listeners
    if (ethereum.on) {
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)
    }

    // Cleanup listeners
    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
        ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const getNetworkName = (chainId: string): string => {
    if (chainId.toUpperCase() === BASE_SEPOLIA_CONFIG.chainId.toUpperCase()) {
      return "Base Sepolia"
    } else {
      return "Unknown Network"
    }
  }

  const addBaseSepolia = async () => {
    try {
      const ethereum = (window as any).ethereum
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [BASE_SEPOLIA_CONFIG],
      })
    } catch (error) {
      console.error('Erro ao adicionar rede Base Sepolia:', error)
    }
  }

  const updateBalance = async (address: string) => {
    try {
      const ethereum = (window as any).ethereum
      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })
      
      if (balance) {
        setWallet(prev => ({
          ...prev,
          balance: `${(Number.parseInt(balance, 16) / 1e18).toFixed(4)} ETH`,
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar saldo:', error)
    }
  }

  const switchToBaseSepolia = async () => {
    try {
      const ethereum = (window as any).ethereum
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CONFIG.chainId }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet, add it
        await addBaseSepolia()
      } else {
        throw error
      }
    }
  }

  const detectWalletProvider = (preferredWallet?: 'metamask' | 'coinbase') => {
    const ethereum = (window as any).ethereum
    
    if (!ethereum) {
      console.log("Nenhum provider Ethereum detectado")
      return null
    }

    console.log("Ethereum provider detectado:", {
      isMetaMask: ethereum.isMetaMask,
      isCoinbaseWallet: ethereum.isCoinbaseWallet,
      isCoinbase: ethereum.isCoinbase,
      selectedProvider: ethereum.selectedProvider,
      providers: ethereum.providers?.length || 0,
    })

    // Se há múltiplos providers
    if (ethereum.providers && ethereum.providers.length > 0) {
      console.log(`Detectados ${ethereum.providers.length} providers`)
      
      if (preferredWallet === 'metamask') {
        console.log("Procurando MetaMask específico")
        const metamask = ethereum.providers.find((p: any) => p.isMetaMask)
        if (metamask) {
          console.log("✅ MetaMask encontrado!")
          return metamask
        }
      } else if (preferredWallet === 'coinbase') {
        console.log("=== TENTANDO DETECTAR COINBASE WALLET ===")
        
        // Verificar se realmente existe Coinbase Wallet
        let realCoinbase = null
        
        // Buscar apenas por sinais claros e inequívocos de Coinbase Wallet
        if (ethereum.providers && ethereum.providers.length > 0) {
          realCoinbase = ethereum.providers.find((p: any) => {
            return p.isCoinbaseWallet === true || 
                   p.isCoinbase === true ||
                   (p.constructor && p.constructor.name === 'CoinbaseWalletProvider')
          })
        }
        
        if (realCoinbase) {
          console.log("✅ Coinbase Wallet REALMENTE encontrada!", realCoinbase)
          return realCoinbase
        } else {
          console.log("⚠️ Coinbase Wallet NÃO encontrada - mostrando alerta")
          
          // SEMPRE mostrar alerta quando Coinbase não está instalada
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
            console.log("✅ Usando MetaMask como fallback")
            return metamask
          } else {
            console.log("⚠️ Nem MetaMask encontrada!")
            return ethereum.providers[0] || ethereum
          }
        }
      }
      
      // Fallback para detecção automática
      console.log("Usando detecção automática de provider")
      if (ethereum.selectedProvider) {
        console.log("Usando selectedProvider")
        return ethereum.selectedProvider
      } else {
        console.log("Usando primeiro provider disponível")
        return ethereum.providers[0]
      }
    } else {
      // Provider único
      console.log("Provider único detectado")
      if (preferredWallet === 'coinbase' && !ethereum.isCoinbaseWallet && !ethereum.isCoinbase) {
        console.log("Coinbase solicitada mas não detectada")
        return null
      } else if (preferredWallet === 'metamask' && !ethereum.isMetaMask) {
        console.log("MetaMask solicitada mas não detectada")
        return null
      } else {
        console.log("Usando provider único")
        if (ethereum.providers && ethereum.providers.length > 0) {
          return ethereum.providers[0]
        } else {
          return ethereum // Usar mesmo assim, pode funcionar
        }
      }
      
      return ethereum
    }
    
    return null
  }

  const connect = async (walletType?: 'metamask' | 'coinbase') => {
    console.log('Iniciando conexão da carteira...')
    
    // VERIFICAÇÃO ESPECIAL PARA COINBASE WALLET
    if (walletType === 'coinbase') {
      console.log("=== VERIFICANDO COINBASE WALLET ANTES DA CONEXÃO ===")
      
      const ethereum = (window as any).ethereum
      if (!ethereum) {
        alert("Nenhuma carteira Ethereum detectada. Por favor, instale MetaMask ou Coinbase Wallet.")
        return
      }
      
      // Verificar se realmente existe Coinbase Wallet
      let realCoinbase = null
      
      if (ethereum.providers && ethereum.providers.length > 0) {
        realCoinbase = ethereum.providers.find((p: any) => {
          return p.isCoinbaseWallet === true || 
                 p.isCoinbase === true ||
                 (p.constructor && p.constructor.name === 'CoinbaseWalletProvider')
        })
      }
      
      if (!realCoinbase) {
        console.log("⚠️ Coinbase Wallet NÃO encontrada - mostrando alerta e parando")
        
        alert(
          "⚠️ Coinbase Wallet não detectada!\n\n" +
            "Para usar a Coinbase Wallet:\n" +
            "• Instale a extensão Coinbase Wallet no Chrome\n" +
            "• Certifique-se que está ativa no navegador\n" +
            "• Recarregue a página após instalar\n\n" +
            "Tente conectar com MetaMask como alternativa."
        )
        
        return // PARA AQUI - não tenta conectar
      }
      
      console.log("✅ Coinbase Wallet encontrada, prosseguindo com conexão")
    }
    
    const provider = detectWalletProvider(walletType)
    if (!provider) {
      alert("Por favor, instale uma carteira Ethereum compatível (MetaMask ou Coinbase Wallet).")
      return
    }

    if (wallet.isConnecting) {
      console.log("Já está conectando, ignorando nova tentativa")
      return
    }

    console.log("Iniciando conexão da carteira...")
    setWallet((prev) => ({ ...prev, isConnecting: true }))

    // Configurar timeout (mais tempo para Coinbase Wallet)
    const timeoutDuration = walletType === 'coinbase' ? 30000 : 15000 // 30s para Coinbase, 15s para outros
    const timeoutId = setTimeout(() => {
      console.log(`Timeout na conexão da carteira após ${timeoutDuration/1000}s`)
      setWallet((prev) => ({ ...prev, isConnecting: false }))
      
      if (walletType === 'coinbase') {
        alert(
          "⏰ Timeout na conexão da Coinbase Wallet.\n\n" +
            "A Coinbase Wallet pode demorar mais para responder.\n\n" +
            "Verifique se:\n" +
            "• A extensão está instalada e ativa\n" +
            "• A carteira está desbloqueada\n" +
            "• Não há outras abas usando a carteira\n\n" +
            "Tente novamente ou use MetaMask."
        )
      } else {
        alert(
          "⏰ Timeout na conexão da carteira.\n\n" +
            "Verifique se sua carteira está desbloqueada e tente novamente."
        )
      }
    }, timeoutDuration)

    try {
      console.log(`Solicitando contas com provider: ${walletType || 'auto'}`)
      
      let accounts
      try {
        accounts = await provider.request({ method: "eth_requestAccounts" })
      } catch (requestError: any) {
        console.log("Tentativa com eth_requestAccounts falhou, tentando enable():", requestError)
        if (provider.enable) {
          accounts = await provider.enable()
        } else {
          throw requestError
        }
      }

      clearTimeout(timeoutId) // Limpar timeout em caso de sucesso

      if (accounts && accounts.length > 0) {
        console.log("Contas obtidas:", accounts)
        const address = accounts[0]
        const chainId = await provider.request({ method: "eth_chainId" })
        const networkName = getNetworkName(chainId)

        console.log(`Conectado com sucesso! Endereço: ${address}, Rede: ${networkName} (${chainId})`)

        setWallet({
          isConnected: true,
          address,
          balance: null,
          isConnecting: false,
          network: networkName,
          chainId,
        })

        // Buscar saldo
        updateBalance(address)

        // Verificar se está na rede correta (Base Sepolia)
        if (chainId.toUpperCase() !== BASE_SEPOLIA_CONFIG.chainId.toUpperCase()) {
          console.log(`Rede atual: ${chainId}, esperada: ${BASE_SEPOLIA_CONFIG.chainId}`)
          
          // Perguntar se quer trocar para Base Sepolia
          const shouldSwitch = confirm(
            `Você está conectado na rede ${networkName}.\n\n` +
              "Para usar todas as funcionalidades (doações, cBRL, transparência on-chain), " +
              "é recomendado usar a rede Base Sepolia testnet.\n\n" +
              "Deseja trocar para Base Sepolia agora?"
          )

          if (shouldSwitch) {
            try {
              console.log("Tentando trocar para Base Sepolia...")
              await switchToBaseSepolia()
              console.log("Rede trocada com sucesso!")
            } catch (switchError: any) {
              console.error("Erro ao trocar rede:", switchError)
              if (switchError.code === 4902) {
                // Rede não existe, tentar adicionar
                console.log("Rede não existe, tentando adicionar...")
                try {
                  await addBaseSepolia()
                  console.log("Rede Base Sepolia adicionada com sucesso!")
                } catch (addError) {
                  console.error("Erro ao adicionar rede:", addError)
                  alert(
                    "Erro ao adicionar Base Sepolia.\n\n" +
                      "Por favor, adicione manualmente na sua carteira:\n" +
                      "• Nome: Base Sepolia\n" +
                      "• RPC: https://sepolia.base.org\n" +
                      "• Chain ID: 84532\n" +
                      "• Símbolo: ETH"
                  )
                }
              } else {
                console.error("Erro desconhecido ao trocar rede:", switchError)
                alert(
                  "Erro ao trocar para Base Sepolia.\n\n" +
                    "Por favor, troque manualmente na sua carteira para a rede Base Sepolia testnet."
                )
              }
            }
          } else {
            alert(
              "⚠️ Atenção: Você está usando uma rede diferente da Base Sepolia.\n\n" +
                "Algumas funcionalidades podem não funcionar corretamente.\n\n" +
                "Para usar todas as funcionalidades (doações, cBRL, transparência on-chain), " +
                "troque para a rede Base Sepolia testnet na sua carteira."
            )
          }
        }
      } else {
        console.log("Nenhuma conta encontrada")
        clearTimeout(timeoutId)
        setWallet((prev) => ({ ...prev, isConnecting: false }))
        alert("Nenhuma conta encontrada. Verifique se sua carteira está desbloqueada.")
      }
    } catch (error: any) {
      clearTimeout(timeoutId) // Limpar timeout em caso de erro
      console.error("Erro na conexão:", error)
      setWallet((prev) => ({ ...prev, isConnecting: false }))

      if (error.code === 4001) {
        console.log("Usuário rejeitou a conexão")
        alert("Conexão rejeitada pelo usuário.")
      } else if (error.code === -32002) {
        console.log("Solicitação pendente")
        alert("Já existe uma solicitação de conexão pendente. Verifique sua carteira e feche outras abas que possam estar usando a carteira.")
      } else if (error.code === -32603) {
        console.log("Erro interno da carteira")
        alert("Erro interno da carteira. Tente recarregar a página e conectar novamente.")
      } else {
        console.log("Erro desconhecido:", error)
        alert(`Erro ao conectar carteira: ${error.message || 'Erro desconhecido'}. \n\nDicas:\n- Verifique se sua carteira está desbloqueada\n- Feche outras abas usando a carteira\n- Recarregue a página e tente novamente`)
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
    localStorage.removeItem("walletConnected")
  }

  const isCorrectNetwork = wallet.chainId?.toUpperCase() === BASE_SEPOLIA_CONFIG.chainId.toUpperCase()

  return {
    ...wallet,
    connect,
    disconnect,
    addBaseSepolia,
    isCorrectNetwork,
  }
}
