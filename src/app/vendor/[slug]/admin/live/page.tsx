'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Monitor, Radio, Truck } from 'lucide-react'

type Vehicle = { id: string; name: string; status: string }
type LiveSession = { id: string; vehicleId: string | null; location: { name: string }; startedAt: string }

export default function KDSSelectPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession()
  const vendorId = (session?.user as any)?.id
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!vendorId) return
    Promise.all([
      fetch(`/api/vendor/${params.slug}/vehicles`).then(r => r.json()),
      fetch(`/api/live-sessions?vendorId=${vendorId}`).then(r => r.json()),
    ]).then(([vehs, sessions]) => {
      setVehicles(vehs.filter((v: Vehicle) => v.status === 'active'))
      setLiveSessions(sessions.filter((s: LiveSession) => !!(s as any).startedAt && !(s as any).endedAt))
    }).finally(() => setLoading(false))
  }, [vendorId, params.slug])

  function getSessionForVehicle(vehicleId: string) {
    return liveSessions.find(s => s.vehicleId === vehicleId)
  }

  function getDuration(startedAt: string) {
    const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" /></div>
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold text-gray-900 animate-fade-in-up">Kitchen Display</h1>
      <p className="mb-6 text-sm text-gray-500">Select a van to open its KDS. Each van has its own order queue.</p>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <Truck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-bold text-gray-900">No vehicles</p>
          <p className="text-sm text-gray-500 mt-1">Add vans in Fleet Management, then go live.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* All orders KDS */}
          <Link
            href={`/vendor/${params.slug}/admin/live/all`}
            className="group rounded-2xl border-2 border-gray-200 bg-white p-5 transition-all hover:border-gray-400 hover:shadow-md active:scale-[0.98] card-hover animate-fade-in-up"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900">All Orders</h3>
                <span className="text-xs text-gray-400">Owner overview — all vans combined</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {liveSessions.length} van{liveSessions.length !== 1 ? 's' : ''} live
            </div>
          </Link>

          {/* Per-van KDS cards */}
          {vehicles.map((vehicle, index) => {
            const session = getSessionForVehicle(vehicle.id)
            const isLive = !!session
            return (
              <Link
                key={vehicle.id}
                href={`/vendor/${params.slug}/admin/live/${vehicle.id}`}
                className={`group rounded-2xl border-2 p-5 transition-all hover:shadow-md active:scale-[0.98] card-hover animate-fade-in-up ${
                  isLive ? 'border-green-300 bg-green-50 hover:border-green-400' : 'border-gray-100 bg-white hover:border-gray-300'
                }`}
                style={{ animationDelay: `${(index + 1) * 75}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${isLive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    🚐
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900">{vehicle.name}</h3>
                    {isLive && session ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        <span className="font-bold text-green-700">{session.location.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Offline</span>
                    )}
                  </div>
                </div>

                {isLive && session && (
                  <div className="text-xs text-gray-500">
                    Live for {getDuration(session.startedAt)}
                  </div>
                )}
                {!isLive && (
                  <div className="text-xs text-gray-400">
                    No active session — go live first
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
