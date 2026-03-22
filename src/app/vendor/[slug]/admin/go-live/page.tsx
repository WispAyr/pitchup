'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertTriangle, XCircle, Radio, MapPin, Clock, Truck } from 'lucide-react'

const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false })

interface Location { id: string; name: string; address: string | null; lat: number; lng: number }
interface Vehicle { id: string; name: string; status: string; photo: string | null }
interface LiveSession {
  id: string; vendorId: string; locationId: string; vehicleId: string | null
  startedAt: string; endedAt: string | null; lat: number; lng: number
  location: Location; vehicle: Vehicle | null
  delayMinutes: number | null; delayMessage: string | null; cancelled: boolean
}

export default function GoLivePage() {
  const params = useParams()
  const slug = params.slug as string

  const [vendorId, setVendorId] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)

  // Per-van state
  const [goLiveVehicleId, setGoLiveVehicleId] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState('')

  // Delay/cancel
  const [actionSession, setActionSession] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'delay' | 'cancel' | null>(null)
  const [delayMinutes, setDelayMinutes] = useState('15')
  const [delayMessage, setDelayMessage] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const vendorRes = await fetch(`/api/vendors/${slug}`)
      const vendor = await vendorRes.json()
      if (!vendor.id) throw new Error('Vendor not found')
      setVendorId(vendor.id)

      const [locRes, sessionRes, vehicleRes] = await Promise.all([
        fetch(`/api/locations?vendorId=${vendor.id}`),
        fetch(`/api/live-sessions?vendorId=${vendor.id}`),
        fetch(`/api/vendor/${slug}/vehicles`),
      ])

      const locs = await locRes.json()
      setLocations(locs)
      if (locs.length > 0 && !selectedLocationId) setSelectedLocationId(locs[0].id)

      const sessions: LiveSession[] = await sessionRes.json()
      setActiveSessions(sessions.filter(s => !s.endedAt && !s.cancelled))

      const vehs: Vehicle[] = await vehicleRes.json()
      setVehicles(vehs.filter(v => v.status === 'active'))
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }, [slug, selectedLocationId])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-refresh
  useEffect(() => {
    const id = setInterval(fetchData, 10000)
    return () => clearInterval(id)
  }, [fetchData])

  function getSessionForVehicle(vehicleId: string) {
    return activeSessions.find(s => s.vehicleId === vehicleId)
  }

  function getDuration(startedAt: string) {
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  async function handleGoLive(vehicleId: string) {
    if (!selectedLocationId) { setError('Select a location'); return }
    setSubmitting(vehicleId)
    setError('')
    try {
      const res = await fetch('/api/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: selectedLocationId, vehicleId }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setGoLiveVehicleId(null)
      await fetchData()
    } catch (err: any) { setError(err.message) }
    finally { setSubmitting(null) }
  }

  async function handleEndSession(vehicleId: string) {
    setSubmitting(vehicleId)
    try {
      await fetch('/api/live-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', vehicleId }),
      })
      await fetchData()
    } catch {} finally { setSubmitting(null) }
  }

  async function handleSessionAction() {
    if (!actionSession) return
    setSubmitting(actionSession)
    try {
      await fetch('/api/live-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: actionSession,
          action: actionType,
          ...(actionType === 'delay' ? { delayMinutes: parseInt(delayMinutes), delayMessage } : {}),
          ...(actionType === 'cancel' ? { cancelReason } : {}),
        }),
      })
      setActionSession(null)
      setActionType(null)
      await fetchData()
    } catch {} finally { setSubmitting(null) }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" /></div>
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-gray-900">Go Live</h1>
      <p className="mb-6 text-sm text-gray-500">Manage each van independently. Multiple vans can be live at the same time.</p>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">✕</button>
        </div>
      )}

      {/* Summary bar */}
      <div className="mb-6 flex items-center gap-4 text-sm">
        <span className="rounded-full bg-green-100 px-3 py-1.5 font-bold text-green-700">
          {activeSessions.length} live
        </span>
        <span className="text-gray-400">
          {vehicles.length - activeSessions.length} offline
        </span>
      </div>

      {/* Van cards */}
      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <Truck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-bold text-gray-900">No vehicles yet</p>
          <p className="text-sm text-gray-500 mt-1">Add a van in Fleet Management first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => {
            const session = getSessionForVehicle(vehicle.id)
            const isLive = !!session
            const isExpanded = goLiveVehicleId === vehicle.id

            return (
              <div
                key={vehicle.id}
                className={`rounded-2xl border-2 p-5 transition-all ${
                  isLive ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-white'
                }`}
              >
                {/* Van header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    🚐
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-gray-900 truncate">{vehicle.name}</h3>
                    {isLive && session ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        <span className="font-bold text-green-700">Live at {session.location.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Offline</span>
                    )}
                  </div>
                </div>

                {isLive && session ? (
                  <>
                    {/* Live info */}
                    <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {getDuration(session.startedAt)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {session.location.name}</span>
                    </div>

                    {session.delayMinutes && session.delayMinutes > 0 && (
                      <div className="mb-3 rounded-lg bg-amber-100 border border-amber-200 p-2 text-xs text-amber-800">
                        ⚠️ Running {session.delayMinutes}min late
                        {session.delayMessage && <> — {session.delayMessage}</>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setActionSession(session.id); setActionType('delay') }}
                        className="flex h-9 items-center gap-1 rounded-lg bg-amber-100 px-3 text-xs font-bold text-amber-700 active:bg-amber-200"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" /> Late
                      </button>
                      <button
                        onClick={() => { setActionSession(session.id); setActionType('cancel') }}
                        className="flex h-9 items-center gap-1 rounded-lg bg-red-100 px-3 text-xs font-bold text-red-700 active:bg-red-200"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                      <button
                        onClick={() => handleEndSession(vehicle.id)}
                        disabled={submitting === vehicle.id}
                        className="flex h-9 flex-1 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white active:bg-gray-800 disabled:opacity-50"
                      >
                        {submitting === vehicle.id ? 'Ending...' : 'End Session'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {isExpanded ? (
                      <div className="space-y-3">
                        <select
                          value={selectedLocationId}
                          onChange={(e) => setSelectedLocationId(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                        >
                          {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGoLive(vehicle.id)}
                            disabled={submitting === vehicle.id || locations.length === 0}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 font-bold text-white active:bg-green-500 disabled:opacity-50"
                          >
                            <Radio className="h-4 w-4" />
                            {submitting === vehicle.id ? 'Going live...' : 'GO LIVE'}
                          </button>
                          <button
                            onClick={() => setGoLiveVehicleId(null)}
                            className="flex h-11 items-center rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-600 active:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setGoLiveVehicleId(vehicle.id)}
                        disabled={locations.length === 0}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-600 font-bold text-white active:bg-green-500 disabled:opacity-50"
                      >
                        <Radio className="h-4 w-4" />
                        Go Live
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Action modal */}
      {actionSession && actionType && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => { setActionSession(null); setActionType(null) }}>
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
            {actionType === 'delay' ? (
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-gray-900">Running Late</h3>
                <select
                  value={delayMinutes}
                  onChange={e => setDelayMinutes(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                >
                  {[5, 10, 15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} minutes</option>)}
                </select>
                <input
                  type="text" placeholder="Message (optional)"
                  value={delayMessage} onChange={e => setDelayMessage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                />
                <button onClick={handleSessionAction} disabled={!!submitting}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 font-bold text-white active:bg-amber-600 disabled:opacity-50">
                  Notify Customers
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-extrabold text-red-700">Cancel Session</h3>
                <p className="text-sm text-gray-500">This will cancel pending pre-orders and notify customers.</p>
                <input
                  type="text" placeholder="Reason (optional)"
                  value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                />
                <button onClick={handleSessionAction} disabled={!!submitting}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-red-600 font-bold text-white active:bg-red-700 disabled:opacity-50">
                  Cancel Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      {activeSessions.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100">
          <LiveMap
            lat={activeSessions[0].lat}
            lng={activeSessions[0].lng}
            onMapClick={() => {}}
            interactive={false}
          />
        </div>
      )}
    </div>
  )
}
