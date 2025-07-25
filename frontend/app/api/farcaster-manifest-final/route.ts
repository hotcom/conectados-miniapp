import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "frame": {
      "version": "1",
      "name": "DoeAgora",
      "iconUrl": "https://doeagora-eight.vercel.app/icon-192x192.png",
      "splashImageUrl": "https://doeagora-eight.vercel.app/splash.png",
      "splashBackgroundColor": "#0052FF",
      "homeUrl": "https://doeagora-eight.vercel.app",
      "webhookUrl": "https://doeagora-eight.vercel.app/api/webhook"
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
