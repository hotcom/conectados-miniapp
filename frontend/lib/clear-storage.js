/**
 * Utility to clear localStorage data for testing
 * Run this in the browser console to reset all data
 */

function clearAllData() {
  console.log('🗑️ Limpando todos os dados do localStorage...')
  
  // Remove all conectados data
  localStorage.removeItem('conectados_organizations')
  localStorage.removeItem('conectados_campaigns')
  localStorage.removeItem('conectados_posts')
  localStorage.removeItem('conectados_current_user')
  
  console.log('✅ Dados limpos com sucesso!')
  console.log('🔄 Recarregue a página para ver as mudanças')
  
  // Show what was cleared
  console.log('Dados removidos:')
  console.log('- Organizações')
  console.log('- Campanhas') 
  console.log('- Posts')
  console.log('- Usuário atual')
}

function clearCampaigns() {
  console.log('🗑️ Limpando apenas campanhas e posts...')
  
  localStorage.removeItem('conectados_campaigns')
  localStorage.removeItem('conectados_posts')
  
  console.log('✅ Campanhas e posts removidos!')
  console.log('🔄 Recarregue a página para ver as mudanças')
}

// Make functions available globally
window.clearAllData = clearAllData
window.clearCampaigns = clearCampaigns

console.log('🛠️ Utilitários de limpeza carregados!')
console.log('Use: clearCampaigns() - para limpar apenas campanhas')
console.log('Use: clearAllData() - para limpar tudo')
