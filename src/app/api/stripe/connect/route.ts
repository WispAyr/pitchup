import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const vendorId = searchParams.get('vendorId')
  const returnUrl = searchParams.get('returnUrl')

  if (!vendorId) {
    return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
  }

  try {
    const { stripe } = await import('@/lib/stripe')

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    let stripeAccountId = vendor.stripeAccountId

    // Create Stripe Connect account if vendor doesn't have one
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: vendor.email,
        metadata: { vendorId: vendor.id },
      })

      stripeAccountId = account.id

      await prisma.vendor.update({
        where: { id: vendorId },
        data: { stripeAccountId },
      })
    }

    const rootDomain =
      process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
    const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
    const defaultReturnUrl = `${protocol}://${vendor.slug}.${rootDomain}/admin/settings`

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: returnUrl || defaultReturnUrl,
      return_url: returnUrl || defaultReturnUrl,
      type: 'account_onboarding',
    })

    return NextResponse.redirect(accountLink.url)
  } catch (error: any) {
    console.error('Stripe Connect error:', error)

    // If Stripe keys aren't configured, return mock URL
    if (
      error?.message?.includes('API key') ||
      error?.type === 'StripeAuthenticationError' ||
      !process.env.STRIPE_SECRET_KEY
    ) {
      return NextResponse.json({
        url: `https://connect.stripe.com/setup/mock?vendorId=${vendorId}`,
        mock: true,
        message: 'Stripe is not configured. This is a mock onboarding URL.',
      })
    }

    return NextResponse.json(
      { error: 'Failed to create Stripe Connect link' },
      { status: 500 }
    )
  }
}
