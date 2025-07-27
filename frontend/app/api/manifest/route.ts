import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "DoeAgora",
    description: "A primeira plataforma de doações 100% on-chain com transparência total.",
    url: "https://doeagora-eight.vercel.app/superapp",
    logoUrl: "https://doeagora-eight.vercel.app/icon.png",
    category: "Social",
    chain: "base",
    developer: "Rafael Costa"
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
