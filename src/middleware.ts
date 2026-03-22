import { NextRequest, NextResponse } from 'next/server'
import { getSubdomain } from '@/lib/utils'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)',
  ],
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const hostname = req.headers.get('host') || ''
  const subdomain = getSubdomain(hostname)

  // If there's a subdomain, rewrite to vendor routes
  if (subdomain) {
    const newPath = `/vendor/${subdomain}${url.pathname}`
    return NextResponse.rewrite(new URL(newPath, req.url))
  }

  // Check for custom domain — hostname doesn't match root domain or its subdomains
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const rootDomainBase = rootDomain.split(':')[0]
  const hostnameBase = hostname.split(':')[0]

  // Not a subdomain, not the root domain — could be a custom domain
  if (
    hostnameBase !== rootDomainBase &&
    hostnameBase !== `www.${rootDomainBase}` &&
    !hostnameBase.endsWith(`.${rootDomainBase}`) &&
    hostnameBase !== 'localhost'
  ) {
    // Look up custom domain via internal API
    try {
      const lookupUrl = new URL(`/api/domain-lookup?domain=${encodeURIComponent(hostnameBase)}`, req.url)
      const res = await fetch(lookupUrl)
      if (res.ok) {
        const { slug } = await res.json()
        if (slug) {
          const newPath = `/vendor/${slug}${url.pathname}`
          return NextResponse.rewrite(new URL(newPath, req.url))
        }
      }
    } catch (e) {
      // Fall through to main site
    }
  }

  // Main site — no rewrite needed
  return NextResponse.next()
}
