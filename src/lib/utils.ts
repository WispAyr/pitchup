import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getSubdomain(hostname: string): string | null {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const rootDomainBase = rootDomain.split(':')[0]

  // Handle localhost:3000 case — subdomain.localhost:3000
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.')
    if (parts.length > 1 && parts[0] !== 'www') {
      return parts[0]
    }
    return null
  }

  // Handle normal domains — subdomain.pitchup.local-connect.uk
  const hostnameBase = hostname.split(':')[0]
  if (hostnameBase === rootDomainBase || hostnameBase === `www.${rootDomainBase}`) {
    return null
  }

  const subdomain = hostnameBase.replace(`.${rootDomainBase}`, '')
  if (subdomain === hostnameBase) return null // no match
  if (subdomain === 'www') return null

  return subdomain
}
