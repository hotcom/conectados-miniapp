import { NextResponse } from 'next/server'

export async function GET() {
  const version = {
    version: "1.0.3",
    build: "2025-01-22-07:20",
    commit: "a9e7756",
    features: [
      "✅ Feed unificado blockchain",
      "✅ API route para manifest",
      "✅ Página de organização",
      "✅ Correção erro 401/404"
    ],
    status: "🚀 Deploy ativo - API route manifest implementada",
    timestamp: new Date().toISOString(),
    environment: "production"
  }

  return NextResponse.json(version, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
