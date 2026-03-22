import { NextRequest, NextResponse } from 'next/server'
import { getSubdomain } from '@/lib/utils'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)',
  ],
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host') || ''
  const subdomain = getSubdomain(hostname)

  // If there's a subdomain, rewrite to vendor routes
  if (subdomain) {
    // Rewrite /path to /vendor/[slug]/path
    const newPath = `/vendor/${subdomain}${url.pathname}`
    return NextResponse.rewrite(new URL(newPath, req.url))
  }

  // Main site — no rewrite needed
  return NextResponse.next()
}
