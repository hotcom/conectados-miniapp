// Script para verificar dados salvos no Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Configuração do Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyBbbr-MUTRZ5oPl7f5M-IxlYYfIRvFxi9s",
  authDomain: "doeagora-b6616.firebaseapp.com",
  projectId: "doeagora-b6616",
  storageBucket: "doeagora-b6616.firebasestorage.app",
  messagingSenderId: "978712844622",
  appId: "1:978712844622:web:7ba8c800a6c9e77a60261f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verifyFirebaseData() {
  console.log('🔥 VERIFICANDO DADOS NO FIREBASE...\n');
  
  try {
    // Verificar organizações
    console.log('👥 ORGANIZAÇÕES:');
    const orgsSnapshot = await getDocs(collection(db, 'organizations'));
    orgsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Nome: ${data.name}`);
      console.log(`  Username: ${data.username}`);
      console.log(`  Wallet: ${data.walletAddress}`);
      console.log(`  Avatar: ${data.avatar ? 'SIM' : 'NÃO'}`);
      console.log(`  Avatar URL: ${data.avatar?.substring(0, 50)}...`);
      console.log(`  Criado em: ${data.createdAt?.toDate?.() || data.createdAt}`);
      console.log('');
    });

    // Verificar campanhas
    console.log('📝 CAMPANHAS:');
    const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
    campaignsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Título: ${data.title}`);
      console.log(`  Organização: ${data.organizationId}`);
      console.log(`  Imagem: ${data.image ? 'SIM' : 'NÃO'}`);
      console.log('');
    });

    // Verificar posts
    console.log('📄 POSTS:');
    const postsSnapshot = await getDocs(collection(db, 'posts'));
    postsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Conteúdo: ${data.content?.substring(0, 50)}...`);
      console.log(`  Organização: ${data.organizationId}`);
      console.log(`  Imagem: ${data.image ? 'SIM' : 'NÃO'}`);
      console.log('');
    });

    console.log('✅ VERIFICAÇÃO CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ ERRO AO VERIFICAR FIREBASE:', error);
  }
}

verifyFirebaseData();
