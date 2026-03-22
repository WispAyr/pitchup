'use client'

import { useState, useEffect, useCallback } from 'react'

type Order = {
  id: string
  pickupCode: string | null
  status: string
  customerName: string
  liveSessionId: string | null
}

export function PickupScreenClient({
  vendorId, vendorName, vendorSlug, primaryColor, secondaryColor, logo,
  vehicleId, vehicleName,
}: {
  vendorId: string; vendorName: string; vendorSlug: string
  primaryColor: string; secondaryColor: string; logo: string | null
  vehicleId: string; vehicleName: string
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [time, setTime] = useState(new Date())
  const [sessionIds, setSessionIds] = useState<string[]>([])
  const isAll = vehicleId === 'all'

  const fetchOrders = useCallback(async () => {
    try {
      // Get live sessions
      const sessRes = await fetch(`/api/live-sessions?vendorId=${vendorId}`)
      const sessions = await sessRes.json()
      const active = sessions.filter((s: any) => !s.endedAt && !s.cancelled)

      const ids = isAll
        ? active.map((s: any) => s.id)
        : active.filter((s: any) => s.vehicleId === vehicleId).map((s: any) => s.id)
      setSessionIds(ids)

      const res = await fetch(`/api/orders?vendorId=${vendorId}`)
      if (res.ok) {
        const data: Order[] = await res.json()
        setOrders(data.filter(o =>
          ['preparing', 'ready'].includes(o.status) &&
          (ids.length === 0 || !o.liveSessionId || ids.includes(o.liveSessionId))
        ))
      }
    } catch {}
  }, [vendorId, vehicleId, isAll])

  useEffect(() => { fetchOrders(); const id = setInterval(fetchOrders, 5000); return () => clearInterval(id) }, [fetchOrders])
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])

  const preparing = orders.filter(o => o.status === 'preparing')
  const ready = orders.filter(o => o.status === 'ready')
  const timeStr = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: secondaryColor, color: 'white' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 sm:px-8" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center gap-3">
          {logo ? (
            <img src={logo} alt={vendorName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
              {vendorName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-black">{vehicleName}</h1>
            <p className="text-xs opacity-70">{vendorName}</p>
          </div>
        </div>
        <div className="text-2xl font-mono font-bold opacity-80">{timeStr}</div>
      </div>

      {/* Content */}
      <div className="flex flex-1">
        {/* Preparing */}
        <div className="flex flex-1 flex-col border-r border-white/10">
          <div className="bg-amber-500/20 px-6 py-3 text-center">
            <h2 className="text-lg font-black uppercase tracking-widest text-amber-300">🍳 Preparing</h2>
          </div>
          <div className="flex-1 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {preparing.map(order => (
                <div key={order.id} className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur-sm">
                  <p className="text-3xl font-black tracking-wider sm:text-4xl">{order.pickupCode}</p>
                  <p className="mt-1 text-sm opacity-70">{order.customerName}</p>
                </div>
              ))}
            </div>
            {preparing.length === 0 && (
              <div className="flex h-full items-center justify-center opacity-30">
                <p className="text-lg">No orders preparing</p>
              </div>
            )}
          </div>
        </div>

        {/* Ready */}
        <div className="flex flex-1 flex-col">
          <div className="bg-green-500/20 px-6 py-3 text-center">
            <h2 className="text-lg font-black uppercase tracking-widest text-green-300">✅ Ready</h2>
          </div>
          <div className="flex-1 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {ready.map(order => (
                <div key={order.id} className="animate-pulse rounded-2xl bg-green-500/20 p-5 text-center ring-2 ring-green-400/30">
                  <p className="text-4xl font-black tracking-wider text-green-300 sm:text-5xl">{order.pickupCode}</p>
                  <p className="mt-1 text-sm text-green-200/70">{order.customerName}</p>
                </div>
              ))}
            </div>
            {ready.length === 0 && (
              <div className="flex h-full items-center justify-center opacity-30">
                <p className="text-lg">No orders ready</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-2 text-center text-xs opacity-30">Powered by PitchUp</div>
    </div>
  )
}
