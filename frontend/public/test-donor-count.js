// TESTE MANUAL DO CONTADOR DE DOADORES ÚNICOS
// Cole este código no console do navegador

async function testDonorCount() {
  console.log('🧪 TESTE MANUAL DO CONTADOR DE DOADORES ÚNICOS')
  
  // 1. Verificar se há campanhas
  const campaignElements = document.querySelectorAll('[data-campaign-id]')
  console.log('📊 Campanhas encontradas:', campaignElements.length)
  
  if (campaignElements.length === 0) {
    console.log('❌ PROBLEMA: Não há campanhas no feed')
    console.log('💡 SOLUÇÃO: Verifique se você criou campanhas ou se o feed está carregando')
    return
  }
  
  // 2. Verificar carteira
  if (!window.ethereum) {
    console.log('❌ PROBLEMA: Ethereum não disponível')
    console.log('💡 SOLUÇÃO: Instale MetaMask ou Coinbase Wallet')
    return
  }
  
  console.log('✅ Ethereum disponível')
  
  // 3. Verificar se há contratos
  const contractAddresses = []
  campaignElements.forEach((el, index) => {
    const contractAddr = el.getAttribute('data-contract-address')
    console.log(`📋 Campanha ${index + 1}:`, {
      id: el.getAttribute('data-campaign-id'),
      contractAddress: contractAddr
    })
    if (contractAddr && contractAddr !== 'null' && contractAddr !== 'undefined') {
      contractAddresses.push(contractAddr)
    }
  })
  
  if (contractAddresses.length === 0) {
    console.log('❌ PROBLEMA: Nenhuma campanha tem contractAddress válido')
    console.log('💡 SOLUÇÃO: Campanhas precisam ser criadas on-chain primeiro')
    return
  }
  
  console.log('✅ Contratos encontrados:', contractAddresses.length)
  
  // 4. Testar chamada ao contrato
  try {
    const { ethers } = window
    if (!ethers) {
      console.log('❌ PROBLEMA: ethers.js não carregado')
      return
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contractAddress = contractAddresses[0]
    
    console.log('🔗 Testando contrato:', contractAddress)
    
    // ABI simplificado para getCampaignInfo
    const abi = [
      "function getCampaignInfo() view returns (string, string, uint256, uint256, address, address, uint256, bool, uint256, uint256)"
    ]
    
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const info = await contract.getCampaignInfo()
    
    console.log('📋 Resposta do contrato:', info)
    console.log('📋 Donor count (posição 9):', info[9])
    console.log('📋 Donor count convertido:', info[9] ? info[9].toNumber() : 0)
    
    if (info[9] && info[9].toNumber() > 0) {
      console.log('✅ SUCESSO: Contador de doadores funciona!')
      console.log('🎯 Doadores únicos:', info[9].toNumber())
    } else {
      console.log('⚠️ AVISO: Contador retorna 0')
      console.log('💡 Isso é normal se ninguém doou ainda')
    }
    
  } catch (error) {
    console.log('❌ ERRO ao chamar contrato:', error)
    console.log('💡 Verifique se a carteira está conectada à Base Sepolia')
  }
}

// Executar teste
testDonorCount()
