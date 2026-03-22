'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, Edit3, Copy, Check, ToggleLeft, ToggleRight, Share2 } from 'lucide-react'

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

  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', description: '',
    minOrder: '', maxUses: '', maxUsesPerCustomer: '', expiresAt: '',
    freeItemId: '',
  })

  const fetchData = useCallback(async () => {
    if (!vendorId) return
    try {
      const res = await fetch(`/api/vendor/${slug}/vouchers`)
      if (res.ok) setVouchers(await res.json())
    } catch {} finally { setLoading(false) }
  }, [vendorId, slug])

  useEffect(() => { fetchData() }, [fetchData])

  function resetForm() {
    setForm({ code: '', type: 'percentage', value: '', description: '',
      minOrder: '', maxUses: '', maxUsesPerCustomer: '', expiresAt: '', freeItemId: '' })
    setEditId(null); setShowForm(false)
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

  function shareUrl(code: string) {
    const url = `${window.location.origin}/vendor/${slug}?voucher=${code}`
    navigator.clipboard.writeText(url)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
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
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white active:bg-gray-800">
          <Plus className="h-4 w-4" /> New Voucher
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Voucher' : 'New Voucher'}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Code {!editId && <span className="text-gray-400">(leave blank to auto-generate)</span>}</label>
              <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                disabled={!!editId} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono uppercase disabled:bg-gray-50"
                placeholder="CHIPPY10" />
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

      {vouchers.length === 0 && !showForm ? (
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
                  <button onClick={() => shareUrl(v.code)} title="Copy share link"
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                    <Share2 className="h-4 w-4" />
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
    </div>
  )
}
