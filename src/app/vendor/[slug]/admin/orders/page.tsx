'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Clock, ChefHat, Package, CheckCircle, XCircle, UserX, CreditCard, Banknote, Monitor } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type Order = {
  id: string
  pickupCode: string | null
  status: string
  customerName: string
  customerPhone: string | null
  items: { name: string; price: number; quantity: number }[]
  total: number
  subtotal: number
  timeSlotStart: string | null
  timeSlotEnd: string | null
  paymentMethod: string | null
  paidAt: string | null
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-gray-700', bg: 'bg-gray-100', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bg: 'bg-blue-50', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-amber-700', bg: 'bg-amber-50', icon: ChefHat },
  ready: { label: 'Ready', color: 'text-green-700', bg: 'bg-green-50', icon: Package },
  collected: { label: 'Collected', color: 'text-gray-500', bg: 'bg-gray-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50', icon: XCircle },
  'no-show': { label: 'No-Show', color: 'text-orange-700', bg: 'bg-orange-50', icon: UserX },
}

const ACTIVE_STATUSES = ['confirmed', 'preparing', 'ready']

const GLOW_CLASS: Record<string, string> = {
  confirmed: 'animate-pulse-glow-blue',
  preparing: 'animate-pulse-glow-amber',
  ready: 'animate-pulse-glow-green',
}

function ElapsedTimer({ since, overdue }: { since: string; overdue?: number }) {
  const [elapsed, setElapsed] = useState('')
  const [isOverdue, setIsOverdue] = useState(false)

  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(since).getTime()) / 1000)
      const mins = Math.floor(diff / 60)
      const secs = diff % 60
      setElapsed(`${mins}:${secs.toString().padStart(2, '0')}`)
      if (overdue && mins >= overdue) setIsOverdue(true)
      else setIsOverdue(false)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [since, overdue])

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold ${isOverdue ? 'animate-overdue' : 'text-gray-500'}`}>
      ⏱ {elapsed}
    </span>
  )
}

export default function AdminOrdersPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'all' | 'completed'>('active')
  const [showPickupScreen, setShowPickupScreen] = useState(false)

  const vendorId = (session?.user as any)?.id

  const fetchOrders = useCallback(async () => {
    if (!vendorId) return
    try {
      const res = await fetch(`/api/orders?vendorId=${vendorId}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e)
    } finally {
      setLoading(false)
    }
  }, [vendorId])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const updateStatus = async (orderId: string, status: string, extra?: Record<string, any>) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      })
      if (res.ok) fetchOrders()
    } catch (e) {
      console.error('Failed to update order:', e)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ACTIVE_STATUSES.includes(o.status)
    if (filter === 'completed') return ['collected', 'cancelled', 'no-show'].includes(o.status)
    return true
  })

  const readyOrders = orders.filter((o) => o.status === 'ready')
  const preparingOrders = orders.filter((o) => o.status === 'preparing')

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  // Pickup screen modal
  if (showPickupScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Pickup Screen</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full bg-amber-500/20 px-3 py-1 font-bold text-amber-400">
                {preparingOrders.length} preparing
              </span>
              <span className="rounded-full bg-green-500/20 px-3 py-1 font-bold text-green-400">
                {readyOrders.length} ready
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowPickupScreen(false)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/20 transition-colors"
          >
            Exit
          </button>
        </div>

        <div className="flex flex-1 gap-1 p-4">
          {/* Preparing column */}
          <div className="flex-1 rounded-2xl bg-amber-500/5 p-4">
            <h2 className="mb-4 text-center text-2xl font-extrabold text-amber-400">
              🔥 Preparing
            </h2>
            <div className="space-y-3">
              {preparingOrders.map((o) => (
                <div key={o.id} className="rounded-2xl bg-amber-500/15 p-5 text-center animate-pulse-glow-amber">
                  <p className="text-5xl sm:text-6xl font-black tracking-wider">{o.pickupCode}</p>
                  <p className="mt-2 text-sm text-amber-200">{o.customerName}</p>
                </div>
              ))}
              {preparingOrders.length === 0 && (
                <p className="py-8 text-center text-gray-600">No orders preparing</p>
              )}
            </div>
          </div>

          {/* Ready column */}
          <div className="flex-1 rounded-2xl bg-green-500/5 p-4">
            <h2 className="mb-4 text-center text-2xl font-extrabold text-green-400">
              ✅ Ready for Collection
            </h2>
            <div className="space-y-3">
              {readyOrders.map((o) => (
                <div key={o.id} className="rounded-2xl bg-green-500/15 p-5 text-center animate-pulse-glow-green">
                  <p className="text-6xl sm:text-7xl font-black tracking-wider">{o.pickupCode}</p>
                  <p className="mt-2 text-sm text-green-200">{o.customerName}</p>
                </div>
              ))}
              {readyOrders.length === 0 && (
                <p className="py-8 text-center text-gray-600">No orders ready</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700">
              {orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length} active
            </span>
            <span className="text-xs text-gray-400">
              {orders.length} total
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowPickupScreen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <Monitor className="h-4 w-4" />
          Pickup Screen
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mt-4 flex gap-1 rounded-xl bg-gray-100 p-1">
        {(['active', 'all', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">No orders</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filteredOrders.map((order, i) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            const Icon = config.icon
            const glowClass = GLOW_CLASS[order.status] || ''

            return (
              <div
                key={order.id}
                className={`animate-fade-in-up rounded-xl border border-gray-100 bg-white p-4 shadow-sm ${glowClass}`}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Pickup code */}
                    {order.pickupCode && (
                      <div className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-black tracking-wider text-white">
                        {order.pickupCode}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
                      {order.customerPhone && (
                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </div>
                    {ACTIVE_STATUSES.includes(order.status) && (
                      <ElapsedTimer since={order.createdAt} overdue={15} />
                    )}
                  </div>
                </div>

                {/* Time slot */}
                {order.timeSlotStart && order.timeSlotEnd && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    Slot: {formatTime(order.timeSlotStart)} - {formatTime(order.timeSlotEnd)}
                  </div>
                )}

                {/* Items */}
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  {(order.items as { name: string; quantity: number; price: number }[]).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}× {item.name}</span>
                      <span className="text-gray-500">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="mt-2 border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Payment status */}
                {order.paidAt && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                    {order.paymentMethod === 'cash' ? (
                      <Banknote className="h-3.5 w-3.5" />
                    ) : (
                      <CreditCard className="h-3.5 w-3.5" />
                    )}
                    Paid ({order.paymentMethod}) at {formatTime(order.paidAt)}
                  </div>
                )}

                {/* Action buttons */}
                {ACTIVE_STATUSES.includes(order.status) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(order.id, 'preparing')}
                        className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'ready')}
                        className="rounded-lg bg-green-500 px-4 py-2 text-xs font-bold text-white hover:bg-green-600"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'collected', { paymentMethod: 'cash' })}
                          className="rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700"
                        >
                          <span className="flex items-center gap-1.5">
                            <Banknote className="h-3.5 w-3.5" /> Paid Cash
                          </span>
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'collected', { paymentMethod: 'card' })}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5" /> Paid Card
                          </span>
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'no-show')}
                          className="rounded-lg bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700 hover:bg-orange-200"
                        >
                          No-Show
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => updateStatus(order.id, 'cancelled', { cancelReason: 'Cancelled by vendor' })}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
