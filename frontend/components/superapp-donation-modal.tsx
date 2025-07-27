"use client"

import { useState } from 'react'
import { X, CreditCard, QrCode, Wallet, CheckCircle, AlertCircle } from 'lucide-react'
import { useWalletContext } from '@/contexts/wallet-context'
import { ethers } from 'ethers'
import { CAMPAIGN_ABI, CBRL_TOKEN_ADDRESS } from '@/lib/campaign-factory'

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
  onDonationSuccess?: () => void
  campaign: {
    id: string
    title: string
    organizationName: string
    contractAddress?: string
    goal?: number
    raised?: number
  }
}

export default function SuperAppDonationModal({ isOpen, onClose, onDonationSuccess, campaign }: DonationModalProps) {
  const { isConnected, address } = useWalletContext()
  const [step, setStep] = useState<'choice' | 'pix' | 'cbrl' | 'processing' | 'success' | 'error'>('choice')
  const [donationAmount, setDonationAmount] = useState('')
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')

  if (!isOpen) return null

  const handlePixDonation = () => {
    setStep('pix')
  }

  const handleCBRLDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setError('Por favor, insira um valor válido')
      return
    }

    if (!isConnected || !campaign.contractAddress) {
      setError('Carteira não conectada ou campanha inválida')
      return
    }

    setStep('processing')
    setError('')

    try {
      // Create Web3 provider for SuperApp
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const signer = web3Provider.getSigner()
      const amountWei = ethers.utils.parseEther(donationAmount)

      // Optimized single transaction approach
      const campaignContract = new ethers.Contract(campaign.contractAddress, CAMPAIGN_ABI, signer)
      const tokenContract = new ethers.Contract(
        CBRL_TOKEN_ADDRESS,
        [
          'function allowance(address,address) view returns (uint256)', 
          'function approve(address,uint256) returns (bool)',
          'function transfer(address,uint256) returns (bool)'
        ],
        signer
      )

      // Check current allowance
      const currentAllowance = await tokenContract.allowance(address, campaign.contractAddress)
      
      if (currentAllowance.gte(amountWei)) {
        // Already approved, just donate
        console.log('🔄 [SUPERAPP] Making donation (already approved)...')
        const donateTx = await campaignContract.donate(amountWei)
        const receipt = await donateTx.wait()
        setTxHash(receipt.transactionHash)
        console.log('✅ [SUPERAPP] Donation successful:', receipt.transactionHash)
      } else {
        // Need to approve maximum amount to avoid future approvals
        console.log('🔄 [SUPERAPP] Approving maximum cBRL spending for future donations...')
        const maxApproval = ethers.constants.MaxUint256
        const approveTx = await tokenContract.approve(campaign.contractAddress, maxApproval)
        await approveTx.wait()
        console.log('✅ [SUPERAPP] cBRL approved for unlimited spending')
        
        // Now donate
        console.log('🔄 [SUPERAPP] Making donation...')
        const donateTx = await campaignContract.donate(amountWei)
        const receipt = await donateTx.wait()
        setTxHash(receipt.transactionHash)
        console.log('✅ [SUPERAPP] Donation successful:', receipt.transactionHash)
      }
      
      setStep('success')
      
      // Trigger refresh callback
      if (onDonationSuccess) {
        setTimeout(() => onDonationSuccess(), 1000)
      }

    } catch (error: any) {
      console.error('❌ [SUPERAPP] Donation failed:', error)
      setError(error.message || 'Erro na doação')
      setStep('error')
    }
  }

  const generatePixQR = () => {
    // Generate PIX QR code data
    const pixData = {
      key: 'pix@doeagora.com',
      amount: parseFloat(donationAmount),
      description: `Doação para ${campaign.title}`,
      merchant: campaign.organizationName
    }
    
    // This would normally generate a real PIX QR code
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-size="12" fill="black">PIX QR Code</text><text x="100" y="120" text-anchor="middle" font-size="10" fill="gray">R$ ${donationAmount}</text></svg>`
  }

  const resetModal = () => {
    setStep('choice')
    setDonationAmount('')
    setError('')
    setTxHash('')
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Fazer Doação</h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign Info */}
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium text-gray-900">{campaign.title}</h3>
          <p className="text-sm text-gray-600">{campaign.organizationName}</p>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'choice' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da doação (R$)
                </label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCBRLDonation}
                  disabled={!donationAmount || !isConnected}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Doar com cBRL</span>
                </button>

                <button
                  onClick={handlePixDonation}
                  disabled={!donationAmount}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  <span>Doar com PIX</span>
                </button>
                
                <button
                  onClick={handleClose}
                  className="w-full p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'pix' && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <img
                  src={generatePixQR()}
                  alt="PIX QR Code"
                  className="w-48 h-48 mx-auto mb-4 border rounded-lg"
                />
                <p className="text-sm text-gray-600 mb-2">
                  Escaneie o QR Code com seu app do banco
                </p>
                <p className="font-semibold text-lg">R$ {donationAmount}</p>
              </div>
              
              <button
                onClick={resetModal}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Voltar
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div>
                <h3 className="font-medium text-gray-900">Processando doação...</h3>
                <p className="text-sm text-gray-600">Aguarde a confirmação da transação</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <div>
                <h3 className="font-medium text-gray-900">Doação realizada com sucesso!</h3>
                <p className="text-sm text-gray-600 mb-2">R$ {donationAmount} doados</p>
                {txHash && (
                  <p className="text-xs text-gray-500 font-mono break-all">
                    TX: {txHash}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-4">
              <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
              <div>
                <h3 className="font-medium text-gray-900">Erro na doação</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setStep('choice')}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Tentar novamente
                </button>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
