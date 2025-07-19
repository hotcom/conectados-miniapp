"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Smartphone, Globe, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CoinbaseSetupGuide() {
  const copyNetworkConfig = () => {
    const config = `Nome da Rede: Base Sepolia
URL RPC: https://sepolia.base.org
Chain ID: 84532
Símbolo da Moeda: ETH
URL do Block Explorer: https://sepolia-explorer.base.org`

    navigator.clipboard.writeText(config)
    alert("Configuração copiada! Cole na sua Coinbase Wallet.")
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <img src="/placeholder.svg?height=32&width=32" alt="Coinbase Wallet" className="w-8 h-8" />
        </div>
        <CardTitle>Configure a Coinbase Wallet para Base Sepolia</CardTitle>
        <p className="text-gray-600 text-sm">Siga este guia passo-a-passo para configurar sua carteira</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Importante:</strong> A Coinbase Wallet não suporta mudança automática de rede. Você precisa
            adicionar e mudar manualmente.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-2">Instale a Coinbase Wallet</h3>
              <p className="text-xs text-gray-600 mb-3">Baixe a extensão para navegador ou app móvel</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a
                    href="https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    Chrome
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="https://www.coinbase.com/wallet" target="_blank" rel="noreferrer">
                    <Smartphone className="w-3 h-3 mr-1" />
                    Mobile
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-2">Adicione a Rede Base Sepolia</h3>
              <p className="text-xs text-gray-600 mb-3">Na Coinbase Wallet: Configurações → Redes → Adicionar Rede</p>
              <div className="bg-white p-3 rounded border text-xs font-mono space-y-1 mb-3">
                <div>
                  <strong>Nome:</strong> Base Sepolia
                </div>
                <div>
                  <strong>RPC:</strong> https://sepolia.base.org
                </div>
                <div>
                  <strong>Chain ID:</strong> 84532
                </div>
                <div>
                  <strong>Símbolo:</strong> ETH
                </div>
                <div>
                  <strong>Explorer:</strong> https://sepolia-explorer.base.org
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={copyNetworkConfig}>
                <Copy className="w-3 h-3 mr-1" />
                Copiar Configuração
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-600">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-2">Obtenha ETH de Teste</h3>
              <p className="text-xs text-gray-600 mb-3">Use um faucet para conseguir ETH gratuito na Base Sepolia</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href="https://www.alchemy.com/faucets/base-sepolia" target="_blank" rel="noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Alchemy Faucet
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="https://faucet.quicknode.com/base/sepolia" target="_blank" rel="noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    QuickNode Faucet
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-green-600">4</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-2">Conecte à Plataforma</h3>
              <p className="text-xs text-gray-600 mb-3">
                Certifique-se de estar na rede Base Sepolia e clique em "Coinbase Wallet"
              </p>
              <Badge variant="secondary" className="text-xs">
                ✅ Pronto para usar!
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              Testnet
            </Badge>
            <span className="text-sm font-medium">Base Sepolia</span>
          </div>
          <p className="text-xs text-blue-800">
            Esta é uma rede de teste. Os tokens não têm valor real e são usados apenas para desenvolvimento e testes.
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <strong>💡 Dica:</strong> Se você já tem a Coinbase Wallet instalada, clique no botão "Adicionar Base
            Sepolia" na plataforma para adicionar a rede automaticamente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
