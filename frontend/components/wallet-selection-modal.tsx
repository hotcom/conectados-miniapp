"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet, X } from "lucide-react"

interface WalletSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletType?: 'metamask' | 'coinbase') => Promise<void>
}

export function WalletSelectionModal({ isOpen, onClose, onConnect }: WalletSelectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async (walletType?: 'metamask' | 'coinbase') => {
    setIsConnecting(true)
    try {
      await onConnect(walletType)
      onClose()
    } catch (error) {
      console.error('Erro ao conectar:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Conectar Carteira
          </DialogTitle>
          <DialogDescription>
            Conecte sua carteira para começar a usar a plataforma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* MetaMask Option */}
          <Button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="w-full h-12 text-left justify-start gap-3"
            variant="outline"
          >
            <span className="text-2xl">🦊</span>
            <div>
              <div className="font-medium">MetaMask</div>
              <div className="text-sm text-muted-foreground">
                Conectar com MetaMask
              </div>
            </div>
          </Button>

          {/* Coinbase Wallet Option */}
          <Button
            onClick={() => handleConnect('coinbase')}
            disabled={isConnecting}
            className="w-full h-12 text-left justify-start gap-3"
            variant="outline"
          >
            <span className="text-2xl">🔵</span>
            <div>
              <div className="font-medium">Coinbase Wallet</div>
              <div className="text-sm text-muted-foreground">
                Conectar com Coinbase Wallet
              </div>
            </div>
          </Button>

          {(typeof window !== 'undefined' && !window?.ethereum) && (
            <div className="text-center space-y-2 pt-2">
              <p className="text-sm text-muted-foreground">
                Nenhuma carteira detectada
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                >
                  Instalar MetaMask
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
                >
                  Instalar Coinbase
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  )
}
