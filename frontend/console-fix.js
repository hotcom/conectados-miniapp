// 🔧 SCRIPT PARA CORRIGIR CAMPANHA 1 - COPIE E COLE NO CONSOLE DO NAVEGADOR
// Abra http://localhost:3002, pressione F12, vá na aba Console e cole este código:

// Buscar campanhas
const campaigns = JSON.parse(localStorage.getItem('conectados_campaigns') || '[]');
console.log('📋 Campanhas encontradas:', campaigns.length);

// Encontrar campanha sem contractAddress (goal 1000)
const campaign1 = campaigns.find(c => c.goal === 1000 && !c.contractAddress);

if (campaign1) {
  console.log('🎯 Encontrada campanha:', campaign1.title || campaign1.id);
  
  // Adicionar contractAddress
  campaign1.contractAddress = '0x5B2bc705D9FBF87bD392af0f0B3Ad3Dd21ca5939';
  
  // Salvar
  localStorage.setItem('conectados_campaigns', JSON.stringify(campaigns));
  
  console.log('✅ SUCESSO! Campanha atualizada com contractAddress');
  console.log('🔄 Recarregue a página para ver as mudanças');
  
  // Opcional: recarregar automaticamente
  // window.location.reload();
  
} else {
  console.log('❌ Campanha não encontrada');
  console.log('📋 Campanhas disponíveis:', campaigns.map(c => ({
    id: c.id,
    goal: c.goal,
    hasContract: !!c.contractAddress
  })));
}
