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

export async function createCheckoutSession({
  vendorId,
  planSlug,
  billingCycle = 'monthly',
  couponCode,
  customerId,
  successUrl,
  cancelUrl,
  trialDays,
}: {
  vendorId: string
  planSlug: string
  billingCycle?: 'monthly' | 'yearly'
  couponCode?: string
  customerId?: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
}) {
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { vendorId, planSlug, billingCycle },
    allow_promotion_codes: !couponCode,
  }

  if (customerId) {
    params.customer = customerId
  }

  if (couponCode) {
    params.discounts = [{ coupon: couponCode }]
  }

  if (trialDays) {
    params.subscription_data = {
      trial_period_days: trialDays,
      metadata: { vendorId, planSlug },
    }
  } else {
    params.subscription_data = {
      metadata: { vendorId, planSlug },
    }
  }

  // line_items will be set by the caller with the correct price ID
  return params
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function issueRefund(paymentIntentId: string, amount?: number) {
  const params: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  }
  if (amount) {
    params.amount = amount
  }
  return stripe.refunds.create(params)
}

export async function listInvoices(customerId: string, limit = 20) {
  return stripe.invoices.list({
    customer: customerId,
    limit,
  })
}

export async function listPaymentIntents(customerId: string, limit = 20) {
  return stripe.paymentIntents.list({
    customer: customerId,
    limit,
  })
}

export async function createCoupon(params: {
  name: string
  type: 'percentage' | 'fixed'
  value: number
  duration: 'once' | 'repeating' | 'forever'
  durationMonths?: number
  currency?: string
}) {
  const couponParams: Stripe.CouponCreateParams = {
    name: params.name,
    duration: params.duration,
  }

  if (params.type === 'percentage') {
    couponParams.percent_off = params.value
  } else {
    couponParams.amount_off = params.value
    couponParams.currency = params.currency || 'gbp'
  }

  if (params.duration === 'repeating' && params.durationMonths) {
    couponParams.duration_in_months = params.durationMonths
  }

  return stripe.coupons.create(couponParams)
}

export async function applyCredit(customerId: string, amount: number) {
  // Negative balance = credit in Stripe
  return stripe.customers.update(customerId, {
    balance: -Math.abs(amount),
  })
}

export async function getOrCreateCustomer(email: string, name: string, vendorId: string) {
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) {
    return existing.data[0]
  }
  return stripe.customers.create({
    email,
    name,
    metadata: { vendorId },
  })
}
