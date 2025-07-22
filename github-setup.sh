#!/bin/bash

# 🚀 Script para configurar GitHub e Deploy do MiniApp Conectados

echo "🔧 Configurando repositório GitHub..."

# 1. Inicializar Git (se não estiver inicializado)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer commit inicial
git commit -m "🎉 Initial commit: Conectados MiniApp - Doações Descentralizadas

✅ Funcionalidades implementadas:
- MiniApp Coinbase completo com manifest
- Smart contracts deployados (CampaignFactory + cBRL)
- Sistema de doações on-chain funcionando
- Contador de doadores únicos
- Interface mobile-first otimizada
- PWA features completas

🔗 Contratos:
- CampaignFactory: 0x28e4aDa7E2760F07517D9237c0419F2f025f91Da
- cBRL Token: 0x0f628966ea621e7283e9AB3C7935A626b9607718
- Network: Base Sepolia (84532)

🎯 Pronto para deploy e teste no Coinbase Super App!"

echo "✅ Commit criado!"
echo ""
echo "📋 Próximos passos:"
echo "1. Crie um repositório no GitHub: https://github.com/new"
echo "2. Nome sugerido: 'conectados-miniapp'"
echo "3. Execute os comandos abaixo:"
echo ""
echo "   git remote add origin https://github.com/SEU-USUARIO/conectados-miniapp.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Deploy no Vercel:"
echo "   - Acesse: https://vercel.com/new"
echo "   - Conecte seu repositório GitHub"
echo "   - Configure:"
echo "     * Framework: Next.js"
echo "     * Root Directory: frontend"
echo "     * Build Command: npm run build"
echo "     * Output Directory: .next"
echo ""
echo "5. Após deploy, teste o MiniApp:"
echo "   - URL Web: https://seu-projeto.vercel.app"
echo "   - MiniApp: https://wallet.coinbase.com/miniapp/[sua-url]"
echo ""
echo "🎉 Seu MiniApp estará pronto para teste no Coinbase Super App!"
