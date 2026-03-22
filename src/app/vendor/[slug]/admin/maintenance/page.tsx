'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Wrench, Plus, X, Trash2, AlertTriangle } from 'lucide-react'

type Log = {
  id: string
  vehicleId: string
  type: string
  title: string
  description: string | null
  cost: number | null
  mileage: number | null
  performedBy: string | null
  performedAt: string
  nextDueAt: string | null
  nextDueMileage: number | null
  vehicle: { name: string; registration: string | null }
}

type Vehicle = { id: string; name: string; registration: string | null }

const TYPES = [
  { value: 'service', label: 'Service' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'breakdown', label: 'Breakdown' },
]

const TYPE_COLORS: Record<string, string> = {
  service: 'bg-blue-100 text-blue-700',
  repair: 'bg-amber-100 text-amber-700',
  inspection: 'bg-green-100 text-green-700',
  breakdown: 'bg-red-100 text-red-700',
}

export default function MaintenancePage() {
  const params = useParams()
  const slug = params.slug as string
  const [logs, setLogs] = useState<Log[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filterVehicle, setFilterVehicle] = useState('')
  const [form, setForm] = useState({ vehicleId: '', type: 'service', title: '', description: '', cost: '', mileage: '', performedBy: '', performedAt: '', nextDueAt: '', nextDueMileage: '' })
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    const url = filterVehicle
      ? `/api/vendor/${slug}/maintenance?vehicleId=${filterVehicle}`
      : `/api/vendor/${slug}/maintenance`
    const res = await fetch(url)
    if (res.ok) setLogs(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
    fetch(`/api/vendor/${slug}/vehicles`).then(r => r.ok ? r.json() : []).then(setVehicles)
  }, [])

  useEffect(() => { fetchLogs() }, [filterVehicle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`/api/vendor/${slug}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ vehicleId: '', type: 'service', title: '', description: '', cost: '', mileage: '', performedBy: '', performedAt: '', nextDueAt: '', nextDueMileage: '' })
    setShowForm(false)
    fetchLogs()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this log?')) return
    await fetch(`/api/vendor/${slug}/maintenance/${id}`, { method: 'DELETE' })
    fetchLogs()
  }

  // Find upcoming due items
  const upcoming = logs.filter(l => {
    if (!l.nextDueAt) return false
    const days = Math.ceil((new Date(l.nextDueAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days <= 30
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="mt-1 text-sm text-gray-500">Service history, MOT &amp; repairs</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
          <Plus className="h-4 w-4" /> Log Entry
        </button>
      </div>

      {/* Upcoming due alerts */}
      {upcoming.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Upcoming maintenance due</span>
          </div>
          {upcoming.map(l => {
            const days = Math.ceil((new Date(l.nextDueAt!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return (
              <p key={l.id} className="text-sm text-amber-700">
                {l.vehicle.name} — {l.title}: {days < 0 ? `${Math.abs(days)}d overdue` : `due in ${days}d`}
              </p>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">New Maintenance Log</h3>
            <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <select required value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none">
              <option value="">Select vehicle *</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}{v.registration ? ` (${v.registration})` : ''}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none">
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input required placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none sm:col-span-2" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none sm:col-span-2" rows={2} />
            <input placeholder="Cost (£)" type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Mileage" type="number" value={form.mileage} onChange={e => setForm(f => ({ ...f, mileage: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Performed by" value={form.performedBy} onChange={e => setForm(f => ({ ...f, performedBy: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <div>
              <label className="mb-1 block text-xs text-gray-500">Date performed</label>
              <input type="date" value={form.performedAt} onChange={e => setForm(f => ({ ...f, performedAt: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Next due date</label>
              <input type="date" value={form.nextDueAt} onChange={e => setForm(f => ({ ...f, nextDueAt: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            </div>
            <input placeholder="Next due mileage" type="number" value={form.nextDueMileage} onChange={e => setForm(f => ({ ...f, nextDueMileage: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">Save Log</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter by vehicle */}
      {vehicles.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setFilterVehicle('')} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${!filterVehicle ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
          {vehicles.map(v => (
            <button key={v.id} onClick={() => setFilterVehicle(v.id)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${filterVehicle === v.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>{v.name}</button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-gray-400">Loading...</p>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <Wrench className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No maintenance logs</p>
          <p className="mt-1 text-sm text-gray-400">Add your first service or repair record</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(l => (
            <div key={l.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{l.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[l.type] || 'bg-gray-100 text-gray-600'}`}>{l.type}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {l.vehicle.name}{l.vehicle.registration ? ` (${l.vehicle.registration})` : ''}
                    {' · '}{new Date(l.performedAt).toLocaleDateString('en-GB')}
                    {l.cost != null && ` · £${(l.cost / 100).toFixed(2)}`}
                    {l.mileage && ` · ${l.mileage.toLocaleString()} mi`}
                    {l.performedBy && ` · ${l.performedBy}`}
                  </p>
                  {l.description && <p className="mt-1 text-sm text-gray-400 line-clamp-2">{l.description}</p>}
                  {l.nextDueAt && (
                    <p className="mt-1 text-xs text-amber-600">Next due: {new Date(l.nextDueAt).toLocaleDateString('en-GB')}{l.nextDueMileage ? ` or ${l.nextDueMileage.toLocaleString()} mi` : ''}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(l.id)} className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
