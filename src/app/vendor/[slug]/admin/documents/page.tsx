'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { FileCheck, Plus, X, Trash2, AlertTriangle, Download, Eye } from 'lucide-react'

type Doc = {
  id: string
  category: string
  title: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  expiresAt: string | null
  notes: string | null
  uploadedAt: string
  vehicleId: string | null
  vehicle: { name: string } | null
}

type Vehicle = { id: string; name: string }

const CATEGORIES = [
  { value: 'accreditation', label: 'Accreditation' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'food_hygiene', label: 'Food Hygiene' },
  { value: 'gas_safety', label: 'Gas Safety' },
  { value: 'fire_safety', label: 'Fire Safety' },
  { value: 'pat_testing', label: 'PAT Testing' },
  { value: 'mot', label: 'MOT' },
  { value: 'vehicle_insurance', label: 'Vehicle Insurance' },
  { value: 'public_liability', label: 'Public Liability' },
  { value: 'council_permit', label: 'Council Permit' },
  { value: 'other', label: 'Other' },
]

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function expiryStatus(expiresAt: string | null) {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return { label: `Expired ${Math.abs(days)}d ago`, color: 'bg-red-100 text-red-700' }
  if (days <= 30) return { label: `Expires in ${days}d`, color: 'bg-amber-100 text-amber-700' }
  return { label: `Expires ${new Date(expiresAt).toLocaleDateString('en-GB')}`, color: 'bg-green-100 text-green-700' }
}

export default function DocumentsPage() {
  const params = useParams()
  const slug = params.slug as string
  const [docs, setDocs] = useState<Doc[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [filter, setFilter] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ title: '', category: 'other', vehicleId: '', expiresAt: '', notes: '' })
  const [loading, setLoading] = useState(true)

  const fetchDocs = async () => {
    const res = await fetch(`/api/vendor/${slug}/documents`)
    if (res.ok) setDocs(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchDocs()
    fetch(`/api/vendor/${slug}/vehicles`).then(r => r.ok ? r.json() : []).then(setVehicles)
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(0)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', form.title || file.name)
    fd.append('category', form.category)
    if (form.vehicleId) fd.append('vehicleId', form.vehicleId)
    if (form.expiresAt) fd.append('expiresAt', form.expiresAt)
    if (form.notes) fd.append('notes', form.notes)

    // Simulate progress since fetch doesn't have progress events
    const timer = setInterval(() => setProgress(p => Math.min(p + 15, 90)), 200)

    const res = await fetch(`/api/vendor/${slug}/documents`, { method: 'POST', body: fd })
    clearInterval(timer)
    setProgress(100)

    if (res.ok) {
      setForm({ title: '', category: 'other', vehicleId: '', expiresAt: '', notes: '' })
      setShowForm(false)
      if (fileRef.current) fileRef.current.value = ''
      fetchDocs()
    }
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/vendor/${slug}/documents/${id}`, { method: 'DELETE' })
    fetchDocs()
  }

  const filtered = filter ? docs.filter(d => d.category === filter) : docs
  const expiring = docs.filter(d => {
    if (!d.expiresAt) return false
    const days = Math.ceil((new Date(d.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days <= 30
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">Certificates, insurance, permits &amp; more</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
          <Plus className="h-4 w-4" /> Upload
        </button>
      </div>

      {/* Expiry alerts */}
      {expiring.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">{expiring.length} document{expiring.length > 1 ? 's' : ''} expiring soon</span>
          </div>
          <div className="space-y-1">
            {expiring.map(d => {
              const status = expiryStatus(d.expiresAt)
              return (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span className="text-amber-700">{d.title}</span>
                  {status && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.color}`}>{status.label}</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upload form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Upload Document</h3>
            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2">
            <input ref={fileRef} required type="file" accept="image/*,.pdf,.doc,.docx" capture="environment" className="rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm sm:col-span-2" />
            <input placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none">
              <option value="">No vehicle (general)</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Expiry date</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            </div>
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none sm:col-span-2" rows={2} />
            {uploading && (
              <div className="sm:col-span-2">
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <div className="sm:col-span-2">
              <button type="submit" disabled={uploading} className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilter('')} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${!filter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setFilter(c.value)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${filter === c.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c.label}</button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <FileCheck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No documents yet</p>
          <p className="mt-1 text-sm text-gray-400">Upload your first certificate or permit</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => {
            const status = expiryStatus(d.expiresAt)
            return (
              <div key={d.id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{d.title}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 uppercase">{d.category.replace('_', ' ')}</span>
                    {status && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>{status.label}</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {d.fileName} · {formatSize(d.fileSize)}
                    {d.vehicle && ` · ${d.vehicle.name}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <a href={d.fileUrl} target="_blank" className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </a>
                  <a href={d.fileUrl} download className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                    <Download className="h-4 w-4" />
                  </a>
                  <button onClick={() => handleDelete(d.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
