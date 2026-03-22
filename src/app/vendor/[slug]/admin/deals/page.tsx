'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, Edit3, Star, StarOff, ToggleLeft, ToggleRight } from 'lucide-react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DEAL_TYPES = [
  { value: 'bundle', label: 'Bundle Deal' },
  { value: 'happyHour', label: 'Happy Hour' },
  { value: 'daySpecial', label: 'Day Special' },
  { value: 'event', label: 'Event Deal' },
]

type DealData = {
  id: string; title: string; description: string; type: string
  price: number | null; savings: string | null; imageUrl: string | null
  items: string | null; validDays: string | null
  validFrom: string | null; validTo: string | null
  startDate: string | null; endDate: string | null
  isFeatured: boolean; isActive: boolean; createdAt: string
}

export default function AdminDealsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()
  const vendorId = (session?.user as any)?.id

  const [deals, setDeals] = useState<DealData[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '', description: '', type: 'bundle', price: '', savings: '',
    validDays: [] as number[], validFrom: '', validTo: '',
    startDate: '', endDate: '', isFeatured: false,
  })

  const fetchData = useCallback(async () => {
    if (!vendorId) return
    try {
      const res = await fetch(`/api/vendor/${slug}/deals?admin=true`)
      if (res.ok) setDeals(await res.json())
    } catch {} finally { setLoading(false) }
  }, [vendorId, slug])

  useEffect(() => { fetchData() }, [fetchData])

  function resetForm() {
    setForm({ title: '', description: '', type: 'bundle', price: '', savings: '',
      validDays: [], validFrom: '', validTo: '', startDate: '', endDate: '', isFeatured: false })
    setEditId(null); setShowForm(false)
  }

  function editDeal(d: DealData) {
    setForm({
      title: d.title, description: d.description, type: d.type,
      price: d.price?.toString() || '', savings: d.savings || '',
      validDays: d.validDays ? JSON.parse(d.validDays) : [],
      validFrom: d.validFrom || '', validTo: d.validTo || '',
      startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
      endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
      isFeatured: d.isFeatured,
    })
    setEditId(d.id); setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError('')
    try {
      const url = editId ? `/api/vendor/${slug}/deals/${editId}` : `/api/vendor/${slug}/deals`
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: form.price || null,
          validDays: form.validDays.length > 0 ? form.validDays : null,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      resetForm(); await fetchData()
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  async function toggleActive(d: DealData) {
    await fetch(`/api/vendor/${slug}/deals/${d.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !d.isActive }),
    })
    await fetchData()
  }

  async function toggleFeatured(d: DealData) {
    await fetch(`/api/vendor/${slug}/deals/${d.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !d.isFeatured }),
    })
    await fetchData()
  }

  async function deleteDeal(id: string) {
    if (!confirm('Delete this deal?')) return
    await fetch(`/api/vendor/${slug}/deals/${id}`, { method: 'DELETE' })
    await fetchData()
  }

  function toggleDay(day: number) {
    setForm(f => ({
      ...f,
      validDays: f.validDays.includes(day) ? f.validDays.filter(d => d !== day) : [...f.validDays, day]
    }))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Deals & Offers</h1>
          <p className="text-sm text-gray-500">Create bundles, happy hours, and special deals.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white active:bg-gray-800">
          <Plus className="h-4 w-4" /> New Deal
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Deal' : 'New Deal'}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="Family Friday Deal" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                {DEAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" rows={2}
              placeholder="2 fish suppers + 2 kids meals + 4 cans for £25" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Deal Price (£)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="25.00" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Savings Text</label>
              <input type="text" value={form.savings} onChange={e => setForm({...form, savings: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="Save £8!" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Valid Days</label>
            <div className="flex gap-2">
              {DAY_NAMES.map((name, i) => (
                <button key={i} type="button" onClick={() => toggleDay(i)}
                  className={`flex h-10 w-12 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    form.validDays.includes(i) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>{name}</button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400">Leave blank for every day</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valid From (time)</label>
              <input type="time" value={form.validFrom} onChange={e => setForm({...form, validFrom: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Valid To (time)</label>
              <input type="time" value={form.validTo} onChange={e => setForm({...form, validTo: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.isFeatured}
              onChange={e => setForm({...form, isFeatured: e.target.checked})} className="h-4 w-4 rounded" />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">⭐ Featured deal (pinned to top)</label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gray-900 font-bold text-white disabled:opacity-50">
              {submitting ? 'Saving...' : editId ? 'Update Deal' : 'Create Deal'}
            </button>
            <button type="button" onClick={resetForm}
              className="flex h-11 items-center rounded-xl border border-gray-200 px-6 font-bold text-gray-600">Cancel</button>
          </div>
        </form>
      )}

      {deals.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">🔥</p>
          <p className="font-bold text-gray-900">No deals yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first deal — bundles, happy hours, specials.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map(d => (
            <div key={d.id} className={`rounded-2xl border p-4 ${d.isActive ? 'border-gray-100 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {d.isFeatured && <span className="text-yellow-500">⭐</span>}
                    <h3 className="font-bold text-gray-900">{d.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    }`}>{d.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{d.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-gray-100 px-2 py-1 font-bold">
                      {DEAL_TYPES.find(t => t.value === d.type)?.label}
                    </span>
                    {d.price && <span className="rounded-full bg-blue-50 px-2 py-1 font-bold text-blue-700">£{(d.price / 100).toFixed(2)}</span>}
                    {d.savings && <span className="rounded-full bg-green-50 px-2 py-1 font-bold text-green-700">{d.savings}</span>}
                    {d.validDays && (
                      <span className="rounded-full bg-gray-100 px-2 py-1">
                        {(JSON.parse(d.validDays) as number[]).map(day => DAY_NAMES[day]).join(', ')}
                      </span>
                    )}
                    {d.validFrom && d.validTo && (
                      <span className="rounded-full bg-gray-100 px-2 py-1">{d.validFrom} – {d.validTo}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-3">
                  <button onClick={() => toggleFeatured(d)} title={d.isFeatured ? 'Unfeature' : 'Feature'}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                    {d.isFeatured ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : <StarOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => toggleActive(d)} title={d.isActive ? 'Deactivate' : 'Activate'}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                    {d.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button onClick={() => editDeal(d)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteDeal(d.id)}
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
