import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe, getOrCreateCustomer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { vendorId, planSlug, billingCycle = 'monthly', couponCode } = await request.json()

    if (!vendorId || !planSlug) {
      return NextResponse.json({ error: 'vendorId and planSlug are required' }, { status: 400 })
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } })
    if (!plan || !plan.stripePriceId) {
      return NextResponse.json({ error: 'Plan not found or not configured' }, { status: 404 })
    }

    const customer = await getOrCreateCustomer(vendor.email, vendor.name, vendor.id)

    if (!vendor.stripeCustomerId) {
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { stripeCustomerId: customer.id },
      })
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
    const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${vendor.slug}.${rootDomain}`

    const sessionParams: any = {
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/admin/billing?success=true`,
      cancel_url: `${baseUrl}/admin/billing?cancelled=true`,
      subscription_data: {
        metadata: { vendorId, planSlug, billingCycle },
      },
    }

    if (couponCode) {
      sessionParams.discounts = [{ coupon: couponCode }]
    } else {
      sessionParams.allow_promotion_codes = true
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
