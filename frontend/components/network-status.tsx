"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Wifi, ExternalLink } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"

export function NetworkStatus() {
  const { isConnected, network, isCorrectNetwork, addBaseSepolia } = useWallet()

  if (!isConnected) {
    return null
  }

  if (isCorrectNetwork) {
    return (
      <Alert className="border-green-200 bg-green-50 mb-4">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>✅ Conectado à Base Sepolia</span>
            <div className="flex items-center gap-1 text-xs">
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const handleAddNetwork = async () => {
    const success = await addBaseSepolia()
    if (success) {
      alert(
        "✅ Rede Base Sepolia adicionada com sucesso!\n\nAgora você precisa:\n1. Abrir sua Coinbase Wallet\n2. Mudar para a rede 'Base Sepolia' manualmente",
      )
    }
  }

  const openWalletGuide = () => {
    window.open(
      "https://help.coinbase.com/en/wallet/managing-account/how-to-add-a-custom-network-on-coinbase-wallet",
      "_blank",
    )
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-medium">⚠️ Rede Incorreta Detectada</p>
            <p className="text-sm">
              Você está conectado à: <strong>{network}</strong>
            </p>
            <p className="text-sm">
              É necessário estar na <strong>Base Sepolia</strong> para usar a plataforma.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleAddNetwork} className="bg-orange-600 hover:bg-orange-700">
              Adicionar Base Sepolia
            </Button>
            <Button size="sm" variant="outline" onClick={openWalletGuide}>
              <ExternalLink className="w-3 h-3 mr-1" />
              Guia da Coinbase
            </Button>
          </div>

          <div className="bg-orange-100 p-2 rounded text-xs">
            <p className="font-medium mb-1">📋 Configuração Manual:</p>
            <div className="font-mono text-xs space-y-1">
              <div>Nome: Base Sepolia</div>
              <div>RPC: https://sepolia.base.org</div>
              <div>Chain ID: 84532</div>
              <div>Símbolo: ETH</div>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
