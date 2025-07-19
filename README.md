# Donation Social Network

Rede social para doações com integração blockchain e PIX.

## Estrutura do Projeto

```
donation-app/
├── frontend/           # Next.js App (Interface do usuário)
├── backend/           # API Express.js (Webhook PIX, autenticação)
├── contracts/         # Smart Contracts (cBRL token na Base Sepolia)
└── README.md
```

## Tecnologias

- **Frontend**: Next.js 15, React, Tailwind CSS, TypeScript
- **Backend**: Express.js, TypeScript, OpenPix integration
- **Blockchain**: Base Sepolia, Foundry, Hardhat
- **Wallet**: Coinbase Wallet SDK
- **Deploy**: Vercel (frontend)

## Funcionalidades

- ✅ Feed de posts de ONGs
- ✅ Conexão com Coinbase Wallet
- ✅ Layout responsivo (estilo Instagram)
- ✅ Geração de QR Code PIX (mockado)
- ✅ Smart contract cBRL deployado
- 🔄 Integração OpenPix (em desenvolvimento)

## Como rodar

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Contratos
```bash
cd contracts
npm install
forge build
```

## Deploy

- **Frontend**: https://donation-social-network-2rj1nj8dk-hotcoms-projects.vercel.app
- **Smart Contract**: 0x0f628966ea621e7283e9AB3C7935A626b9607718 (Base Sepolia)

## Próximos passos

1. Finalizar integração OpenPix
2. Conectar frontend com backend real
3. Implementar mint automático de cBRL
4. Adicionar Farcaster Frames
