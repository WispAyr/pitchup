'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface Location {
  id: string
  vendorId: string
  name: string
  address: string | null
  lat: number
  lng: number
  isRegular: boolean
}

interface Schedule {
  id: string
  vendorId: string
  locationId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  recurring: boolean
  location: Location
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SchedulePage() {
  const params = useParams()
  const slug = params.slug as string

  const [vendorId, setVendorId] = useState('')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Schedule form
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [scheduleForm, setScheduleForm] = useState({
    locationId: '',
    dayOfWeek: 1,
    startTime: '17:00',
    endTime: '21:00',
  })

  // Location form
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null)
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
  })

  const fetchData = useCallback(async () => {
    try {
      const vendorRes = await fetch(`/api/vendors/${slug}`)
      const vendor = await vendorRes.json()
      if (!vendor.id) throw new Error('Vendor not found')
      setVendorId(vendor.id)

      const [schedulesRes, locationsRes] = await Promise.all([
        fetch(`/api/schedules?vendorId=${vendor.id}`),
        fetch(`/api/locations?vendorId=${vendor.id}`),
      ])

      if (!schedulesRes.ok || !locationsRes.ok) throw new Error('Failed to load data')

      setSchedules(await schedulesRes.json())
      setLocations(await locationsRes.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSaveSchedule(e: React.FormEvent) {
    e.preventDefault()
    if (!scheduleForm.locationId || !scheduleForm.startTime || !scheduleForm.endTime) return
    setSaving(true)
    try {
      if (editingScheduleId) {
        const res = await fetch(`/api/schedules/${editingScheduleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleForm),
        })
        if (!res.ok) throw new Error('Failed to update schedule')
      } else {
        const res = await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendorId, ...scheduleForm }),
        })
        if (!res.ok) throw new Error('Failed to create schedule')
      }
      setShowScheduleForm(false)
      setEditingScheduleId(null)
      setScheduleForm({ locationId: '', dayOfWeek: 1, startTime: '17:00', endTime: '21:00' })
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSchedule(id: string) {
    if (!confirm('Delete this schedule?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete schedule')
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openEditSchedule(s: Schedule) {
    setEditingScheduleId(s.id)
    setScheduleForm({
      locationId: s.locationId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
    })
    setShowScheduleForm(true)
  }

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault()
    const lat = parseFloat(locationForm.lat)
    const lng = parseFloat(locationForm.lng)
    if (!locationForm.name.trim() || isNaN(lat) || isNaN(lng)) {
      setError('Name, latitude, and longitude are required')
      return
    }
    setSaving(true)
    try {
      if (editingLocationId) {
        const res = await fetch(`/api/locations/${editingLocationId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: locationForm.name.trim(),
            address: locationForm.address.trim() || null,
            lat,
            lng,
          }),
        })
        if (!res.ok) throw new Error('Failed to update location')
      } else {
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorId,
            name: locationForm.name.trim(),
            address: locationForm.address.trim() || null,
            lat,
            lng,
          }),
        })
        if (!res.ok) throw new Error('Failed to create location')
      }
      setShowLocationForm(false)
      setEditingLocationId(null)
      setLocationForm({ name: '', address: '', lat: '', lng: '' })
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteLocation(id: string) {
    if (!confirm('Delete this location? Any schedules using it will also be deleted.')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete location')
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openEditLocation(loc: Location) {
    setEditingLocationId(loc.id)
    setLocationForm({
      name: loc.name,
      address: loc.address || '',
      lat: loc.lat.toString(),
      lng: loc.lng.toString(),
    })
    setShowLocationForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-white" />
      </div>
    )
  }

  // Group schedules by day
  const schedulesByDay: Record<number, Schedule[]> = {}
  for (const s of schedules) {
    if (!schedulesByDay[s.dayOfWeek]) schedulesByDay[s.dayOfWeek] = []
    schedulesByDay[s.dayOfWeek].push(s)
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Schedule</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">X</button>
        </div>
      )}

      {/* Weekly calendar grid */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Weekly Schedule</h2>
          <button
            onClick={() => {
              setEditingScheduleId(null)
              setScheduleForm({ locationId: locations[0]?.id || '', dayOfWeek: 1, startTime: '17:00', endTime: '21:00' })
              setShowScheduleForm(true)
            }}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900"
          >
            + Add Schedule
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
          {DAYS.map((day, idx) => {
            const daySchedules = schedulesByDay[idx] || []
            return (
              <div key={idx} className="rounded-lg bg-white border border-gray-100 shadow-sm p-3">
                <h3 className="mb-2 text-xs font-bold uppercase text-gray-500">{day}</h3>
                {daySchedules.length === 0 ? (
                  <p className="text-xs text-gray-600">--</p>
                ) : (
                  daySchedules.map((s) => (
                    <div key={s.id} className="mb-2 rounded bg-gray-50/60 p-2">
                      <p className="text-xs font-medium text-gray-900">{s.location.name}</p>
                      <p className="text-[10px] text-gray-500">
                        {s.startTime} - {s.endTime}
                      </p>
                      <div className="mt-1 flex gap-1">
                        <button
                          onClick={() => openEditSchedule(s)}
                          className="text-[10px] text-amber-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Schedule form modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingScheduleId ? 'Edit Schedule' : 'Add Schedule'}
            </h2>
            {locations.length === 0 ? (
              <div>
                <p className="mb-3 text-sm text-gray-500">You need to add a location first.</p>
                <button
                  onClick={() => {
                    setShowScheduleForm(false)
                    setShowLocationForm(true)
                  }}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900"
                >
                  Add Location
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveSchedule} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">Location</label>
                  <select
                    value={scheduleForm.locationId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, locationId: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">Day of Week</label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
                  >
                    {DAYS.map((day, idx) => (
                      <option key={idx} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-500">Start Time</label>
                    <input
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-500">End Time</label>
                    <input
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowScheduleForm(false); setEditingScheduleId(null) }}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingScheduleId ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Locations section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Locations</h2>
          <button
            onClick={() => {
              setEditingLocationId(null)
              setLocationForm({ name: '', address: '', lat: '', lng: '' })
              setShowLocationForm(true)
            }}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900"
          >
            + Add Location
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-500">No locations yet. Add one to create schedules.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between rounded-xl bg-white border border-gray-100 shadow-sm p-4">
                <div>
                  <p className="font-medium text-gray-900">{loc.name}</p>
                  {loc.address && <p className="text-sm text-gray-500">{loc.address}</p>}
                  <p className="text-xs text-gray-500">
                    {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditLocation(loc)}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-600/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location form modal */}
      {showLocationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-gray-100 shadow-sm p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editingLocationId ? 'Edit Location' : 'Add Location'}
            </h2>
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500">Name *</label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g., High Street Market"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500">Address</label>
                <input
                  type="text"
                  value={locationForm.address}
                  onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                  placeholder="123 High Street, London"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={locationForm.lat}
                    onChange={(e) => setLocationForm({ ...locationForm, lat: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                    placeholder="51.5074"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    value={locationForm.lng}
                    onChange={(e) => setLocationForm({ ...locationForm, lng: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                    placeholder="-0.1278"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLocationForm(false); setEditingLocationId(null) }}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingLocationId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
