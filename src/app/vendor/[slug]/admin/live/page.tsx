'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'
import {
  Clock,
  ChefHat,
  Package,
  CheckCircle,
  Banknote,
  CreditCard,
  XCircle,
  UserX,
  Volume2,
  VolumeX,
  Maximize,
  ArrowRight,
} from 'lucide-react'

type Order = {
  id: string
  pickupCode: string | null
  status: string
  customerName: string
  customerPhone: string | null
  items: { name: string; price: number; quantity: number }[]
  total: number
  timeSlotStart: string | null
  timeSlotEnd: string | null
  paymentMethod: string | null
  paidAt: string | null
  createdAt: string
}

const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1sbW1+kbGlkIR4dH2Ck6u0qpWJgH56h5iusrOfkIZ/fYGNoa2xppKHf31/hpOkr6+gi4J8eoCIl6qwqpSHf3t7g4yaqrKulIZ+enyCiperr6qTh357fIKLm6qyrpWHfnt8gYqaqrCulYh+e3yBipmqsK6Wh358fYGJmaqxrpaIfnx8gYqZqrGuloh+fHyBipmqsK6ViH57fIGKmaqwrpaIfnx8gYqZqrGul4h+fHyBipmqsa6Wh358fIGKmaqwr5aIfnx8gYqZqrGuloh+fH2BiZqqsa6Wh358'

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

function timeSince(dateStr: string, now: Date) {
  const diff = Math.floor((now.getTime() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function isOverdue(order: Order, now: Date) {
  if (!order.timeSlotEnd) return false
  return now > new Date(order.timeSlotEnd)
}

export default function LiveKDSPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const prevOrderIdsRef = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const now = useNow()

  const vendorId = (session?.user as any)?.id

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL)
  }, [])

  const playNotification = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
    // Also try browser notification
    if (Notification.permission === 'granted') {
      new Notification('New Order!', { body: 'A new order has come in.', icon: '/favicon.ico' })
    }
  }, [soundEnabled])

  const fetchOrders = useCallback(async () => {
    if (!vendorId) return
    try {
      const res = await fetch(`/api/orders?vendorId=${vendorId}`)
      if (res.ok) {
        const data: Order[] = await res.json()
        // Filter to active only
        const active = data.filter((o) =>
          ['confirmed', 'preparing', 'ready'].includes(o.status)
        )

        // Check for new orders
        const currentIds = new Set(active.filter(o => o.status === 'confirmed').map(o => o.id))
        const prevIds = prevOrderIdsRef.current
        const hasNew = Array.from(currentIds).some(id => !prevIds.has(id))
        if (hasNew && prevIds.size > 0) {
          playNotification()
        }
        prevOrderIdsRef.current = currentIds

        setOrders(active)
      }
    } catch (e) {
      console.error('KDS fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [vendorId, playNotification])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 4000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const updateStatus = async (orderId: string, status: string, extra?: Record<string, any>) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      })
      if (res.ok) fetchOrders()
    } catch (e) {
      console.error('KDS update error:', e)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const incoming = orders.filter((o) => o.status === 'confirmed')
  const preparing = orders.filter((o) => o.status === 'preparing')
  const ready = orders.filter((o) => o.status === 'ready')

  // Estimated wait: avg prep time based on preparing orders count
  const estimatedWait = preparing.length * 5 + incoming.length * 5

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-amber-500" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 text-white select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-black tracking-wide">🔥 KITCHEN</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-300 font-bold">
              {incoming.length} incoming
            </span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-amber-300 font-bold">
              {preparing.length} preparing
            </span>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-300 font-bold">
              {ready.length} ready
            </span>
          </div>
          {estimatedWait > 0 && (
            <span className="text-xs text-gray-500">
              ~{estimatedWait}min wait
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-lg p-2 hover:bg-gray-800"
            title={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
          >
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-green-400" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-500" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-lg p-2 hover:bg-gray-800"
            title="Toggle fullscreen"
          >
            <Maximize className="h-5 w-5 text-gray-400" />
          </button>
          <a
            href={`/vendor/${params.slug}/admin/orders`}
            className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700"
          >
            Exit KDS
          </a>
        </div>
      </div>

      {/* Three columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* INCOMING */}
        <div className="flex flex-1 flex-col border-r border-gray-800">
          <div className="border-b border-gray-800 bg-blue-500/10 px-4 py-3">
            <h2 className="text-center text-sm font-black uppercase tracking-wider text-blue-400">
              Incoming ({incoming.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {incoming.map((order) => (
              <KDSCard
                key={order.id}
                order={order}
                now={now}
                variant="incoming"
                onAction={() => updateStatus(order.id, 'preparing')}
                actionLabel="Accept & Prepare"
                actionIcon={<ChefHat className="h-4 w-4" />}
                onCancel={() => updateStatus(order.id, 'cancelled', { cancelReason: 'Rejected by vendor' })}
              />
            ))}
            {incoming.length === 0 && (
              <div className="flex h-32 items-center justify-center text-gray-600 text-sm">
                No incoming orders
              </div>
            )}
          </div>
        </div>

        {/* PREPARING */}
        <div className="flex flex-1 flex-col border-r border-gray-800">
          <div className="border-b border-gray-800 bg-amber-500/10 px-4 py-3">
            <h2 className="text-center text-sm font-black uppercase tracking-wider text-amber-400">
              Preparing ({preparing.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {preparing.map((order) => (
              <KDSCard
                key={order.id}
                order={order}
                now={now}
                variant="preparing"
                onAction={() => updateStatus(order.id, 'ready')}
                actionLabel="Ready"
                actionIcon={<Package className="h-4 w-4" />}
                onCancel={() => updateStatus(order.id, 'cancelled', { cancelReason: 'Cancelled while preparing' })}
              />
            ))}
            {preparing.length === 0 && (
              <div className="flex h-32 items-center justify-center text-gray-600 text-sm">
                Nothing preparing
              </div>
            )}
          </div>
        </div>

        {/* READY */}
        <div className="flex flex-1 flex-col">
          <div className="border-b border-gray-800 bg-green-500/10 px-4 py-3">
            <h2 className="text-center text-sm font-black uppercase tracking-wider text-green-400">
              Ready ({ready.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {ready.map((order) => (
              <KDSCard
                key={order.id}
                order={order}
                now={now}
                variant="ready"
                onAction={null}
                actionLabel=""
                actionIcon={null}
                onCollectCash={() => updateStatus(order.id, 'collected', { paymentMethod: 'cash' })}
                onCollectCard={() => updateStatus(order.id, 'collected', { paymentMethod: 'card' })}
                onNoShow={() => updateStatus(order.id, 'no-show')}
              />
            ))}
            {ready.length === 0 && (
              <div className="flex h-32 items-center justify-center text-gray-600 text-sm">
                No orders ready
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KDSCard({
  order,
  now,
  variant,
  onAction,
  actionLabel,
  actionIcon,
  onCancel,
  onCollectCash,
  onCollectCard,
  onNoShow,
}: {
  order: Order
  now: Date
  variant: 'incoming' | 'preparing' | 'ready'
  onAction: (() => void) | null
  actionLabel: string
  actionIcon: React.ReactNode
  onCancel?: () => void
  onCollectCash?: () => void
  onCollectCard?: () => void
  onNoShow?: () => void
}) {
  const overdue = isOverdue(order, now)
  const isNew = variant === 'incoming' && (now.getTime() - new Date(order.createdAt).getTime()) < 30000

  const borderColor =
    overdue ? 'border-red-500' :
    variant === 'incoming' ? 'border-blue-500/50' :
    variant === 'preparing' ? 'border-amber-500/50' :
    'border-green-500/50'

  const bgColor =
    overdue ? 'bg-red-950/50' :
    variant === 'incoming' ? 'bg-gray-900' :
    variant === 'preparing' ? 'bg-gray-900' :
    'bg-gray-900'

  return (
    <div
      className={`rounded-xl border-2 ${borderColor} ${bgColor} p-4 transition-all ${
        isNew ? 'animate-pulse ring-2 ring-blue-400/50' : ''
      } ${overdue ? 'ring-2 ring-red-500/50' : ''}`}
    >
      {/* Pickup code + timer */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={`text-3xl font-black tracking-wider ${
            overdue ? 'text-red-400' : 'text-white'
          }`}
        >
          {order.pickupCode || '???'}
        </div>
        <div className="text-right">
          <div className={`text-xs font-mono ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
            <Clock className="inline h-3 w-3 mr-1" />
            {timeSince(order.createdAt, now)}
          </div>
          {overdue && (
            <div className="text-xs font-bold text-red-400 mt-0.5">OVERDUE</div>
          )}
        </div>
      </div>

      {/* Customer */}
      <div className="text-sm font-semibold text-gray-300 mb-2">{order.customerName}</div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {(order.items as { name: string; quantity: number; price: number }[]).map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-gray-400">
              <span className="font-bold text-gray-200">{item.quantity}×</span> {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* Time slot */}
      {order.timeSlotStart && (
        <div className={`text-xs mb-3 ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
          Slot: {formatTime(order.timeSlotStart)}
          {order.timeSlotEnd && ` - ${formatTime(order.timeSlotEnd)}`}
        </div>
      )}

      {/* Total */}
      <div className="text-sm font-bold text-gray-300 mb-3">
        {formatPrice(order.total)}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {onAction && (
          <button
            onClick={onAction}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition-all active:scale-95 ${
              variant === 'incoming'
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {actionIcon}
            {actionLabel}
          </button>
        )}

        {variant === 'ready' && (
          <>
            <button
              onClick={onCollectCash}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-500 active:scale-95"
            >
              <Banknote className="h-4 w-4" />
              Cash
            </button>
            <button
              onClick={onCollectCard}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              Card
            </button>
            <button
              onClick={onNoShow}
              className="rounded-lg bg-gray-800 px-3 py-3 text-xs font-bold text-orange-400 hover:bg-gray-700 active:scale-95"
            >
              <UserX className="h-4 w-4" />
            </button>
          </>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-lg bg-gray-800 px-3 py-3 text-xs text-gray-500 hover:bg-gray-700 hover:text-red-400 active:scale-95"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
