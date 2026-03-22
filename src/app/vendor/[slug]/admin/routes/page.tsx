'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Location { id: string; name: string; lat: number; lng: number }
interface Vehicle { id: string; name: string }
interface RouteStop { id: string; locationId: string; location: Location; startTime: string; endTime: string; sortOrder: number }
interface Route { id: string; name: string; dayOfWeek: number; vehicleId: string | null; vehicle: Vehicle | null; isActive: boolean; stops: RouteStop[] }

interface StopForm { locationId: string; startTime: string; endTime: string }

export default function RoutesAdminPage() {
  const params = useParams()
  const slug = params.slug as string
  const [routes, setRoutes] = useState<Route[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form
  const [formName, setFormName] = useState('')
  const [formDay, setFormDay] = useState(1)
  const [formVehicleId, setFormVehicleId] = useState('')
  const [formStops, setFormStops] = useState<StopForm[]>([])

  const fetchAll = useCallback(async () => {
    const [routesRes, vendorRes] = await Promise.all([
      fetch(`/api/vendor/${slug}/routes`),
      fetch(`/api/vendors/${slug}`),
    ])
    if (routesRes.ok) setRoutes(await routesRes.json())
    const vendor = await vendorRes.json()
    if (vendor.id) {
      const [locRes, vehRes] = await Promise.all([
        fetch(`/api/locations?vendorId=${vendor.id}`),
        fetch(`/api/vendor/${slug}/vehicles`),
      ])
      if (locRes.ok) setLocations(await locRes.json())
      if (vehRes.ok) setVehicles(await vehRes.json())
    }
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchAll() }, [fetchAll])

  function resetForm() {
    setFormName(''); setFormDay(1); setFormVehicleId(''); setFormStops([]); setEditingId(null); setShowForm(false)
  }

  function startEdit(r: Route) {
    setEditingId(r.id)
    setFormName(r.name)
    setFormDay(r.dayOfWeek)
    setFormVehicleId(r.vehicleId || '')
    setFormStops(r.stops.map(s => ({ locationId: s.locationId, startTime: s.startTime, endTime: s.endTime })))
    setShowForm(true)
  }

  function addStop() {
    setFormStops(prev => [...prev, { locationId: '', startTime: '17:00', endTime: '19:00' }])
  }

  function updateStop(i: number, field: keyof StopForm, value: string) {
    setFormStops(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  function removeStop(i: number) {
    setFormStops(prev => prev.filter((_, idx) => idx !== i))
  }

  function moveStop(i: number, dir: -1 | 1) {
    const arr = [...formStops]
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setFormStops(arr)
  }

  async function handleSave() {
    if (!formName.trim() || formStops.length === 0) return
    setSaving(true)
    const body = { name: formName.trim(), dayOfWeek: formDay, vehicleId: formVehicleId || null, stops: formStops }
    if (editingId) {
      await fetch(`/api/vendor/${slug}/routes/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch(`/api/vendor/${slug}/routes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setSaving(false)
    resetForm()
    fetchAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this route?')) return
    await fetch(`/api/vendor/${slug}/routes/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  async function handleToggleActive(r: Route) {
    await fetch(`/api/vendor/${slug}/routes/${r.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !r.isActive }),
    })
    fetchAll()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-amber-500" /></div>

  const routesByDay = DAY_NAMES.map((name, i) => ({
    name,
    dayIndex: i,
    routes: routes.filter(r => r.dayOfWeek === i),
  })).filter(d => d.routes.length > 0)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Route Schedules</h1>
        <button onClick={() => { resetForm(); setShowForm(true); addStop() }} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 hover:opacity-90">
          + New Route
        </button>
      </div>

      {/* Route form */}
      {showForm && (
        <div className="mb-6 rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="mb-4 text-lg font-bold text-gray-900">{editingId ? 'Edit Route' : 'New Route'}</h3>
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-500">Route Name</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Tuesday Evening Route" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-500">Day</label>
              <select value={formDay} onChange={e => setFormDay(Number(e.target.value))} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none">
                {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-500">Vehicle</label>
              <select value={formVehicleId} onChange={e => setFormVehicleId(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none">
                <option value="">— No vehicle —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <label className="mb-2 block text-sm font-medium text-gray-500">Stops</label>
          <div className="space-y-2 mb-4">
            {formStops.map((stop, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveStop(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => moveStop(i, 1)} disabled={i === formStops.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                </div>
                <select value={stop.locationId} onChange={e => updateStop(i, 'locationId', e.target.value)} className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none">
                  <option value="">Select location…</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <input type="time" value={stop.startTime} onChange={e => updateStop(i, 'startTime', e.target.value)} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none" />
                <span className="text-gray-400">→</span>
                <input type="time" value={stop.endTime} onChange={e => updateStop(i, 'endTime', e.target.value)} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-amber-500 focus:outline-none" />
                <button onClick={() => removeStop(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={addStop} className="mb-4 text-sm font-medium text-amber-600 hover:text-amber-700">+ Add Stop</button>

          <div className="flex justify-end gap-3">
            <button onClick={resetForm} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create Route'}
            </button>
          </div>
        </div>
      )}

      {/* Routes by day */}
      {routesByDay.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-500">No routes yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {routesByDay.map(day => (
            <div key={day.dayIndex}>
              <h2 className="mb-3 text-lg font-bold text-gray-900">{day.name}</h2>
              <div className="space-y-3">
                {day.routes.map(r => (
                  <div key={r.id} className={`rounded-xl bg-white border border-gray-100 shadow-sm p-4 ${!r.isActive ? 'opacity-50' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🚐</span>
                        <span className="font-semibold text-gray-900">{r.vehicle?.name || 'No vehicle'}</span>
                        <span className="text-sm text-gray-400">— {r.name}</span>
                        {!r.isActive && <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-500">Inactive</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleActive(r)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200">
                          {r.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => startEdit(r)} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200">Edit</button>
                        <button onClick={() => handleDelete(r.id)} className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-200">Delete</button>
                      </div>
                    </div>
                    <div className="space-y-1 pl-8">
                      {r.stops.map(s => (
                        <div key={s.id} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">📍</span>
                          <span className="text-gray-700">{s.location.name}</span>
                          <span className="text-gray-400">—</span>
                          <span className="font-medium text-gray-900">{formatTime(s.startTime)}-{formatTime(s.endTime)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')}${suffix}`
}
