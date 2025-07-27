# DoeAgora - Doações Descentralizadas

> **MiniApp para Coinbase Super App** - Plataforma descentralizada para ONGs criarem perfis, campanhas e receberem doações em cBRL na Base Sepolia

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://doeagora-eight.vercel.app)
[![MiniApp](https://img.shields.io/badge/MiniApp-Coinbase%20SuperApp-0052FF?logo=coinbase)](https://doeagora-eight.vercel.app/superapp)
[![Network](https://img.shields.io/badge/Network-Base%20Sepolia-0052FF)](https://base-sepolia.blockscout.com)
[![Contract](https://img.shields.io/badge/Contract-CampaignFactory-success)](https://base-sepolia.blockscout.com/address/0x28e4aDa7E2760F07517D9237c0419F2f025f91Da)

---

## 🏆 **PARA OS JURADOS DO HACKATHON**

### 🚀 **TESTE AGORA - LINKS DIRETOS:**

1. **🌐 Interface Web Completa:** https://doeagora-eight.vercel.app
2. **📱 MiniApp SuperApp:** https://doeagora-eight.vercel.app/superapp
3. **🔗 Contrato Principal:** https://base-sepolia.blockscout.com/address/0x28e4aDa7E2760F07517D9237c0419F2f025f91Da
4. **💰 Token cBRL:** https://base-sepolia.blockscout.com/address/0x0f628966ea621e7283e9AB3C7935A626b9607718

### 🎯 **DIFERENCIAIS INOVADORES:**

- ✅ **MiniApp nativo** para Coinbase Super App
- ✅ **Contratos individuais** para cada campanha (transparência total)
- ✅ **Contador de doadores únicos** on-chain
- ✅ **Interface Instagram-like** mobile-first
- ✅ **Integração cBRL** (stablecoin BRL na Base)
- ✅ **Transparência blockchain** com links diretos para explorer
- ✅ **Sistema multiusuário** com Firebase
- ✅ **PWA completo** com manifest e service worker

---

## 🚀 **FUNCIONALIDADES IMPLEMENTADAS**

### 🏢 **Para ONGs e Organizações**
- ✅ **Perfil institucional completo** com avatar e descrição
- ✅ **Criação de campanhas** com deploy automático de contrato individual
- ✅ **Upload de imagens** com fallback Firebase Storage
- ✅ **Posts sociais** para engajamento da comunidade
- ✅ **Dashboard de gestão** com estatísticas em tempo real
- ✅ **Transparência total** via blockchain explorer

### 💝 **Para Doadores**
- ✅ **Conexão de carteira** (MetaMask, Coinbase Wallet)
- ✅ **Doações diretas em cBRL** com uma única assinatura
- ✅ **Feed Instagram-style** com campanhas e posts
- ✅ **Progresso em tempo real** das campanhas
- ✅ **Contador de doadores únicos** on-chain
- ✅ **Histórico verificável** na blockchain
- ✅ **Interface mobile-first** otimizada

### 📱 **MiniApp Coinbase Super App**
### 📱 MiniApp Coinbase
- ✅ **Integração nativa** com Coinbase Super App
- ✅ **Wallet connection** automática
- ✅ **Mobile-optimized** com safe areas
- ✅ **PWA features** completas

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Blockchain**: Solidity + Hardhat + ethers.js
- **Network**: Base Sepolia Testnet
- **Token**: cBRL (Brazilian Real Stablecoin)
- **MiniApp**: Coinbase MiniKit + PWA

## 🌐 Links Importantes

- **🔗 App Web**: [https://conectados-miniapp.vercel.app](https://conectados-miniapp.vercel.app)
- **📱 MiniApp**: [Abrir no Coinbase Super App](https://wallet.coinbase.com/miniapp/conectados)
- **🔍 Contratos**: [Base Sepolia Explorer](https://sepolia.basescan.org/address/0x28e4aDa7E2760F07517D9237c0419F2f025f91Da)
- **💰 Mint cBRL**: [/mint](https://conectados-miniapp.vercel.app/mint)

## 📋 Smart Contracts

| Contrato | Endereço | Função |
|----------|----------|--------|
| **CampaignFactory** | `0x28e4aDa7E2760F07517D9237c0419F2f025f91Da` | Deploy de campanhas |
| **cBRL Token** | `0x0f628966ea621e7283e9AB3C7935A626b9607718` | Stablecoin BRL |
| **Network** | Base Sepolia (84532) | Testnet |

## 🚀 Como Usar

### 📱 **No Coinbase Super App (Recomendado)**
1. Abra o Coinbase Super App
2. Vá em "Discover" → "MiniApps"
3. Procure por "Conectados" ou use o link direto
4. Sua carteira já estará conectada automaticamente!

### 🌐 **Na Web**
1. Acesse [conectados-miniapp.vercel.app](https://conectados-miniapp.vercel.app)
2. Conecte sua MetaMask ou Coinbase Wallet
3. Troque para Base Sepolia network
4. Crie seu perfil e comece a usar!

## 🧪 Para Desenvolvedores

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/conectados-miniapp.git
cd conectados-miniapp

# Frontend
cd frontend
npm install
npm run dev  # Porta 3002

# Backend (opcional)
cd ../backend
npm install
npm run dev  # Porta 3001
```

### Variáveis de Ambiente
```bash
# Backend (.env)
PORT=3001
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
CHAIN_ID=84532
PRIVATE_KEY=sua_private_key
CBRL_CONTRACT_ADDRESS=0x0f628966ea621e7283e9AB3C7935A626b9607718
```

### Deploy
```bash
# Deploy automático no Vercel
vercel --prod

# Ou conecte seu repo GitHub ao Vercel
```

## 🎯 Roadmap

- [x] ✅ **MVP Completo** - Perfis, campanhas, doações
- [x] ✅ **Smart Contracts** - Factory + contratos individuais
- [x] ✅ **MiniApp Coinbase** - Integração completa
- [x] ✅ **Contador de Doadores** - Doadores únicos
- [ ] 🔄 **Integração PIX** - OpenPix + mint automático
- [ ] 🔄 **Farcaster Frames** - Compartilhamento social
- [ ] 🔄 **Base Mainnet** - Deploy produção
- [ ] 🔄 **IPFS Storage** - Armazenamento descentralizado

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **Base** - Pela infraestrutura blockchain
- **Coinbase** - Pelo MiniApp ecosystem
- **OpenZeppelin** - Pelos contratos seguros
- **Vercel** - Pelo hosting gratuito

---

**Feito com ❤️ para o ecossistema Base + Coinbase**
