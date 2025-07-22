import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    "name": "Conectados - Doações Descentralizadas",
    "version": "1.0.0",
    "description": "Plataforma descentralizada para doações transparentes usando blockchain Base e cBRL",
    "icon": "https://conectados-miniapp-git-main-hotcoms-projects.vercel.app/icon-192x192.png",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#3b82f6",
    "background_color": "#ffffff",
    "orientation": "portrait-primary",
    "coinbase": {
      "miniapp": true,
      "permissions": [
        "wallet",
        "identity"
      ]
    },
    "categories": ["finance", "social", "productivity"],
    "lang": "pt-BR",
    "scope": "/",
    "shortcuts": [
      {
        "name": "Criar Campanha",
        "short_name": "Nova Campanha",
        "description": "Criar nova campanha de doação",
        "url": "/create-campaign",
        "icons": [
          {
            "src": "/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png"
          }
        ]
      },
      {
        "name": "Mint cBRL",
        "short_name": "Mint Tokens",
        "description": "Criar tokens cBRL para doações",
        "url": "/mint",
        "icons": [
          {
            "src": "/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png"
          }
        ]
      }
    ]
  }

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
