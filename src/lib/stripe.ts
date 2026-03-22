import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export function getStripeConnectUrl(vendorId: string, slug: string): string {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
  const returnUrl = `${protocol}://${slug}.${rootDomain}/admin/settings`

  return `/api/stripe/connect?vendorId=${vendorId}&returnUrl=${encodeURIComponent(returnUrl)}`
}
