import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "accountAssociation": {
      "header": "eyJmaWQiOjM2MzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhEMzNhZjkxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyIn0",
      "payload": "eyJkb21haW4iOiJjb25lY3RhZG9zLW1pbmlhcHAtZ2l0LW1haW4taG90Y29tcy1wcm9qZWN0cy52ZXJjZWwuYXBwIn0",
      "signature": "MHg4YWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxYjAx"
    },
    "frame": {
      "version": "1",
      "name": "DoeAgora",
      "iconUrl": "https://doeagora.vercel.app/icon-192x192.png",
      "splashImageUrl": "https://doeagora.vercel.app/splash.png",
      "splashBackgroundColor": "#0052FF",
      "homeUrl": "https://doeagora.vercel.app",
      "webhookUrl": "https://doeagora.vercel.app/api/webhook"
    }
  };

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Vercel-No-Auth': '1',
      'X-Robots-Tag': 'noindex',
      // Cache busting extremo
      'X-Cache-Bust': Date.now().toString(),
      'X-Timestamp': new Date().toISOString(),
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    },
  });
}
