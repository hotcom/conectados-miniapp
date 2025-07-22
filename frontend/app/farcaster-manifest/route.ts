import { NextResponse } from 'next/server'

// CORS headers for public access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function GET() {
  // Official Farcaster Frame manifest format
  const manifest = {
    "accountAssociation": {
      "header": "eyJmaWQiOjM2MzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhEMzNhZjkxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyIn0",
      "payload": "eyJkb21haW4iOiJjb25lY3RhZG9zLW1pbmlhcHAtZ2l0LW1haW4taG90Y29tcy1wcm9qZWN0cy52ZXJjZWwuYXBwIn0",
      "signature": "MHg4YWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxYjAx"
    },
    "frame": {
      "version": "1",
      "name": "Conectados - Doações Descentralizadas",
      "iconUrl": "https://conectados-miniapp-git-main-hotcoms-projects.vercel.app/icon-192x192.png",
      "splashImageUrl": "https://conectados-miniapp-git-main-hotcoms-projects.vercel.app/splash.png",
      "splashBackgroundColor": "#0052FF",
      "homeUrl": "https://conectados-miniapp-git-main-hotcoms-projects.vercel.app",
      "webhookUrl": "https://conectados-miniapp-git-main-hotcoms-projects.vercel.app/api/webhook"
    }
  }

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      ...corsHeaders,
    },
  })
}
