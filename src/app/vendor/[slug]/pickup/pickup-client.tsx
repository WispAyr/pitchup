'use client'

import { useState, useEffect, useCallback } from 'react'

type Order = {
  id: string
  pickupCode: string | null
  status: string
  customerName: string
  timeSlotStart: string | null
  timeSlotEnd: string | null
}

export function PickupScreenClient({
  vendorId,
  vendorName,
  vendorSlug,
  primaryColor,
  secondaryColor,
  logo,
}: {
  vendorId: string
  vendorName: string
  vendorSlug: string
  primaryColor: string
  secondaryColor: string
  logo: string | null
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [time, setTime] = useState(new Date())

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders?vendorId=${vendorId}`)
      if (res.ok) {
        const data: Order[] = await res.json()
        setOrders(data.filter((o) => ['preparing', 'ready'].includes(o.status)))
      }
    } catch {}
  }, [vendorId])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const preparing = orders.filter((o) => o.status === 'preparing')
  const ready = orders.filter((o) => o.status === 'ready')

  const timeStr = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: secondaryColor, color: 'white' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-5"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-4">
          {logo ? (
            <img src={logo} alt={vendorName} className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
              {vendorName.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-black">{vendorName}</h1>
        </div>
        <div className="text-3xl font-mono font-bold opacity-80">{timeStr}</div>
      </div>

      {/* Content */}
      <div className="flex flex-1">
        {/* Preparing */}
        <div className="flex flex-1 flex-col border-r border-white/10">
          <div className="bg-amber-500/20 px-6 py-4 text-center">
            <h2 className="text-xl font-black uppercase tracking-widest text-amber-300">
              🍳 Now Preparing
            </h2>
          </div>
          <div className="flex-1 p-6">
            <div className="grid grid-cols-2 gap-4">
              {preparing.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm"
                >
                  <p className="text-4xl font-black tracking-wider">{order.pickupCode}</p>
                  <p className="mt-2 text-sm opacity-70">{order.customerName}</p>
                </div>
              ))}
            </div>
            {preparing.length === 0 && (
              <div className="flex h-full items-center justify-center opacity-30">
                <p className="text-xl">No orders preparing</p>
              </div>
            )}
          </div>
        </div>

        {/* Ready */}
        <div className="flex flex-1 flex-col">
          <div className="bg-green-500/20 px-6 py-4 text-center">
            <h2 className="text-xl font-black uppercase tracking-widest text-green-300">
              ✅ Ready to Collect
            </h2>
          </div>
          <div className="flex-1 p-6">
            <div className="grid grid-cols-2 gap-4">
              {ready.map((order) => (
                <div
                  key={order.id}
                  className="animate-pulse rounded-2xl bg-green-500/20 p-6 text-center ring-2 ring-green-400/30"
                >
                  <p className="text-5xl font-black tracking-wider text-green-300">
                    {order.pickupCode}
                  </p>
                  <p className="mt-2 text-sm text-green-200/70">{order.customerName}</p>
                </div>
              ))}
            </div>
            {ready.length === 0 && (
              <div className="flex h-full items-center justify-center opacity-30">
                <p className="text-xl">No orders ready</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 text-center text-xs opacity-30">
        Powered by PitchUp
      </div>
    </div>
  )
}
