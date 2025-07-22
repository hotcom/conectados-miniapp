"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, AlertCircle, Shield, Zap } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"

interface WalletRequiredProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function WalletRequired({
  children,
  title = "Carteira Necessária",
  description = "Conecte sua carteira para continuar",
}: WalletRequiredProps) {
  const { isConnected, connect, isConnecting } = useWalletContext()

  if (isConnected) {
    return <>{children}</>
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>{title}</CardTitle>
          <p className="text-gray-600 text-sm">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Sua carteira é usada para autenticar e assinar transações de forma segura.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Zap className="w-4 h-4 text-green-600" />
              <span>Conexão segura via Web3</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Suas chaves permanecem privadas</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span>Necessário para criar posts</span>
            </div>
          </div>

          <Button onClick={connect} disabled={isConnecting} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
            <Wallet className="w-4 h-4 mr-2" />
            {isConnecting ? "Conectando..." : "Conectar Carteira"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Suportamos MetaMask, WalletConnect e outras carteiras Web3
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
