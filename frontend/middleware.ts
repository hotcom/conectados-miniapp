import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle manifest requests
  if (request.nextUrl.pathname === '/miniapp-manifest.json') {
    // Rewrite to the API route
    return NextResponse.rewrite(new URL('/api/miniapp-manifest', request.url))
  }

  // Continue with default behavior for other requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/miniapp-manifest.json',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
