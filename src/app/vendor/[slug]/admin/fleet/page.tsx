'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Truck, Plus, X, Pencil, Trash2 } from 'lucide-react'

type Vehicle = {
  id: string
  name: string
  registration: string | null
  make: string | null
  model: string | null
  year: number | null
  photo: string | null
  notes: string | null
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  maintenance: 'bg-amber-100 text-amber-700',
  retired: 'bg-gray-100 text-gray-500',
}

export default function FleetPage() {
  const params = useParams()
  const slug = params.slug as string
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [form, setForm] = useState({ name: '', registration: '', make: '', model: '', year: '', notes: '', status: 'active' })
  const [loading, setLoading] = useState(true)

  const fetchVehicles = async () => {
    const res = await fetch(`/api/vendor/${slug}/vehicles`)
    if (res.ok) setVehicles(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchVehicles() }, [])

  const resetForm = () => {
    setForm({ name: '', registration: '', make: '', model: '', year: '', notes: '', status: 'active' })
    setEditing(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editing
      ? `/api/vendor/${slug}/vehicles/${editing.id}`
      : `/api/vendor/${slug}/vehicles`
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    resetForm()
    fetchVehicles()
  }

  const handleEdit = (v: Vehicle) => {
    setForm({ name: v.name, registration: v.registration || '', make: v.make || '', model: v.model || '', year: v.year?.toString() || '', notes: v.notes || '', status: v.status })
    setEditing(v)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle?')) return
    await fetch(`/api/vendor/${slug}/vehicles/${id}`, { method: 'DELETE' })
    fetchVehicles()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your vehicles and units</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
          <Plus className="h-4 w-4" /> Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{editing ? 'Edit' : 'Add'} Vehicle</h3>
            <button onClick={resetForm}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="Vehicle name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Registration" value={form.registration} onChange={e => setForm(f => ({ ...f, registration: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Make" value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Model" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Year" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none">
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none sm:col-span-2" rows={2} />
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">
                {editing ? 'Update' : 'Add'} Vehicle
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-gray-400">Loading...</p>
      ) : vehicles.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <Truck className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No vehicles yet</p>
          <p className="mt-1 text-sm text-gray-400">Add your first van or unit to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map(v => (
            <div key={v.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{v.name}</h3>
                  {v.registration && <p className="text-xs font-mono text-gray-500 mt-0.5">{v.registration}</p>}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[v.status]}`}>{v.status}</span>
              </div>
              {(v.make || v.model || v.year) && (
                <p className="mb-2 text-sm text-gray-500">{[v.make, v.model, v.year].filter(Boolean).join(' · ')}</p>
              )}
              {v.notes && <p className="mb-3 text-sm text-gray-400 line-clamp-2">{v.notes}</p>}
              <div className="flex gap-2">
                <button onClick={() => handleEdit(v)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button onClick={() => handleDelete(v.id)} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
