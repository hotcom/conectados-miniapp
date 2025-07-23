import { NextRequest, NextResponse } from 'next/server'

// Force cache invalidation with timestamp
const CACHE_BUST = Date.now()

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex',
      'Vercel-No-Auth': '1',
      'X-Cache-Bust': CACHE_BUST.toString()
    },
  })
}

export async function GET(request: NextRequest) {
  // Force production cache invalidation with unique timestamp
  const timestamp = Date.now()
  
  // Get the current host to use in URLs
  const host = request.headers.get('host') || 'conectados-miniapp.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjM2MzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhEMzNhZjkxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyIn0",
      payload: "eyJkb21haW4iOiJjb25lY3RhZG9zLW1pbmlhcHAtZ2l0LW1haW4taG90Y29tcy1wcm9qZWN0cy52ZXJjZWwuYXBwIn0",
      signature: "MHg4YWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxYjAx"
    },
    frame: {
      version: "1",
      name: "Conectados", // NOME CURTO - 10 CARACTERES
      iconUrl: `${baseUrl}/icon-192x192.png`,
      splashImageUrl: `${baseUrl}/splash.png`,
      splashBackgroundColor: "#0052FF",
      homeUrl: baseUrl,
      webhookUrl: `${baseUrl}/api/webhook`
    }
  }

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex',
      'Vercel-No-Auth': '1',
      'X-Timestamp': timestamp.toString(),
      'X-Cache-Bust': CACHE_BUST.toString(),
      'X-Fresh-Deploy': '2025-01-22-v2'
    },
  })
}
