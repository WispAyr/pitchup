import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendorId, orderId, items, total } = body

    if (!vendorId || !orderId || !items || !total) {
      return NextResponse.json(
        { error: 'vendorId, orderId, items, and total are required' },
        { status: 400 }
      )
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    if (!vendor.stripeAccountId) {
      return NextResponse.json(
        { error: 'Vendor has not completed Stripe onboarding' },
        { status: 400 }
      )
    }

    try {
      const { stripe } = await import('@/lib/stripe')

      const rootDomain =
        process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
      const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
      const baseUrl = `${protocol}://${vendor.slug}.${rootDomain}`

      const lineItems = items.map(
        (item: { name: string; price: number; quantity: number }) => ({
          price_data: {
            currency: 'gbp',
            product_data: { name: item.name },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        })
      )

      const applicationFeeAmount = Math.round(total * 0.015) // 1.5%

      const checkoutSession = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          line_items: lineItems,
          payment_intent_data: {
            application_fee_amount: applicationFeeAmount,
          },
          success_url: `${baseUrl}/order/${orderId}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/order/${orderId}/cancel`,
          metadata: { orderId, vendorId },
        },
        {
          stripeAccount: vendor.stripeAccountId,
        }
      )

      return NextResponse.json({ url: checkoutSession.url })
    } catch (error: any) {
      console.error('Stripe Checkout error:', error)

      // If Stripe isn't configured, return mock URL
      if (
        error?.message?.includes('API key') ||
        error?.type === 'StripeAuthenticationError' ||
        !process.env.STRIPE_SECRET_KEY
      ) {
        return NextResponse.json({
          url: `https://checkout.stripe.com/mock?orderId=${orderId}`,
          mock: true,
          message: 'Stripe is not configured. This is a mock checkout URL.',
        })
      }

      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
