'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Plus, Trash2, MapPin, Calendar, Clock, Edit3 } from 'lucide-react'

type Vehicle = { id: string; name: string }
type EventData = {
  id: string; name: string; description: string | null; location: string
  latitude: number | null; longitude: number | null
  startDate: string; endDate: string; isMultiDay: boolean
  imageUrl: string | null; status: string; preOrderEnabled: boolean
  vehicle: { id: string; name: string } | null
}

export default function AdminEventsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()
  const vendorId = (session?.user as any)?.id

  const [events, setEvents] = useState<EventData[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', description: '', location: '', latitude: '', longitude: '',
    startDate: '', startTime: '10:00', endDate: '', endTime: '20:00',
    isMultiDay: false, vehicleId: '', preOrderEnabled: true,
  })

  const fetchData = useCallback(async () => {
    if (!vendorId) return
    try {
      const [evRes, vehRes] = await Promise.all([
        fetch(`/api/events?vendorId=${vendorId}`),
        fetch(`/api/vendor/${slug}/vehicles`),
      ])
      setEvents(await evRes.json())
      setVehicles(await vehRes.json())
    } catch {} finally { setLoading(false) }
  }, [vendorId, slug])

  useEffect(() => { fetchData() }, [fetchData])

  function resetForm() {
    setForm({ name: '', description: '', location: '', latitude: '', longitude: '',
      startDate: '', startTime: '10:00', endDate: '', endTime: '20:00',
      isMultiDay: false, vehicleId: '', preOrderEnabled: true })
    setEditId(null)
    setShowForm(false)
  }

  function editEvent(event: EventData) {
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    setForm({
      name: event.name,
      description: event.description || '',
      location: event.location,
      latitude: event.latitude?.toString() || '',
      longitude: event.longitude?.toString() || '',
      startDate: start.toISOString().split('T')[0],
      startTime: `${start.getHours().toString().padStart(2,'0')}:${start.getMinutes().toString().padStart(2,'0')}`,
      endDate: end.toISOString().split('T')[0],
      endTime: `${end.getHours().toString().padStart(2,'0')}:${end.getMinutes().toString().padStart(2,'0')}`,
      isMultiDay: event.isMultiDay,
      vehicleId: event.vehicle?.id || '',
      preOrderEnabled: event.preOrderEnabled,
    })
    setEditId(event.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const startDate = new Date(`${form.startDate}T${form.startTime}:00`)
      const endDate = new Date(`${form.endDate || form.startDate}T${form.endTime}:00`)
      const body = {
        name: form.name,
        description: form.description || null,
        location: form.location,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isMultiDay: form.isMultiDay,
        vehicleId: form.vehicleId || null,
        preOrderEnabled: form.preOrderEnabled,
      }

      const url = editId ? `/api/events/${editId}` : '/api/events'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      resetForm()
      await fetchData()
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    await fetchData()
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500">Festivals, airshows, markets, and special appearances.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white active:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Event' : 'New Event'}</h2>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Event Name *</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="Scottish Airshow 2026" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
            <input type="text" required value={form.location} onChange={e => setForm({...form, location: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="Ayr Low Green" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="55.4586" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="-4.6316" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" rows={3} placeholder="About this event..." />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="multiDay" checked={form.isMultiDay}
              onChange={e => setForm({...form, isMultiDay: e.target.checked})} className="h-4 w-4 rounded" />
            <label htmlFor="multiDay" className="text-sm font-medium text-gray-700">Multi-day event</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Date *</label>
              <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Time</label>
              <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          </div>

          {form.isMultiDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
                <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              </div>
            </div>
          )}

          {!form.isMultiDay && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Time</label>
              <input type="time" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          )}

          {vehicles.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Vehicle</label>
              <select value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm">
                <option value="">Any / All</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3">
            <input type="checkbox" id="preOrder" checked={form.preOrderEnabled}
              onChange={e => setForm({...form, preOrderEnabled: e.target.checked})} className="h-4 w-4 rounded" />
            <label htmlFor="preOrder" className="text-sm font-medium text-gray-700">Enable pre-ordering for this event</label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-gray-900 font-bold text-white disabled:opacity-50">
              {submitting ? 'Saving...' : editId ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" onClick={resetForm}
              className="flex h-11 items-center rounded-xl border border-gray-200 px-6 font-bold text-gray-600">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Event list */}
      {events.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">🎪</p>
          <p className="font-bold text-gray-900">No events yet</p>
          <p className="text-sm text-gray-500 mt-1">Add your first event — festivals, airshows, markets.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const start = new Date(event.startDate)
            const end = new Date(event.endDate)
            const now = new Date()
            const isLive = now >= start && now <= end
            return (
              <div key={event.id} className={`rounded-2xl border p-4 ${isLive ? 'border-2 border-green-300 bg-green-50' : 'border-gray-100 bg-white shadow-sm'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {isLive && <span className="text-xs font-bold text-green-700 mb-1 block">🔴 LIVE NOW</span>}
                    <h3 className="font-bold text-gray-900">{event.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />
                        {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {event.isMultiDay && ` – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </span>
                    </div>
                    {event.vehicle && (
                      <span className="mt-2 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                        🚐 {event.vehicle.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3">
                    <button onClick={() => editEvent(event)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteEvent(event.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
