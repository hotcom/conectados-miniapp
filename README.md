# 🧡 DoeAgora – Transparência nas Doações com Web3

**MiniApp para o SuperApp da Coinbase + Interface Web**

> Plataforma descentralizada onde ONGs criam campanhas e recebem doações em stablecoin cBRL (Base). Cada campanha tem seu próprio contrato inteligente para máxima transparência.

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://doeagora-eight.vercel.app)
[![MiniApp](https://img.shields.io/badge/MiniApp-Coinbase-0052FF?logo=coinbase)](https://doeagora-eight.vercel.app/superapp)
[![Network](https://img.shields.io/badge/Network-Base%20Sepolia-0052FF)](https://base-sepolia.blockscout.com)
[![Contract](https://img.shields.io/badge/Contract-CampaignFactory-success)](https://base-sepolia.blockscout.com/address/0x28e4aDa7E2760F07517D9237c0419F2f025f91Da)

---

## ✨ Experiência de Uso

### 🌐 Interface Web (PWA)
- [https://doeagora-eight.vercel.app](https://doeagora-eight.vercel.app)

### 📱 Interface no SuperApp da Coinbase
- Cole este link dentro do SuperApp:  
  [https://doeagora-eight.vercel.app/superapp](https://doeagora-eight.vercel.app/superapp)

> 🔒 A versão SuperApp utiliza integração nativa com carteira Coinbase. Tudo pronto para rodar diretamente no modo Discover → MiniApps.

---

## 🏆 **PARA OS JURADOS DO HACKATHON**

### 🚀 **TESTE AGORA - LINKS DIRETOS:**

| Funcionalidade | Link Direto | Descrição |
|----------------|-------------|----------|
| 🌐 **Interface Web** | [doeagora-eight.vercel.app](https://doeagora-eight.vercel.app) | Versão completa com gestão de campanhas |
| 📱 **MiniApp SuperApp** | [SuperApp Link](https://doeagora-eight.vercel.app/superapp) | Versão otimizada para Coinbase Wallet |
| 🔍 **Contrato Principal** | [CampaignFactory](https://base-sepolia.blockscout.com/address/0x28e4aDa7E2760F07517D9237c0419F2f025f91Da) | Factory que cria contratos individuais |
| 💰 **Token cBRL** | [cBRL Token](https://base-sepolia.blockscout.com/address/0x0f628966ea621e7283e9AB3C7935A626b9607718) | Stablecoin BRL para doações |
| 🪙 **Mint cBRL** | [Mint Page](https://doeagora-eight.vercel.app/mint) | Página para criar tokens de teste |

### 🎯 **DIFERENCIAIS INOVADORES:**

- ✅ **Contratos individuais por campanha** - Cada campanha tem seu próprio contrato para máxima transparência
- ✅ **MiniApp nativo Coinbase** - Integração oficial com SuperApp da Coinbase
- ✅ **Contador de doadores únicos** - Sistema on-chain que conta doadores únicos por endereço
- ✅ **Interface Instagram-like** - Feed vertical mobile-first otimizado para doações
- ✅ **Stablecoin cBRL** - Token pareado ao Real Brasileiro na Base
- ✅ **Transparência total** - Links diretos para explorer blockchain em cada campanha
- ✅ **Sistema multiusuário** - Firebase para dados sociais + blockchain para transparência
- ✅ **PWA completo** - Instalável como app nativo com manifest e service worker

---

## ✅ Funcionalidades Atuais

### 👥 Para ONGs
- **Criar perfil institucional** com verificação
- **Criar campanhas** com contrato próprio on-chain
- **Upload de imagem** de capa e descrição rica
- **Transparência total**: endereço do contrato, progresso, doadores
- **Botão "Ver Contrato"** em cada campanha para auditoria pública

### 🙌 Para Doadores
- **Doações diretas em cBRL** (stablecoin BRL)
- **Contador de doadores únicos** on-chain por endereço
- **Progresso da campanha** em tempo real
- **Histórico de doações** on-chain verificável
- **Feed Instagram-like** mobile-first para descobrir campanhas

### ⚙️ Infraestrutura
- **Criação automática de contrato** para cada campanha
- **Conexão com carteira** no MiniApp (Coinbase Wallet nativo)
- **Safe-area e mobile-first** - otimizado para SuperApp
- **Deploy na rede Base Sepolia** (testnet) com contratos verificados

## 🛠️ Tech Stack

- **Frontend**: Next.js + React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Webhooks PIX (OpenPix)
- **Blockchain**: Solidity + Hardhat + ethers.js
- **Network**: Base Sepolia (84532)
- **Token**: `cBRL` – stablecoin fictícia pareada ao real
- **MiniApp**: Coinbase MiniKit + PWA

---

## 🔗 Links Úteis

| Item | Link |
|------|------|
| 🌐 App Web | [doeagora-eight.vercel.app](https://doeagora-eight.vercel.app) |
| 📱 MiniApp | [Abrir via Coinbase Wallet](https://doeagora-eight.vercel.app/superapp) |
| 🔍 Contratos | [BaseScan – CampaignFactory](https://base-sepolia.blockscout.com/address/0x28e4aDa7E2760F07517D9237c0419F2f025f91Da) |
| 💰 Mint cBRL | [Mint Page](https://doeagora-eight.vercel.app/mint) |

---

## 🧾 Contratos Inteligentes

| Contrato | Endereço | Função |
|----------|----------|--------|
| `CampaignFactory` | `0x28e4aDa7E2760F07517D9237c0419F2f025f91Da` | Deploy de campanhas |
| `cBRL Token` | `0x0f628966ea621e7283e9AB3C7935A626b9607718` | Stablecoin BRL |

---

## 🚧 Roadmap (Próximas Funcionalidades)

- [ ] **Cartão de débito com registro on-chain** de cada gasto por campanha
- [ ] **Importação de XML da SEFAZ** para comprovação de uso de verba por campanha
- [ ] **NFTs de utilidade** para doadores (ex: cupom de desconto, acesso VIP)
- [ ] **Contrato ERC-721 específico por campanha**
- [ ] **Parcerias com marcas** para disponibilizar utilidades nos NFTs
- [ ] **Sistema de reputação para ONGs**
- [ ] **Governança via DAO** para curadoria de campanhas e validação de ONGs

---

## 🧪 Como Rodar Localmente

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

### 🔧 Configuração da Carteira
```
Network: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency: ETH
```

---

## 🎯 Status do Projeto

- [x] ✅ **MVP Completo** - Perfis, campanhas, doações funcionando
- [x] ✅ **Smart Contracts** - Factory + contratos individuais deployados
- [x] ✅ **MiniApp Coinbase** - Integração completa com SuperApp
- [x] ✅ **Contador de Doadores** - Sistema on-chain de doadores únicos
- [x] ✅ **Interface Instagram-like** - Feed mobile-first otimizado
- [x] ✅ **Transparência Total** - Links diretos para blockchain explorer
- [x] ✅ **PWA Completo** - Instalável como app nativo

---

## 📞 Contato e Suporte

- **Deploy:** https://doeagora-eight.vercel.app
- **MiniApp:** https://doeagora-eight.vercel.app/superapp
- **Contratos:** Base Sepolia Blockscout
- **Repositório:** GitHub (este repositório)

---

## 📄 Licença

MIT License - Projeto desenvolvido para hackathon

---

**🎉 Obrigado por avaliar o DoeAgora! Uma plataforma que conecta transparência blockchain com impacto social real. 🧡**
- **OpenZeppelin** - Pelos contratos seguros
- **Vercel** - Pelo hosting gratuito

---

**Feito com ❤️ para o ecossistema Base + Coinbase**
