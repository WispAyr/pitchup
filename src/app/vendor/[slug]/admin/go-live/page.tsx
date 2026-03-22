'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AlertTriangle, XCircle } from 'lucide-react'

const LiveMap = dynamic(() => import('./LiveMap'), { ssr: false })

interface Location {
  id: string
  name: string
  address: string | null
  lat: number
  lng: number
}

interface LiveSession {
  id: string
  vendorId: string
  locationId: string
  startedAt: string
  endedAt: string | null
  lat: number
  lng: number
  location: Location
  delayMinutes: number | null
  delayMessage: string | null
  cancelled: boolean
}

export default function GoLivePage() {
  const params = useParams()
  const slug = params.slug as string

  const [vendorId, setVendorId] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [customLat, setCustomLat] = useState('')
  const [customLng, setCustomLng] = useState('')
  const [useCustom, setUseCustom] = useState(false)

  // Delay/cancel state
  const [showDelayForm, setShowDelayForm] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [delayMinutes, setDelayMinutes] = useState('15')
  const [delayMessage, setDelayMessage] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const vendorRes = await fetch(`/api/vendors/${slug}`)
      const vendor = await vendorRes.json()
      if (!vendor.id) throw new Error('Vendor not found')
      setVendorId(vendor.id)

      const [locRes, sessionRes] = await Promise.all([
        fetch(`/api/locations?vendorId=${vendor.id}`),
        fetch(`/api/live-sessions?vendorId=${vendor.id}`),
      ])

      const locs = await locRes.json()
      setLocations(locs)
      if (locs.length > 0 && !selectedLocationId) {
        setSelectedLocationId(locs[0].id)
      }

      const sessions = await sessionRes.json()
      const active = sessions.find((s: LiveSession) => !s.endedAt) || null
      setActiveSession(active)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [slug, selectedLocationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleGoLive() {
    let locationId: string

    if (useCustom) {
      const lat = parseFloat(customLat)
      const lng = parseFloat(customLng)
      if (isNaN(lat) || isNaN(lng)) {
        setError('Enter valid coordinates')
        return
      }
      locationId = selectedLocationId || locations[0]?.id
      if (!locationId) {
        setError('You need at least one saved location to go live')
        return
      }
    } else {
      if (!selectedLocationId) {
        setError('Select a location')
        return
      }
      locationId = selectedLocationId
    }

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/live-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to go live')
      }
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEndSession() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/live-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      })
      if (!res.ok) throw new Error('Failed to end session')
      setActiveSession(null)
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelay() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/live-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delay',
          delayMinutes: parseInt(delayMinutes),
          delayMessage: delayMessage || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to update delay')
      setShowDelayForm(false)
      setDelayMessage('')
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancel() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/live-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          cancelReason: cancelReason || undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to cancel session')
      setShowCancelForm(false)
      setCancelReason('')
      setActiveSession(null)
      await fetchData()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleMapClick(lat: number, lng: number) {
    setCustomLat(lat.toFixed(6))
    setCustomLng(lng.toFixed(6))
    setUseCustom(true)
  }

  function getDuration(startedAt: string): string {
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Go Live</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">✕</button>
        </div>
      )}

      {activeSession ? (
        <div className="space-y-6">
          {/* Active session card */}
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
              </span>
              <span className="text-lg font-bold text-green-700">YOU ARE LIVE</span>
            </div>
            <p className="text-sm text-gray-600">
              at <span className="font-semibold text-gray-900">{activeSession.location.name}</span>
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Duration: {getDuration(activeSession.startedAt)}
            </p>

            {/* Delay banner */}
            {activeSession.delayMinutes && activeSession.delayMinutes > 0 && (
              <div className="mt-3 rounded-lg bg-amber-100 border border-amber-200 p-3">
                <p className="text-sm font-semibold text-amber-800">
                  ⚠️ Running {activeSession.delayMinutes} minutes late
                </p>
                {activeSession.delayMessage && (
                  <p className="text-xs text-amber-700 mt-1">{activeSession.delayMessage}</p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => { setShowDelayForm(true); setShowCancelForm(false) }}
              className="flex items-center gap-2 rounded-xl bg-amber-100 px-5 py-3 text-sm font-bold text-amber-700 hover:bg-amber-200"
            >
              <AlertTriangle className="h-4 w-4" />
              Running Late
            </button>
            <button
              onClick={() => { setShowCancelForm(true); setShowDelayForm(false) }}
              className="flex items-center gap-2 rounded-xl bg-red-100 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-200"
            >
              <XCircle className="h-4 w-4" />
              Cancel Session
            </button>
            <button
              onClick={handleEndSession}
              disabled={submitting}
              className="rounded-xl bg-gray-900 px-8 py-3 text-sm font-bold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {submitting ? 'Ending...' : 'End Session'}
            </button>
          </div>

          {/* Delay form */}
          {showDelayForm && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <h3 className="text-sm font-bold text-amber-800">Notify Customers of Delay</h3>
              <div>
                <label className="text-xs font-medium text-amber-700">How late? (minutes)</label>
                <select
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                >
                  {[5, 10, 15, 20, 30, 45, 60].map((m) => (
                    <option key={m} value={m}>{m} minutes</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-amber-700">Message (optional)</label>
                <input
                  type="text"
                  value={delayMessage}
                  onChange={(e) => setDelayMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                  placeholder="e.g. Stuck in traffic, be there soon!"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDelay}
                  disabled={submitting}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  Notify Customers
                </button>
                <button
                  onClick={() => setShowDelayForm(false)}
                  className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Cancel form */}
          {showCancelForm && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
              <h3 className="text-sm font-bold text-red-800">Cancel This Session</h3>
              <p className="text-xs text-red-600">
                This will cancel all pending pre-orders and notify customers.
              </p>
              <div>
                <label className="text-xs font-medium text-red-700">Reason</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm"
                  placeholder="e.g. Vehicle breakdown"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  disabled={submitting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel Session & Notify
                </button>
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <LiveMap
              lat={activeSession.lat}
              lng={activeSession.lng}
              onMapClick={() => {}}
              interactive={false}
            />
          </div>
        </div>
      ) : (
        // Not live
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-lg font-bold text-gray-900">Ready to serve?</h2>
              <p className="text-sm text-gray-500">Select a location and go live so customers can find you.</p>
            </div>

            <div className="mb-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                <input
                  type="radio"
                  checked={!useCustom}
                  onChange={() => setUseCustom(false)}
                />
                Saved location
              </label>
              {!useCustom && (
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                >
                  {locations.length === 0 && <option value="">No locations saved</option>}
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.address ? `— ${loc.address}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-6">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
                <input
                  type="radio"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                />
                Custom coordinates (click map)
              </label>
              {useCustom && (
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="Latitude"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    placeholder="Longitude"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                onClick={handleGoLive}
                disabled={submitting || (locations.length === 0 && !useCustom)}
                className="rounded-xl bg-green-600 px-10 py-4 text-xl font-bold text-white shadow-lg shadow-green-600/25 hover:bg-green-500 disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? 'Going live...' : '🔴 GO LIVE'}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <p className="mb-2 text-sm text-gray-500">Click on the map to set custom coordinates:</p>
            <LiveMap
              lat={
                useCustom && customLat
                  ? parseFloat(customLat)
                  : locations.find((l) => l.id === selectedLocationId)?.lat || 55.46
              }
              lng={
                useCustom && customLng
                  ? parseFloat(customLng)
                  : locations.find((l) => l.id === selectedLocationId)?.lng || -4.63
              }
              onMapClick={handleMapClick}
              interactive={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}
