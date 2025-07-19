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

  // Check if wallet is already connected on mount
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

    checkConnection()

    // Listen for account changes
    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [])

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      checkConnection()
    }
  }

  const handleChainChanged = (chainId: string) => {
    // Reload the page when chain changes to avoid issues
    window.location.reload()
  }

  const getNetworkName = (chainId: string) => {
    switch (chainId) {
      case "0x14A34": // 84532
        return "Base Sepolia"
      case "0x2105": // 8453
        return "Base Mainnet"
      case "0x1":
        return "Ethereum Mainnet"
      case "0x89":
        return "Polygon"
      case "0xaa36a7":
        return "Sepolia"
      default:
        return "Rede Desconhecida"
    }
  }

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })

        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          })

          const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          })

          setWallet({
            isConnected: true,
            address: accounts[0],
            balance: `${(Number.parseInt(balance, 16) / 1e18).toFixed(4)} ETH`,
            isConnecting: false,
            network: getNetworkName(chainId),
            chainId: chainId,
          })
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  const addBaseSepolia = async () => {
    if (!window.ethereum) return false

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BASE_SEPOLIA_CONFIG],
      })
      return true
    } catch (error) {
      console.error("Error adding Base Sepolia network:", error)
      return false
    }
  }

  const connect = async () => {
    if (typeof window === "undefined") {
      console.log('Ambiente não é browser')
      return
    }

    if (!window.ethereum) {
      window.open('https://www.coinbase.com/wallet', '_blank')
      alert("Por favor, instale a Coinbase Wallet para continuar!\n\nVocê será redirecionado para a página de download.")
      return
    }

    setWallet((prev) => ({ ...prev, isConnecting: true }))

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })

        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        })

        setWallet({
          isConnected: true,
          address: accounts[0],
          balance: `${(Number.parseInt(balance, 16) / 1e18).toFixed(4)} ETH`,
          isConnecting: false,
          network: getNetworkName(chainId),
          chainId: chainId,
        })

        // Store connection in localStorage
        localStorage.setItem("walletConnected", "true")

        // If not on Base Sepolia, show instructions
        if (chainId !== BASE_SEPOLIA_CONFIG.chainId) {
          setTimeout(() => {
            alert(
              "⚠️ Você não está na rede Base Sepolia!\n\n" +
                "Para usar a plataforma, você precisa:\n" +
                "1. Abrir sua Coinbase Wallet\n" +
                "2. Ir em Configurações > Redes\n" +
                "3. Adicionar a rede Base Sepolia\n" +
                "4. Ou clicar em 'Adicionar Base Sepolia' abaixo",
            )
          }, 1000)
        }
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setWallet((prev) => ({ ...prev, isConnecting: false }))

      if (error.code === 4001) {
        alert("Conexão rejeitada pelo usuário.")
      } else if (error.code === -32002) {
        alert("Já existe uma solicitação de conexão pendente. Verifique sua carteira.")
      } else {
        alert("Erro ao conectar carteira. Verifique se você está usando a Coinbase Wallet.")
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

  const isCorrectNetwork = wallet.chainId === BASE_SEPOLIA_CONFIG.chainId

  return {
    ...wallet,
    connect,
    disconnect,
    addBaseSepolia,
    isCorrectNetwork,
  }
}
