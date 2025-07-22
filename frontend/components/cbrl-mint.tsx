"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Coins, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useWalletContext } from "@/contexts/wallet-context"
import { mintCBRLTokens, getCBRLBalance, isCBRLOwner } from "@/lib/cbrl-mint"
import { formatBRL } from "@/lib/campaign-factory"

export function CBRLMintComponent() {
  const [mintAmount, setMintAmount] = useState("1000")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState("")
  const [balance, setBalance] = useState("0")
  const [isOwner, setIsOwner] = useState(false)
  
  const { isConnected, address, connect } = useWalletContext()

  const checkOwnerAndBalance = async () => {
    if (!address) return
    
    try {
      const [ownerStatus, currentBalance] = await Promise.all([
        isCBRLOwner(address),
        getCBRLBalance(address)
      ])
      
      setIsOwner(ownerStatus)
      setBalance(currentBalance)
    } catch (error) {
      console.error('Error checking owner/balance:', error)
    }
  }

  const handleMint = async () => {
    if (!address || !mintAmount) return
    
    setIsLoading(true)
    setStatus("Preparando mint de tokens cBRL...")
    
    try {
      const amount = parseFloat(mintAmount)
      if (amount <= 0) {
        throw new Error("Valor deve ser maior que zero")
      }
      
      setStatus("Fazendo mint dos tokens...")
      const txHash = await mintCBRLTokens(address, amount)
      
      setStatus("Atualizando saldo...")
      await checkOwnerAndBalance()
      
      alert(`🎉 Mint realizado com SUCESSO!

💰 Valor: ${formatBRL(amount)} cBRL
🔗 Transação: ${txHash}

✅ Agora você pode fazer doações on-chain!

🔗 Ver no BaseScan:
https://sepolia.basescan.org/tx/${txHash}`)
      
      setMintAmount("")
      
    } catch (error: any) {
      console.error('Error minting tokens:', error)
      
      let errorMessage = "Erro ao fazer mint dos tokens."
      
      if (error.message.includes('Ownable: caller is not the owner')) {
        errorMessage = "❌ Apenas o owner do contrato cBRL pode fazer mint.\n\nPara testes, use a carteira que deployou o contrato cBRL."
      } else if (error.message.includes('user rejected')) {
        errorMessage = "Transação cancelada pelo usuário."
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
      setStatus("")
    }
  }

  const addTokenToMetaMask = async () => {
    try {
      const wasAdded = await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: '0x0f628966ea621e7283e9AB3C7935A626b9607718',
            symbol: 'cBRL',
            decimals: 18,
            image: 'https://via.placeholder.com/64x64.png?text=cBRL',
          },
        },
      })
      
      if (wasAdded) {
        alert('✅ Token cBRL adicionado à MetaMask com sucesso!\n\nAgora você deve ver seus tokens na carteira.')
        // Refresh balance after adding token
        await checkOwnerAndBalance()
      }
    } catch (error) {
      console.error('Error adding token to MetaMask:', error)
      alert('❌ Erro ao adicionar token à MetaMask.\n\nTente adicionar manualmente:\n\nEndereço: 0x0f628966ea621e7283e9AB3C7935A626b9607718\nSímbolo: cBRL\nDecimais: 18')
    }
  }

  // Check owner status when wallet connects
  React.useEffect(() => {
    if (isConnected && address) {
      checkOwnerAndBalance()
    }
  }, [isConnected, address])

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Mint cBRL (Teste)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Conecte sua carteira para fazer mint de tokens cBRL para teste.
              <Button onClick={() => connect()} className="ml-2" size="sm">
                Conectar Carteira
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Mint cBRL (Teste)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800 mb-1">
            <strong>Seu saldo atual:</strong> {formatBRL(parseFloat(balance))} cBRL
          </p>
          <p className="text-xs text-blue-600 mb-2">
            Endereço: {address}
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkOwnerAndBalance}
              disabled={isLoading}
            >
              🔄 Atualizar Saldo
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={addTokenToMetaMask}
              disabled={isLoading}
            >
              🦊 Adicionar à MetaMask
            </Button>
          </div>
        </div>

        {!isOwner && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Aviso:</strong> Apenas o owner do contrato cBRL pode fazer mint. 
              Se você não é o owner, use uma carteira que tenha permissão de mint.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Quantidade para mint (cBRL)
          </label>
          <Input
            type="number"
            placeholder="1000"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[100, 500, 1000, 5000].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => setMintAmount(amount.toString())}
              disabled={isLoading}
            >
              {amount}
            </Button>
          ))}
        </div>

        <Button
          onClick={handleMint}
          className="w-full"
          disabled={isLoading || !mintAmount || parseFloat(mintAmount) <= 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {status || "Processando..."}
            </>
          ) : (
            <>
              <Coins className="w-4 h-4 mr-2" />
              Mint {mintAmount} cBRL
            </>
          )}
        </Button>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Para testes:</strong> Esta função permite criar tokens cBRL para testar doações. 
            Em produção, tokens são criados via PIX através do backend.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
