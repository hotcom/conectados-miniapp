// Script para adicionar contractAddress à Campanha 1 no localStorage
// Execute este script no console do navegador em http://localhost:3002

console.log('🔧 Iniciando correção da Campanha 1...');

// 1. Buscar campanhas atuais
const campaigns = JSON.parse(localStorage.getItem('conectados_campaigns') || '[]');
console.log('📋 Campanhas encontradas:', campaigns.length);

// 2. Encontrar a campanha 1 (sem contractAddress)
const campaign1 = campaigns.find(c => !c.contractAddress && c.goal === 1000);

if (campaign1) {
  console.log('🎯 Campanha 1 encontrada:', campaign1.title);
  
  // 3. Adicionar contractAddress real da Campanha 1
  campaign1.contractAddress = '0x5B2bc705D9FBF87bD392af0f0B3Ad3Dd21ca5939'; // Endereço real do contrato
  
  // 4. Salvar de volta no localStorage
  localStorage.setItem('conectados_campaigns', JSON.stringify(campaigns));
  
  console.log('✅ Campanha 1 atualizada com contractAddress!');
  console.log('🔗 Novo contractAddress:', campaign1.contractAddress);
  
  // 5. Também atualizar os posts relacionados
  const posts = JSON.parse(localStorage.getItem('conectados_posts') || '[]');
  const relatedPost = posts.find(p => p.campaignId === campaign1.id);
  
  if (relatedPost) {
    // Não precisamos atualizar o post, pois ele busca do campaign
    console.log('📝 Post relacionado encontrado:', relatedPost.id);
  }
  
  console.log('🎉 Correção concluída! Recarregue a página para ver as mudanças.');
  
} else {
  console.log('❌ Campanha 1 não encontrada ou já possui contractAddress');
  console.log('📋 Campanhas disponíveis:', campaigns.map(c => ({
    id: c.id,
    title: c.title,
    goal: c.goal,
    hasContract: !!c.contractAddress
  })));
}
