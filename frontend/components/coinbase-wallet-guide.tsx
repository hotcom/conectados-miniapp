import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Smartphone, Globe } from "lucide-react"

export function CoinbaseWalletGuide() {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <img src="/placeholder.svg?height=32&width=32" alt="Coinbase Wallet" className="w-8 h-8" />
        </div>
        <CardTitle>Configure a Coinbase Wallet</CardTitle>
        <p className="text-gray-600 text-sm">
          Para usar a plataforma, você precisa da Coinbase Wallet na rede Base Sepolia
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium text-sm">Instale a Coinbase Wallet</p>
              <p className="text-xs text-gray-600 mb-2">Baixe a extensão ou app móvel</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a
                    href="https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    Extensão
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

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium text-sm">Configure a Base Sepolia</p>
              <p className="text-xs text-gray-600 mb-2">Adicione a rede de teste da Base</p>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                <div>Nome: Base Sepolia</div>
                <div>RPC: https://sepolia.base.org</div>
                <div>Chain ID: 84532</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-600">3</span>
            </div>
            <div>
              <p className="font-medium text-sm">Obtenha ETH de teste</p>
              <p className="text-xs text-gray-600 mb-2">Use um faucet para conseguir ETH gratuito</p>
              <Button size="sm" variant="outline" asChild>
                <a href="https://www.alchemy.com/faucets/base-sepolia" target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Base Sepolia Faucet
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              Testnet
            </Badge>
            <span className="text-xs font-medium">Base Sepolia</span>
          </div>
          <p className="text-xs text-blue-800">
            Esta é uma rede de teste. Os tokens não têm valor real e são usados apenas para desenvolvimento.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
