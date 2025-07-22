import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    "name": "Conectados - Doações Descentralizadas",
    "short_name": "Conectados",
    "description": "Plataforma descentralizada para ONGs criarem perfis, campanhas e receberem doações em cBRL na Base",
    "version": "1.0.0",
    "manifest_version": 1,
    "start_url": "/",
    "display": "standalone",
    "orientation": "portrait",
    "theme_color": "#0052FF",
    "background_color": "#ffffff",
    "categories": ["social", "finance", "charity"],
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ],
    "permissions": [
      "wallet",
      "notifications",
      "camera",
      "location"
    ],
    "coinbase": {
      "miniapp": true,
      "version": "1.0.0",
      "supported_networks": ["base", "base-sepolia"],
      "required_permissions": ["wallet"],
      "features": [
        "wallet_connect",
        "transaction_signing",
        "balance_reading"
      ]
    },
    "scope": "/",
    "lang": "pt-BR",
    "dir": "ltr"
  }

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  })
}
