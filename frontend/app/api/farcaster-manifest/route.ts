import { NextRequest, NextResponse } from 'next/server'

// CORS headers for all responses - explicitly public
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
  'X-Robots-Tag': 'noindex',
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'X-Robots-Tag': 'noindex',
      'Vercel-No-Auth': '1'
    },
  })
}

export async function GET(request: NextRequest) {
  // Get the current host to use in URLs
  const host = request.headers.get('host') || 'conectados-miniapp.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  // Official Farcaster Frame manifest format - publicly accessible
  const manifest = {
    "accountAssociation": {
      "header": "eyJmaWQiOjM2MzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhEMzNhZjkxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyIn0",
      "payload": "eyJkb21haW4iOiJjb25lY3RhZG9zLW1pbmlhcHAudmVyY2VsLmFwcCJ9",
      "signature": "MHg4YWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxYjAx"
    },
    "frame": {
      "version": "1",
      "name": "Conectados - Doações",
      "iconUrl": `${baseUrl}/icon-192x192.png`,
      "splashImageUrl": `${baseUrl}/splash.png`,
      "splashBackgroundColor": "#0052FF",
      "homeUrl": baseUrl,
      "webhookUrl": `${baseUrl}/api/webhook`
    }
  }

  // Log access for debugging
  console.log('Farcaster manifest accessed from:', request.headers.get('user-agent'))

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex',
      'Vercel-No-Auth': '1'
    },
  })
}
