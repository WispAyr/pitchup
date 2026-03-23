'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Gift, Percent, Puzzle, Plus, X } from 'lucide-react'

type Vendor = { id: string; name: string; slug: string; email: string; stripeCustomerId: string | null; planId: string | null }
type Sub = { id: string; plan: { name: string; monthlyPrice: number }; status: string; billingCycle: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean }
type Credit = { id: string; amount: number; reason: string; description: string | null; appliedToInvoice: string | null; expiresAt: string | null; createdAt: string }
type Discount = { id: string; name: string; type: string; value: number; duration: string; isActive: boolean; appliedAt: string }
type Addon = { id: string; feature: { slug: string; name: string }; status: string; startedAt: string }
type Payment = { id: string; amount: number; status: string; description: string | null; createdAt: string; refundedAmount: number }

export default function VendorBillingPage() {
  const params = useParams()
  const vendorId = params.id as string

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [subscription, setSub] = useState<Sub | null>(null)
  const [credits, setCredits] = useState<Credit[]>([])
  const [creditBalance, setCreditBalance] = useState(0)
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showAddonModal, setShowAddonModal] = useState(false)
  const [creditForm, setCreditForm] = useState({ amount: '', reason: 'manual', description: '' })
  const [discountForm, setDiscountForm] = useState({ name: '', type: 'percentage', value: '', duration: 'once', durationMonths: '' })
  const [addonSlug, setAddonSlug] = useState('')
  const [features, setFeatures] = useState<Array<{ slug: string; name: string; isAddon: boolean }>>([])

  useEffect(() => { fetchAll() }, [vendorId])

  async function fetchAll() {
    setLoading(true)
    const [vRes, sRes, cRes, pRes, fRes] = await Promise.all([
      fetch(`/api/admin/vendors/${vendorId}`),
      fetch(`/api/admin/subscriptions?vendorId=${vendorId}`),
      fetch(`/api/admin/vendors/${vendorId}/credits`),
      fetch(`/api/admin/payments?vendor=${vendorId}&limit=10`),
      fetch('/api/admin/plans'),
    ])
    const vData = await vRes.json()
    const sData = await sRes.json()
    const cData = await cRes.json()
    const pData = await pRes.json()
    const fData = await fRes.json()

    setVendor(vData.vendor || vData)
    const subs = sData.subscriptions || []
    setSub(subs.find((s: Sub) => s.status !== 'cancelled') || subs[0] || null)
    setCredits(cData.credits || [])
    setCreditBalance(cData.balance || 0)
    setPayments(pData.payments || [])
    setFeatures((fData.features || []).filter((f: any) => f.isAddon))

    // Fetch addons and discounts
    try {
      const dRes = await fetch(`/api/admin/vendors/${vendorId}`)
      const dData = await dRes.json()
      setDiscounts(dData.discounts || [])
      setAddons(dData.addons || [])
    } catch {}
    setLoading(false)
  }

  async function addCredit() {
    await fetch(`/api/admin/vendors/${vendorId}/credits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(parseFloat(creditForm.amount) * 100),
        reason: creditForm.reason,
        description: creditForm.description,
      }),
    })
    setShowCreditModal(false)
    setCreditForm({ amount: '', reason: 'manual', description: '' })
    fetchAll()
  }

  async function addDiscount() {
    await fetch(`/api/admin/vendors/${vendorId}/discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: discountForm.name,
        type: discountForm.type,
        value: discountForm.type === 'percentage' ? parseInt(discountForm.value) : Math.round(parseFloat(discountForm.value) * 100),
        duration: discountForm.duration,
        durationMonths: discountForm.durationMonths ? parseInt(discountForm.durationMonths) : undefined,
      }),
    })
    setShowDiscountModal(false)
    setDiscountForm({ name: '', type: 'percentage', value: '', duration: 'once', durationMonths: '' })
    fetchAll()
  }

  async function addAddon() {
    await fetch(`/api/admin/vendors/${vendorId}/addons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureSlug: addonSlug }),
    })
    setShowAddonModal(false)
    setAddonSlug('')
    fetchAll()
  }

  async function removeAddon(slug: string) {
    await fetch(`/api/admin/vendors/${vendorId}/addons`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featureSlug: slug }),
    })
    fetchAll()
  }

  const formatPence = (p: number) => `£${(p / 100).toFixed(2)}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) return <div className="py-20 text-center text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/vendors" className="text-gray-400 hover:text-white"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-white">{vendor?.name} - Billing</h1>
      </div>

      {/* Vendor Info + Subscription */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-3 text-lg font-semibold text-white">Vendor Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="text-white">{vendor?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{vendor?.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Slug</span><span className="text-gray-300">{vendor?.slug}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Stripe ID</span><span className="text-gray-300 font-mono text-xs">{vendor?.stripeCustomerId || 'Not set'}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-3 text-lg font-semibold text-white flex items-center gap-2"><CreditCard className="h-5 w-5 text-amber-400" /> Subscription</h2>
          {subscription ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Plan</span><span className="text-white font-medium">{subscription.plan.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Price</span><span className="text-white">{formatPence(subscription.plan.monthlyPrice)}/mo</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Status</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${subscription.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{subscription.status}</span>
              </div>
              <div className="flex justify-between"><span className="text-gray-400">Cycle</span><span className="text-gray-300 capitalize">{subscription.billingCycle}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Next billing</span><span className="text-gray-300">{formatDate(subscription.currentPeriodEnd || '')}</span></div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active subscription</p>
          )}
        </div>
      </div>

      {/* Credits */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Gift className="h-5 w-5 text-green-400" /> Credits</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Balance: <span className="text-green-400 font-medium">{formatPence(creditBalance)}</span></span>
            <button onClick={() => setShowCreditModal(true)} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
              <Plus className="h-3.5 w-3.5" /> Add Credit
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {credits.length === 0 ? (
            <p className="text-sm text-gray-500">No credits</p>
          ) : credits.slice(0, 5).map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2 text-sm">
              <div>
                <span className="text-white">{formatPence(c.amount)}</span>
                <span className="ml-2 text-gray-500">{c.reason}</span>
                {c.description && <span className="ml-1 text-gray-600">- {c.description}</span>}
              </div>
              <div className="text-xs text-gray-500">
                {c.appliedToInvoice ? <span className="text-green-400">Applied</span> : 'Available'}
                {' · '}{formatDate(c.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discounts */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Percent className="h-5 w-5 text-purple-400" /> Discounts</h2>
          <button onClick={() => setShowDiscountModal(true)} className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700">
            <Plus className="h-3.5 w-3.5" /> Add Discount
          </button>
        </div>
        {discounts.length === 0 ? (
          <p className="text-sm text-gray-500">No discounts</p>
        ) : discounts.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2 text-sm mb-2">
            <div>
              <span className="text-white font-medium">{d.name}</span>
              <span className="ml-2 text-gray-400">
                {d.type === 'percentage' ? `${d.value}% off` : `${formatPence(d.value)} off`}
              </span>
              <span className="ml-2 text-xs text-gray-500 capitalize">{d.duration}</span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${d.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
              {d.isActive ? 'Active' : 'Expired'}
            </span>
          </div>
        ))}
      </div>

      {/* Addons */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2"><Puzzle className="h-5 w-5 text-blue-400" /> Addons</h2>
          <button onClick={() => setShowAddonModal(true)} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Add Addon
          </button>
        </div>
        {addons.length === 0 ? (
          <p className="text-sm text-gray-500">No addons</p>
        ) : addons.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2 text-sm mb-2">
            <div>
              <span className="text-white font-medium">{a.feature.name}</span>
              <span className="ml-2 text-xs text-gray-500">{a.feature.slug}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${a.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{a.status}</span>
              {a.status === 'active' && (
                <button onClick={() => removeAddon(a.feature.slug)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Payment History</h2>
        <div className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No payments</p>
          ) : payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2 text-sm">
              <div>
                <span className="text-white">{formatPence(p.amount)}</span>
                {p.refundedAmount > 0 && <span className="ml-1 text-xs text-red-400">(-{formatPence(p.refundedAmount)} refunded)</span>}
                <span className="ml-2 text-gray-500">{p.description || 'Payment'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs ${p.status === 'succeeded' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'}`}>{p.status}</span>
                <span className="text-xs text-gray-500">{formatDate(p.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCreditModal(false)}>
          <div className="mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Credit</h3>
              <button onClick={() => setShowCreditModal(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount (£)</label>
                <input type="number" step="0.01" value={creditForm.amount} onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" placeholder="10.00" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Reason</label>
                <select value={creditForm.reason} onChange={(e) => setCreditForm({ ...creditForm, reason: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
                  <option value="manual">Manual</option>
                  <option value="signup_bonus">Signup Bonus</option>
                  <option value="referral">Referral</option>
                  <option value="compensation">Compensation</option>
                  <option value="promotion">Promotion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input type="text" value={creditForm.description} onChange={(e) => setCreditForm({ ...creditForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" placeholder="Optional note..." />
              </div>
              <button onClick={addCredit} className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700">Add Credit</button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowDiscountModal(false)}>
          <div className="mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Discount</h3>
              <button onClick={() => setShowDiscountModal(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input type="text" value={discountForm.name} onChange={(e) => setDiscountForm({ ...discountForm, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" placeholder="Early Bird 20%" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select value={discountForm.type} onChange={(e) => setDiscountForm({ ...discountForm, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{discountForm.type === 'percentage' ? 'Percent Off' : 'Amount (£)'}</label>
                  <input type="number" value={discountForm.value} onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" placeholder={discountForm.type === 'percentage' ? '20' : '10.00'} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Duration</label>
                <select value={discountForm.duration} onChange={(e) => setDiscountForm({ ...discountForm, duration: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
                  <option value="once">Once</option>
                  <option value="repeating">Repeating</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
              {discountForm.duration === 'repeating' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration (months)</label>
                  <input type="number" value={discountForm.durationMonths} onChange={(e) => setDiscountForm({ ...discountForm, durationMonths: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none" placeholder="3" />
                </div>
              )}
              <button onClick={addDiscount} className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700">Add Discount</button>
            </div>
          </div>
        </div>
      )}

      {/* Addon Modal */}
      {showAddonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowAddonModal(false)}>
          <div className="mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Addon Feature</h3>
              <button onClick={() => setShowAddonModal(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <select value={addonSlug} onChange={(e) => setAddonSlug(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none">
                <option value="">Select a feature...</option>
                {features.map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
              </select>
              <button onClick={addAddon} disabled={!addonSlug} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">Add Addon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
