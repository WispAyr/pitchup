'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Check, Crown, Sparkles, CreditCard, Gift, Percent, ExternalLink } from 'lucide-react'

type Plan = {
  id: string; name: string; slug: string; monthlyPrice: number; yearlyPrice: number | null
  maxVehicles: number; features: string; sortOrder: number
}
type Sub = { id: string; plan: { name: string; slug: string; monthlyPrice: number }; status: string; billingCycle: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean }
type Credit = { id: string; amount: number; reason: string; appliedToInvoice: string | null; createdAt: string }
type Discount = { id: string; name: string; type: string; value: number; isActive: boolean }
type Feature = { slug: string; name: string; description: string | null; isAddon: boolean; monthlyPrice: number | null }

export default function VendorBillingPage() {
  const params = useParams()
  const slug = params.slug as string

  const [vendor, setVendor] = useState<any>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [subscription, setSub] = useState<Sub | null>(null)
  const [credits, setCredits] = useState<Credit[]>([])
  const [creditBalance, setCreditBalance] = useState(0)
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [slug])

  async function fetchData() {
    setLoading(true)
    try {
      const [vRes, pRes] = await Promise.all([
        fetch(`/api/vendors/${slug}`),
        fetch('/api/admin/plans'),
      ])
      const vData = await vRes.json()
      const pData = await pRes.json()
      setVendor(vData)
      setPlans((pData.plans || []).sort((a: Plan, b: Plan) => a.sortOrder - b.sortOrder))
      setFeatures(pData.features || [])

      if (vData.id) {
        const [sRes, cRes] = await Promise.all([
          fetch(`/api/admin/subscriptions`),
          fetch(`/api/admin/vendors/${vData.id}/credits`),
        ])
        const sData = await sRes.json()
        const cData = await cRes.json()
        const subs = (sData.subscriptions || []).filter((s: any) => s.vendorId === vData.id)
        setSub(subs.find((s: Sub) => s.status !== 'cancelled') || null)
        setCredits(cData.credits || [])
        setCreditBalance(cData.balance || 0)
      }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleCheckout(planSlug: string) {
    if (!vendor) return
    const res = await fetch('/api/stripe/subscription-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: vendor.id, planSlug, billingCycle }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  async function handlePortal() {
    if (!vendor) return
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId: vendor.id }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  const formatPence = (p: number) => `£${(p / 100).toFixed(2)}`
  const getPrice = (plan: Plan) => billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice
  const getMonthlyEquivalent = (plan: Plan) => billingCycle === 'yearly' && plan.yearlyPrice ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice

  if (loading) return <div className="py-20 text-center text-gray-400">Loading billing...</div>

  const currentPlanSlug = subscription?.plan?.slug
  const addonFeatures = features.filter((f) => f.isAddon)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>

      {/* Current Plan */}
      {subscription && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">Current Plan: {subscription.plan.name}</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {formatPence(subscription.plan.monthlyPrice)}/month · {subscription.billingCycle} billing
                {subscription.cancelAtPeriodEnd && <span className="ml-2 text-orange-500">Cancels at period end</span>}
              </p>
              {subscription.currentPeriodEnd && (
                <p className="mt-0.5 text-xs text-gray-400">
                  Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <button
              onClick={handlePortal}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <CreditCard className="h-4 w-4" /> Manage Payment
            </button>
          </div>
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${billingCycle === 'monthly' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${billingCycle === 'yearly' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Yearly <span className="ml-1 text-xs text-green-500">Save 20%</span>
        </button>
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const planFeatures: string[] = JSON.parse(plan.features || '[]')
          const isCurrent = plan.slug === currentPlanSlug
          const isPopular = plan.slug === 'pro'

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 ${isCurrent ? 'border-amber-500 bg-amber-50' : isPopular ? 'border-gray-900 bg-white shadow-lg' : 'border-gray-200 bg-white'}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-3 py-0.5 text-xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                {plan.monthlyPrice === 0 ? (
                  <span className="text-3xl font-bold text-gray-900">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900">{formatPence(getMonthlyEquivalent(plan))}</span>
                    <span className="text-sm text-gray-500">/mo</span>
                    {billingCycle === 'yearly' && plan.yearlyPrice && (
                      <p className="text-xs text-gray-400 mt-0.5">Billed {formatPence(plan.yearlyPrice)}/year</p>
                    )}
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Up to {plan.maxVehicles} vehicle{plan.maxVehicles !== 1 ? 's' : ''}</p>

              <ul className="mt-4 space-y-2">
                {planFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {features.find((feat) => feat.slug === f)?.name || f.replace(/-/g, ' ')}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <button disabled className="w-full rounded-lg bg-amber-100 py-2.5 text-sm font-medium text-amber-700">
                    Current Plan
                  </button>
                ) : plan.monthlyPrice === 0 ? (
                  <button disabled className="w-full rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-500">
                    Free Tier
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(plan.slug)}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium text-white ${isPopular ? 'bg-gray-900 hover:bg-gray-800' : 'bg-amber-500 hover:bg-amber-600'}`}
                  >
                    {currentPlanSlug ? 'Switch Plan' : 'Get Started'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Available Addons */}
      {addonFeatures.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" /> Available Add-ons
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {addonFeatures.map((f) => (
              <div key={f.slug} className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="font-medium text-gray-900">{f.name}</h3>
                {f.description && <p className="mt-1 text-sm text-gray-500">{f.description}</p>}
                {f.monthlyPrice && (
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {formatPence(f.monthlyPrice)}<span className="text-sm font-normal text-gray-500">/mo</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credits & Discounts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-500" /> Credits
          </h2>
          <p className="text-2xl font-bold text-green-600">{formatPence(creditBalance)}</p>
          <p className="text-sm text-gray-500">Available balance</p>
          {credits.length > 0 && (
            <div className="mt-3 space-y-1">
              {credits.slice(0, 3).map((c) => (
                <div key={c.id} className="flex justify-between text-sm">
                  <span className="text-gray-500 capitalize">{c.reason.replace(/_/g, ' ')}</span>
                  <span className={c.appliedToInvoice ? 'text-gray-400 line-through' : 'text-green-600'}>{formatPence(c.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Percent className="h-5 w-5 text-purple-500" /> Active Discounts
          </h2>
          {discounts.filter((d) => d.isActive).length === 0 ? (
            <p className="text-sm text-gray-500">No active discounts</p>
          ) : (
            discounts.filter((d) => d.isActive).map((d) => (
              <div key={d.id} className="flex justify-between text-sm py-1">
                <span className="text-gray-700">{d.name}</span>
                <span className="text-purple-600 font-medium">
                  {d.type === 'percentage' ? `${d.value}% off` : `${formatPence(d.value)} off`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
