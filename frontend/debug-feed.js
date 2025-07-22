// Script de debug para testar o feed
// Cole este código no console do navegador (F12 → Console)

console.log('🔍 INICIANDO DEBUG DO FEED...')

// 1. Verificar se há campanhas no localStorage
const campaigns = JSON.parse(localStorage.getItem('conectados_campaigns') || '[]')
console.log('📊 Campanhas no localStorage:', campaigns)

// 2. Verificar se há posts no localStorage
const posts = JSON.parse(localStorage.getItem('conectados_posts') || '[]')
console.log('📝 Posts no localStorage:', posts)

// 3. Verificar se a carteira está conectada
console.log('🔗 Ethereum disponível:', !!window.ethereum)
console.log('🔗 Provider disponível:', !!window.ethereum?.selectedAddress)

// 4. Função para testar carregamento on-chain manual
async function testOnChainData() {
  console.log('🔄 Testando carregamento on-chain...')
  
  if (!window.ethereum) {
    console.error('❌ MetaMask não encontrada')
    return
  }
  
  try {
    // Importar ethers (assumindo que está disponível globalmente)
    const { ethers } = window
    if (!ethers) {
      console.error('❌ Ethers não disponível')
      return
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log('✅ Provider criado')
    
    // Testar com o primeiro contrato de campanha
    const campaign = campaigns.find(c => c.contractAddress)
    if (!campaign) {
      console.error('❌ Nenhuma campanha com contrato encontrada')
      return
    }
    
    console.log('🔍 Testando campanha:', campaign.id, 'Contrato:', campaign.contractAddress)
    
    // ABI básica do contrato Campaign
    const campaignABI = [
      'function goal() view returns (uint256)',
      'function raised() view returns (uint256)',
      'function getProgressPercentage() view returns (uint256)'
    ]
    
    const contract = new ethers.Contract(campaign.contractAddress, campaignABI, provider)
    
    const goal = await contract.goal()
    const raised = await contract.raised()
    const progress = await contract.getProgressPercentage()
    
    console.log('📊 DADOS ON-CHAIN:', {
      goal: ethers.utils.formatEther(goal),
      raised: ethers.utils.formatEther(raised),
      progress: progress.toString()
    })
    
    return {
      goal: parseFloat(ethers.utils.formatEther(goal)),
      raised: parseFloat(ethers.utils.formatEther(raised)),
      progress: parseInt(progress.toString())
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar on-chain:', error)
  }
}

// 5. Executar teste
console.log('🚀 Execute: testOnChainData() para testar carregamento on-chain')

// Disponibilizar função globalmente
window.testOnChainData = testOnChainData
