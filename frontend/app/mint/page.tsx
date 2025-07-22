import { Header } from "@/components/header"
import { CBRLMintComponent } from "@/components/cbrl-mint"

export default function MintPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🪙 Mint cBRL para Testes
          </h1>
          <p className="text-gray-600">
            Crie tokens cBRL para testar doações on-chain na Base Sepolia.
          </p>
        </div>
        
        <CBRLMintComponent />
        
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Como usar:</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Conecte sua carteira (MetaMask ou Coinbase)</li>
            <li>2. Escolha a quantidade de cBRL para mint</li>
            <li>3. Clique em "Mint cBRL"</li>
            <li>4. Confirme a transação na sua carteira</li>
            <li>5. Aguarde a confirmação na blockchain</li>
            <li>6. Use os tokens para fazer doações!</li>
          </ol>
        </div>
        
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Importante:</strong> Esta função só funciona se você for o owner do contrato cBRL. 
            Para testes, use a carteira que deployou o contrato cBRL original.
          </p>
        </div>
      </div>
    </div>
  )
}
