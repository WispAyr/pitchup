import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const vendorId = session.metadata?.vendorId
          const planSlug = session.metadata?.planSlug
          const billingCycle = session.metadata?.billingCycle || 'monthly'

          if (vendorId && planSlug) {
            const plan = await prisma.plan.findUnique({ where: { slug: planSlug } })
            if (plan) {
              const sub = await stripe.subscriptions.retrieve(session.subscription as string)

              await prisma.subscription.create({
                data: {
                  vendorId,
                  planId: plan.id,
                  stripeSubscriptionId: sub.id,
                  stripeCustomerId: session.customer as string,
                  status: sub.status === 'trialing' ? 'trialing' : 'active',
                  billingCycle,
                  currentPeriodStart: new Date(sub.current_period_start * 1000),
                  currentPeriodEnd: new Date(sub.current_period_end * 1000),
                  trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
                },
              })

              await prisma.vendor.update({
                where: { id: vendorId },
                data: {
                  planId: plan.id,
                  stripeCustomerId: session.customer as string,
                },
              })
            }
          }
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const vendor = await prisma.vendor.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (vendor) {
          await prisma.payment.create({
            data: {
              vendorId: vendor.id,
              stripePaymentId: invoice.payment_intent as string,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
              description: invoice.lines.data.map((l) => l.description).filter(Boolean).join(', ') || 'Subscription payment',
            },
          })

          // Auto-apply credits
          const credits = await prisma.vendorCredit.findMany({
            where: {
              vendorId: vendor.id,
              appliedToInvoice: null,
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            orderBy: { createdAt: 'asc' },
          })

          for (const credit of credits) {
            if (credit.amount > 0) {
              await prisma.vendorCredit.update({
                where: { id: credit.id },
                data: { appliedToInvoice: invoice.id },
              })
            }
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string
        if (subId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subId },
            data: { status: 'past_due' },
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status === 'trialing' ? 'trialing' : sub.cancel_at_period_end ? 'active' : sub.status,
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'cancelled' },
        })

        // Remove vendor plan
        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
        })
        if (subscription) {
          await prisma.vendor.update({
            where: { id: subscription.vendorId },
            data: { planId: null },
          })
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        if (paymentIntentId) {
          const payment = await prisma.payment.findFirst({
            where: { stripePaymentId: paymentIntentId },
          })

          if (payment) {
            const isFullRefund = charge.amount_refunded >= charge.amount
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                refundedAmount: charge.amount_refunded,
                status: isFullRefund ? 'refunded' : 'partially_refunded',
                refundId: charge.refunds?.data?.[0]?.id || null,
              },
            })
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
