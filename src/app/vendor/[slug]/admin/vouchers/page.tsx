'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Plus, Trash2, Edit3, Copy, Check, ToggleLeft, ToggleRight, Share2,
  Download, QrCode, Printer, Gift, Layers, ExternalLink, X,
  Facebook, MessageCircle,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type VoucherData = {
  id: string; code: string; type: string; value: number | null
  description: string; minOrder: number | null; maxUses: number | null
  usesCount: number; maxUsesPerCustomer: number | null
  validFrom: string; expiresAt: string | null; isActive: boolean
  freeItemId: string | null; applicableTo: string | null
  giftCardBalance: number | null; createdAt: string
  _count: { redemptions: number }
}

const VOUCHER_TYPES = [
  { value: 'percentage', label: 'Percentage Off' },
  { value: 'fixed', label: 'Fixed Amount Off' },
  { value: 'freeItem', label: 'Free Item' },
  { value: 'buyOneGetOne', label: 'Buy One Get One Free' },
  { value: 'giftCard', label: 'Gift Card' },
]

const GIFT_AMOUNTS = [1000, 2500, 5000] // pence

function generateSuggestedCode(slug: string): string {
  const prefix = slug.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  return `${prefix}-${suffix}`
}

export default function AdminVouchersPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()
  const vendorId = (session?.user as any)?.id

  const [vouchers, setVouchers] = useState<VoucherData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [previewVoucher, setPreviewVoucher] = useState<VoucherData | null>(null)
  const [showBatch, setShowBatch] = useState(false)
  const [showGiftCard, setShowGiftCard] = useState(false)
  const [batchCount, setBatchCount] = useState(10)
  const [batchSubmitting, setBatchSubmitting] = useState(false)
  const [giftAmount, setGiftAmount] = useState(2500)
  const [giftCustomAmount, setGiftCustomAmount] = useState('')
  const [giftRecipient, setGiftRecipient] = useState('')
  const [vendorInfo, setVendorInfo] = useState<any>(null)

  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', description: '',
    minOrder: '', maxUses: '', maxUsesPerCustomer: '', expiresAt: '',
    freeItemId: '',
  })

  const fetchData = useCallback(async () => {
    if (!vendorId) return
    try {
      const [vRes, viRes] = await Promise.all([
        fetch(`/api/vendor/${slug}/vouchers`),
        fetch(`/api/vendors/${slug}`),
      ])
      if (vRes.ok) setVouchers(await vRes.json())
      if (viRes.ok) setVendorInfo(await viRes.json())
    } catch {} finally { setLoading(false) }
  }, [vendorId, slug])

  useEffect(() => { fetchData() }, [fetchData])

  function resetForm() {
    setForm({ code: '', type: 'percentage', value: '', description: '',
      minOrder: '', maxUses: '', maxUsesPerCustomer: '', expiresAt: '', freeItemId: '' })
    setEditId(null); setShowForm(false); setShowBatch(false); setShowGiftCard(false)
  }

  function openNewVoucher() {
    resetForm()
    setForm(prev => ({ ...prev, code: generateSuggestedCode(slug) }))
    setShowForm(true)
  }

  function editVoucher(v: VoucherData) {
    setForm({
      code: v.code, type: v.type, value: v.value?.toString() || '',
      description: v.description, minOrder: v.minOrder?.toString() || '',
      maxUses: v.maxUses?.toString() || '', maxUsesPerCustomer: v.maxUsesPerCustomer?.toString() || '',
      expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString().split('T')[0] : '',
      freeItemId: v.freeItemId || '',
    })
    setEditId(v.id); setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      const url = editId ? `/api/vendor/${slug}/vouchers/${editId}` : `/api/vendor/${slug}/vouchers`
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      resetForm(); await fetchData()
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  async function handleBatchCreate(e: React.FormEvent) {
    e.preventDefault(); setBatchSubmitting(true); setError('')
    try {
      const res = await fetch(`/api/vendor/${slug}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, batch: batchCount }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      resetForm(); await fetchData()
    } catch (err: any) { setError(err.message) }
    finally { setBatchSubmitting(false) }
  }

  async function handleGiftCardCreate(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError('')
    const amount = giftCustomAmount ? parseFloat(giftCustomAmount) * 100 : giftAmount
    try {
      const res = await fetch(`/api/vendor/${slug}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'giftCard',
          value: amount / 100,
          description: `£${(amount / 100).toFixed(2)} Gift Voucher${giftRecipient ? ` for ${giftRecipient}` : ''}`,
          code: generateSuggestedCode(slug),
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      resetForm(); await fetchData()
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  async function toggleActive(v: VoucherData) {
    await fetch(`/api/vendor/${slug}/vouchers/${v.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !v.isActive }),
    })
    await fetchData()
  }

  async function deleteVoucher(id: string) {
    if (!confirm('Delete this voucher?')) return
    await fetch(`/api/vendor/${slug}/vouchers/${id}`, { method: 'DELETE' })
    await fetchData()
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  function getVoucherUrl(code: string) {
    return `${window.location.origin}/vendor/${slug}/voucher/${code}`
  }

  function getOrderUrlWithCode(code: string) {
    return `${window.location.origin}/vendor/${slug}/order?voucher=${code}`
  }

  function shareWhatsApp(v: VoucherData) {
    const text = `🎟️ ${valueDisplay(v)} at ${vendorInfo?.name || slug}!\n\nUse code: ${v.code}\n${getVoucherUrl(v.code)}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  function shareFacebook(v: VoucherData) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getVoucherUrl(v.code))}`, '_blank')
  }

  function typeLabel(type: string) {
    return VOUCHER_TYPES.find(t => t.value === type)?.label || type
  }

  function valueDisplay(v: VoucherData) {
    switch (v.type) {
      case 'percentage': return `${v.value}% off`
      case 'fixed': return `£${v.value?.toFixed(2)} off`
      case 'giftCard': return `£${((v.giftCardBalance || 0) / 100).toFixed(2)} balance`
      case 'freeItem': return 'Free item'
      case 'buyOneGetOne': return 'BOGOF'
      default: return ''
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Vouchers</h1>
          <p className="text-sm text-gray-500">Create discount codes, gift cards, and promotional offers.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetForm(); setShowGiftCard(true) }}
            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50">
            <Gift className="h-4 w-4" /> Gift Card
          </button>
          <button onClick={() => { openNewVoucher(); setShowBatch(true) }}
            className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50">
            <Layers className="h-4 w-4" /> Batch
          </button>
          <button onClick={openNewVoucher}
            className="flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white active:bg-gray-800">
            <Plus className="h-4 w-4" /> New Voucher
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {/* Gift Card Flow */}
      {showGiftCard && (
        <form onSubmit={handleGiftCardCreate} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">🎁 Create Gift Voucher</h2>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <p className="text-sm text-gray-500">Generate a monetary gift voucher with a unique code. Balance can be partially redeemed.</p>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Amount</label>
            <div className="flex gap-2 flex-wrap">
              {GIFT_AMOUNTS.map(a => (
                <button key={a} type="button" onClick={() => { setGiftAmount(a); setGiftCustomAmount('') }}
                  className={`rounded-xl px-5 py-3 text-sm font-bold border transition-colors ${
                    giftAmount === a && !giftCustomAmount ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}>
                  £{(a / 100).toFixed(0)}
                </button>
              ))}
              <input type="number" step="0.01" placeholder="Custom £"
                value={giftCustomAmount} onChange={e => { setGiftCustomAmount(e.target.value); setGiftAmount(0) }}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm w-32" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Recipient Name <span className="text-gray-400">(optional)</span></label>
            <input type="text" value={giftRecipient} onChange={e => setGiftRecipient(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="e.g. Sarah" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gray-900 font-bold text-white disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Gift Voucher'}
            </button>
            <button type="button" onClick={resetForm}
              className="flex h-11 items-center rounded-xl border border-gray-200 px-6 font-bold text-gray-600">Cancel</button>
          </div>
        </form>
      )}

      {/* Batch Flow */}
      {showBatch && showForm && (
        <form onSubmit={handleBatchCreate} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">📦 Batch Create Vouchers</h2>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <p className="text-sm text-gray-500">Create multiple unique codes for the same offer — great for events, flyers, or giveaways.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                {VOUCHER_TYPES.filter(t => t.value !== 'giftCard').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">How Many</label>
              <div className="flex gap-2">
                {[10, 25, 50].map(n => (
                  <button key={n} type="button" onClick={() => setBatchCount(n)}
                    className={`flex-1 rounded-xl py-3 text-sm font-bold border ${batchCount === n ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(form.type === 'percentage' || form.type === 'fixed') && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {form.type === 'percentage' ? 'Percentage' : 'Amount (£)'}
              </label>
              <input type="number" step="any" value={form.value} onChange={e => setForm({...form, value: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <input type="text" required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="10% off any order" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Max Uses Per Code</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="1" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Expires</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={batchSubmitting}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gray-900 font-bold text-white disabled:opacity-50">
              {batchSubmitting ? 'Creating...' : `Create ${batchCount} Vouchers`}
            </button>
            <button type="button" onClick={resetForm}
              className="flex h-11 items-center rounded-xl border border-gray-200 px-6 font-bold text-gray-600">Cancel</button>
          </div>
        </form>
      )}

      {/* Single Voucher Form */}
      {showForm && !showBatch && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Voucher' : 'New Voucher'}</h2>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Code
                {!editId && (
                  <button type="button" onClick={() => setForm({...form, code: generateSuggestedCode(slug)})}
                    className="ml-2 text-xs text-blue-600 hover:underline">↻ Generate</button>
                )}
              </label>
              <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                disabled={!!editId} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono uppercase disabled:bg-gray-50"
                placeholder="AUTO-GENERATED" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                {VOUCHER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {(form.type === 'percentage' || form.type === 'fixed' || form.type === 'giftCard') && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {form.type === 'percentage' ? 'Percentage' : 'Amount (£)'}
              </label>
              <input type="number" step="any" value={form.value} onChange={e => setForm({...form, value: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                placeholder={form.type === 'percentage' ? '10' : '2.00'} />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <input type="text" required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="10% off any order" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Min Order (£)</label>
              <input type="number" step="0.01" value={form.minOrder} onChange={e => setForm({...form, minOrder: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="∞" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Per Customer</label>
              <input type="number" value={form.maxUsesPerCustomer} onChange={e => setForm({...form, maxUsesPerCustomer: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="∞" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Expires</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gray-900 font-bold text-white disabled:opacity-50">
              {submitting ? 'Saving...' : editId ? 'Update' : 'Create Voucher'}
            </button>
            <button type="button" onClick={resetForm}
              className="flex h-11 items-center rounded-xl border border-gray-200 px-6 font-bold text-gray-600">Cancel</button>
          </div>
        </form>
      )}

      {/* Public vouchers page link */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <ExternalLink className="h-3.5 w-3.5" />
        Public vouchers page:
        <a href={`/vendor/${slug}/vouchers`} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-mono text-xs">/vendor/{slug}/vouchers</a>
      </div>

      {/* Voucher List */}
      {vouchers.length === 0 && !showForm && !showGiftCard ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">🎟️</p>
          <p className="font-bold text-gray-900">No vouchers yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first discount code or gift card.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map(v => (
            <div key={v.id} className={`rounded-2xl border p-4 ${v.isActive ? 'border-gray-100 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-lg font-extrabold text-gray-900">{v.code}</span>
                    <button onClick={() => copyCode(v.code)} className="text-gray-400 hover:text-gray-600">
                      {copiedCode === v.code ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    }`}>{v.isActive ? 'Active' : 'Inactive'}</span>
                    {v.type === 'giftCard' && <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-xs font-bold">Gift Card</span>}
                  </div>
                  <p className="text-sm text-gray-600">{v.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-gray-100 px-2 py-1 font-bold">{typeLabel(v.type)}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 font-bold text-blue-700">{valueDisplay(v)}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-1">
                      {v._count.redemptions} used{v.maxUses ? ` / ${v.maxUses}` : ''}
                    </span>
                    {v.expiresAt && (
                      <span className={`rounded-full px-2 py-1 ${new Date(v.expiresAt) < new Date() ? 'bg-red-50 text-red-600' : 'bg-gray-100'}`}>
                        Expires {new Date(v.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-3">
                  <button onClick={() => setPreviewVoucher(v)} title="Preview & Share"
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <QrCode className="h-4 w-4" />
                  </button>
                  <button onClick={() => shareWhatsApp(v)} title="Share on WhatsApp"
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button onClick={() => toggleActive(v)} title={v.isActive ? 'Deactivate' : 'Activate'}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                    {v.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button onClick={() => editVoucher(v)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteVoucher(v.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Voucher Preview Modal */}
      {previewVoucher && (
        <VoucherPreviewModal
          voucher={previewVoucher}
          slug={slug}
          vendorName={vendorInfo?.name || slug}
          vendorLogo={vendorInfo?.logo}
          primaryColor={vendorInfo?.primaryColor || '#F59E0B'}
          secondaryColor={vendorInfo?.secondaryColor || '#78350F'}
          onClose={() => setPreviewVoucher(null)}
          onShareWhatsApp={() => shareWhatsApp(previewVoucher)}
          onShareFacebook={() => shareFacebook(previewVoucher)}
        />
      )}
    </div>
  )
}

function VoucherPreviewModal({ voucher, slug, vendorName, vendorLogo, primaryColor, secondaryColor, onClose, onShareWhatsApp, onShareFacebook }: {
  voucher: VoucherData; slug: string; vendorName: string; vendorLogo?: string; primaryColor: string; secondaryColor: string
  onClose: () => void; onShareWhatsApp: () => void; onShareFacebook: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const voucherUrl = `${window.location.origin}/vendor/${slug}/voucher/${voucher.code}`
  const orderUrl = `${window.location.origin}/vendor/${slug}/order?voucher=${voucher.code}`

  useEffect(() => {
    // Generate QR code as data URL
    fetch(`/api/qrcode/${slug}?text=${encodeURIComponent(orderUrl)}&size=200`)
      .then(r => r.blob())
      .then(b => {
        const url = URL.createObjectURL(b)
        setQrDataUrl(url)
      })
      .catch(() => {})
  }, [orderUrl, slug])

  function copyLink() {
    navigator.clipboard.writeText(voucherUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function printVoucher() {
    const printWindow = window.open('', '_blank')
    if (!printWindow || !cardRef.current) return
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Voucher ${voucher.code}</title>
      <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f9f9f9; }
        .card { width: 400px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .top { padding: 24px; text-align: center; color: white; }
        .bottom { padding: 24px; background: white; text-align: center; }
        .code { font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 2px; }
        .desc { font-size: 14px; margin-top: 4px; opacity: 0.9; }
        .value { font-size: 36px; font-weight: 900; margin: 8px 0; }
        .small { font-size: 12px; color: #666; margin-top: 8px; }
        .qr { margin: 12px auto; }
        @media print { body { background: white; } .card { box-shadow: none; border: 1px solid #ddd; } }
      </style></head><body>
      <div class="card">
        <div class="top" style="background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});">
          <div style="font-size:18px;font-weight:700;">${vendorName}</div>
          <div class="value">${getValueText(voucher)}</div>
          <div class="desc">${voucher.description}</div>
        </div>
        <div class="bottom">
          <div class="code">${voucher.code}</div>
          ${qrDataUrl ? `<img src="${qrDataUrl}" class="qr" width="150" height="150" />` : ''}
          <div class="small">Scan or enter code <strong>${voucher.code}</strong> at checkout</div>
          ${voucher.expiresAt ? `<div class="small">Valid until ${new Date(voucher.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>` : ''}
        </div>
      </div>
      <script>setTimeout(()=>window.print(),500)</script>
      </body></html>
    `)
    printWindow.document.close()
  }

  function downloadImage() {
    // Use canvas to render voucher as image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 800
    canvas.height = 500
    const w = canvas.width, h = canvas.height

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, primaryColor)
    grad.addColorStop(1, secondaryColor)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(0, 0, w, h, 24)
    ctx.fill()

    // Semi-transparent overlay for bottom
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.beginPath()
    ctx.roundRect(20, h * 0.5, w - 40, h * 0.45, 16)
    ctx.fill()

    // Vendor name
    ctx.fillStyle = 'white'
    ctx.font = 'bold 24px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(vendorName, w / 2, 50)

    // Value
    ctx.font = 'bold 64px system-ui, sans-serif'
    ctx.fillText(getValueText(voucher), w / 2, 130)

    // Description
    ctx.font = '20px system-ui, sans-serif'
    ctx.globalAlpha = 0.9
    ctx.fillText(voucher.description, w / 2, 170)
    ctx.globalAlpha = 1

    // Code
    ctx.fillStyle = '#111'
    ctx.font = 'bold 40px monospace'
    ctx.fillText(voucher.code, w / 2, h * 0.65)

    // Footer text
    ctx.fillStyle = '#666'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText(`Scan or enter code ${voucher.code} at checkout`, w / 2, h * 0.78)

    if (voucher.expiresAt) {
      ctx.fillText(`Valid until ${new Date(voucher.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, w / 2, h * 0.85)
    }

    // Download
    const link = document.createElement('a')
    link.download = `voucher-${voucher.code}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Voucher Card Preview */}
        <div ref={cardRef}>
          <div className="p-8 text-center text-white" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
            {vendorLogo ? (
              <img src={vendorLogo} alt={vendorName} className="h-8 mx-auto mb-2 object-contain" />
            ) : (
              <p className="text-lg font-bold mb-1">{vendorName}</p>
            )}
            <p className="text-4xl font-black">{getValueText(voucher)}</p>
            <p className="text-sm opacity-90 mt-1">{voucher.description}</p>
          </div>
          <div className="p-6 text-center">
            <p className="font-mono text-3xl font-black tracking-widest text-gray-900">{voucher.code}</p>
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="mx-auto my-4" width={150} height={150} />
            )}
            <p className="text-sm text-gray-500">Scan or enter code <strong>{voucher.code}</strong> at checkout</p>
            {voucher.expiresAt && (
              <p className="text-xs text-gray-400 mt-1">
                Valid until {new Date(voucher.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            {voucher.type === 'giftCard' && voucher.giftCardBalance != null && (
              <p className="text-sm font-bold text-purple-700 mt-2">
                Balance: £{(voucher.giftCardBalance / 100).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex gap-2">
            <button onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button onClick={downloadImage}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
              <Download className="h-4 w-4" /> Download
            </button>
            <button onClick={printVoucher}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={onShareWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-bold text-white hover:bg-green-600">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </button>
            <button onClick={onShareFacebook}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              <Facebook className="h-4 w-4" /> Facebook
            </button>
          </div>
          <button onClick={onClose}
            className="w-full flex items-center justify-center rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function getValueText(v: VoucherData): string {
  switch (v.type) {
    case 'percentage': return `${v.value}% OFF`
    case 'fixed': return `£${v.value?.toFixed(2)} OFF`
    case 'giftCard': return `£${((v.giftCardBalance || v.value || 0) / (v.giftCardBalance ? 100 : 1)).toFixed(2)}`
    case 'freeItem': return 'FREE ITEM'
    case 'buyOneGetOne': return 'BOGOF'
    default: return ''
  }
}
