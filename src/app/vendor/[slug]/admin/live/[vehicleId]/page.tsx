'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import {
  Clock, ChefHat, Package, CheckCircle, Banknote, CreditCard,
  XCircle, UserX, Volume2, VolumeX, Maximize, ArrowLeft, Truck,
} from 'lucide-react'
import Link from 'next/link'

type Order = {
  id: string; pickupCode: string | null; status: string; customerName: string
  customerPhone: string | null; items: { name: string; price: number; quantity: number }[]
  total: number; timeSlotStart: string | null; timeSlotEnd: string | null
  paymentMethod: string | null; paidAt: string | null; createdAt: string
  liveSessionId: string | null
}

const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1sbW1+kbGlkIR4dH2Ck6u0qpWJgH56h5iusrOfkIZ/fYGNoa2xppKHf31/hpOkr6+gi4J8eoCIl6qwqpSHf3t7g4yaqrKulIZ+enyCiperr6qTh357fIKLm6qyrpWHfnt8gYqaqrCulYh+e3yBipmqsK6Wh358fYGJmaqxrpaIfnx8gYqZqrGuloh+fHyBipmqsK6ViH57fIGKmaqwrpaIfnx8gYqZqrGul4h+fHyBipmqsa6Wh358fIGKmaqwr5aIfnx8gYqZqrGuloh+fH2BiZqqsa6Wh358'

function useNow(ms = 1000) {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), ms); return () => clearInterval(id) }, [ms])
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

export default function VanKDSPage() {
  const params = useParams()
  const slug = params.slug as string
  const vehicleId = params.vehicleId as string
  const isAll = vehicleId === 'all'

  const { data: session } = useSession()
  const vendorId = (session?.user as any)?.id

  const [orders, setOrders] = useState<Order[]>([])
  const [vehicleName, setVehicleName] = useState('')
  const [locationName, setLocationName] = useState('')
  const [sessionStart, setSessionStart] = useState('')
  const [loading, setLoading] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const prevOrderIdsRef = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const now = useNow()

  useEffect(() => { audioRef.current = new Audio(NOTIFICATION_SOUND_URL) }, [])

  const playNotification = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
    if (Notification.permission === 'granted') {
      new Notification('New Order!', { body: `New order on ${vehicleName || 'KDS'}` })
    }
  }, [soundEnabled, vehicleName])

  const fetchOrders = useCallback(async () => {
    if (!vendorId) return
    try {
      // Get live sessions to filter orders
      const sessRes = await fetch(`/api/live-sessions?vendorId=${vendorId}`)
      const sessions = await sessRes.json()
      const activeSessions = sessions.filter((s: any) => !s.endedAt && !s.cancelled)

      let relevantSessionIds: string[]
      if (isAll) {
        relevantSessionIds = activeSessions.map((s: any) => s.id)
        setVehicleName('All Vans')
        setLocationName(`${activeSessions.length} active`)
      } else {
        const vanSession = activeSessions.find((s: any) => s.vehicleId === vehicleId)
        if (vanSession) {
          relevantSessionIds = [vanSession.id]
          setVehicleName(vanSession.vehicle?.name || 'Van')
          setLocationName(vanSession.location?.name || '')
          setSessionStart(vanSession.startedAt)
        } else {
          relevantSessionIds = []
          // Try get vehicle name
          try {
            const vRes = await fetch(`/api/vendor/${slug}/vehicles`)
            const vehicles = await vRes.json()
            const v = vehicles.find((v: any) => v.id === vehicleId)
            if (v) setVehicleName(v.name)
          } catch {}
        }
      }

      const res = await fetch(`/api/orders?vendorId=${vendorId}`)
      if (res.ok) {
        const data: Order[] = await res.json()
        const active = data.filter(o =>
          ['confirmed', 'preparing', 'ready'].includes(o.status) &&
          (relevantSessionIds.length === 0 || !o.liveSessionId || relevantSessionIds.includes(o.liveSessionId))
        )

        const currentIds = new Set(active.filter(o => o.status === 'confirmed').map(o => o.id))
        const prevIds = prevOrderIdsRef.current
        if (Array.from(currentIds).some(id => !prevIds.has(id)) && prevIds.size > 0) {
          playNotification()
        }
        prevOrderIdsRef.current = currentIds
        setOrders(active)
      }
    } catch (e) { console.error('KDS fetch error:', e) }
    finally { setLoading(false) }
  }, [vendorId, vehicleId, isAll, slug, playNotification])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 4000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  useEffect(() => { if (Notification.permission === 'default') Notification.requestPermission() }, [])

  const updateStatus = async (orderId: string, status: string, extra?: Record<string, any>) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      })
      if (res.ok) fetchOrders()
    } catch {}
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true) }
    else { document.exitFullscreen(); setIsFullscreen(false) }
  }

  const incoming = orders.filter(o => o.status === 'confirmed')
  const preparing = orders.filter(o => o.status === 'preparing')
  const ready = orders.filter(o => o.status === 'ready')

  if (loading) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-amber-500" />
    </div>
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 text-white select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2.5">
        <div className="flex items-center gap-4">
          <Link href={`/vendor/${slug}/admin/live`} className="rounded-lg p-2 hover:bg-gray-800">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-base font-black flex items-center gap-2">
              🚐 {vehicleName || 'KDS'}
              {locationName && <span className="text-xs font-normal text-gray-500">@ {locationName}</span>}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs ml-4">
            <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-blue-300 font-bold">{incoming.length} new</span>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-amber-300 font-bold">{preparing.length} prep</span>
            <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-green-300 font-bold">{ready.length} ready</span>
          </div>
          {sessionStart && (
            <span className="hidden lg:block text-xs text-gray-600">Session: {timeSince(sessionStart, now)}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="rounded-lg p-2 hover:bg-gray-800">
            {soundEnabled ? <Volume2 className="h-5 w-5 text-green-400" /> : <VolumeX className="h-5 w-5 text-gray-500" />}
          </button>
          <button onClick={toggleFullscreen} className="rounded-lg p-2 hover:bg-gray-800">
            <Maximize className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Three columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* INCOMING */}
        <div className="flex flex-1 flex-col border-r border-gray-800">
          <div className="border-b border-gray-800 bg-blue-500/10 px-4 py-2.5">
            <h2 className="text-center text-xs font-black uppercase tracking-wider text-blue-400">Incoming ({incoming.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {incoming.map(order => (
              <KDSCard key={order.id} order={order} now={now} variant="incoming"
                onAction={() => updateStatus(order.id, 'preparing')} actionLabel="Accept" actionIcon={<ChefHat className="h-4 w-4" />}
                onCancel={() => updateStatus(order.id, 'cancelled', { cancelReason: 'Rejected' })} />
            ))}
            {incoming.length === 0 && <Empty text="No incoming" />}
          </div>
        </div>

        {/* PREPARING */}
        <div className="flex flex-1 flex-col border-r border-gray-800">
          <div className="border-b border-gray-800 bg-amber-500/10 px-4 py-2.5">
            <h2 className="text-center text-xs font-black uppercase tracking-wider text-amber-400">Preparing ({preparing.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {preparing.map(order => (
              <KDSCard key={order.id} order={order} now={now} variant="preparing"
                onAction={() => updateStatus(order.id, 'ready')} actionLabel="Ready" actionIcon={<Package className="h-4 w-4" />}
                onCancel={() => updateStatus(order.id, 'cancelled', { cancelReason: 'Cancelled' })} />
            ))}
            {preparing.length === 0 && <Empty text="Nothing preparing" />}
          </div>
        </div>

        {/* READY */}
        <div className="flex flex-1 flex-col">
          <div className="border-b border-gray-800 bg-green-500/10 px-4 py-2.5">
            <h2 className="text-center text-xs font-black uppercase tracking-wider text-green-400">Ready ({ready.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {ready.map(order => (
              <KDSCard key={order.id} order={order} now={now} variant="ready" onAction={null} actionLabel="" actionIcon={null}
                onCollectCash={() => updateStatus(order.id, 'collected', { paymentMethod: 'cash' })}
                onCollectCard={() => updateStatus(order.id, 'collected', { paymentMethod: 'card' })}
                onNoShow={() => updateStatus(order.id, 'no-show')} />
            ))}
            {ready.length === 0 && <Empty text="No orders ready" />}
          </div>
        </div>
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="flex h-32 items-center justify-center text-gray-700 text-sm">{text}</div>
}

function KDSCard({
  order, now, variant, onAction, actionLabel, actionIcon, onCancel, onCollectCash, onCollectCard, onNoShow,
}: {
  order: Order; now: Date; variant: 'incoming' | 'preparing' | 'ready'
  onAction: (() => void) | null; actionLabel: string; actionIcon: React.ReactNode
  onCancel?: () => void; onCollectCash?: () => void; onCollectCard?: () => void; onNoShow?: () => void
}) {
  const overdue = isOverdue(order, now)
  const isNew = variant === 'incoming' && (now.getTime() - new Date(order.createdAt).getTime()) < 30000

  return (
    <div className={`rounded-xl border-2 p-3.5 transition-all ${
      overdue ? 'border-red-500 bg-red-950/50 ring-2 ring-red-500/30' :
      variant === 'incoming' ? `border-blue-500/40 bg-gray-900 ${isNew ? 'animate-pulse ring-2 ring-blue-400/40' : ''}` :
      variant === 'preparing' ? 'border-amber-500/40 bg-gray-900' :
      'border-green-500/40 bg-gray-900'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`text-2xl font-black tracking-wider ${overdue ? 'text-red-400' : 'text-white'}`}>
          {order.pickupCode || '???'}
        </div>
        <div className="text-right">
          <div className={`text-[11px] font-mono ${overdue ? 'text-red-400' : 'text-gray-500'}`}>
            <Clock className="inline h-3 w-3 mr-0.5" />{timeSince(order.createdAt, now)}
          </div>
          {overdue && <div className="text-[10px] font-bold text-red-400">OVERDUE</div>}
        </div>
      </div>

      <div className="text-sm font-semibold text-gray-300 mb-1.5">{order.customerName}</div>

      <div className="space-y-0.5 mb-2">
        {(order.items as any[]).map((item, i) => (
          <div key={i} className="text-xs text-gray-400">
            <span className="font-bold text-gray-200">{item.quantity}×</span> {item.name}
          </div>
        ))}
      </div>

      {order.timeSlotStart && (
        <div className={`text-[11px] mb-2 ${overdue ? 'text-red-400' : 'text-gray-600'}`}>
          Slot: {formatTime(order.timeSlotStart)}{order.timeSlotEnd && ` – ${formatTime(order.timeSlotEnd)}`}
        </div>
      )}

      <div className="text-sm font-bold text-gray-300 mb-2.5">{formatPrice(order.total)}</div>

      <div className="flex flex-wrap gap-1.5">
        {onAction && (
          <button onClick={onAction} className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold text-white active:scale-95 ${
            variant === 'incoming' ? 'bg-blue-600' : 'bg-amber-600'
          }`}>
            {actionIcon}{actionLabel}
          </button>
        )}
        {variant === 'ready' && (
          <>
            <button onClick={onCollectCash} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white active:scale-95">
              <Banknote className="h-3.5 w-3.5" />Cash
            </button>
            <button onClick={onCollectCard} className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white active:scale-95">
              <CreditCard className="h-3.5 w-3.5" />Card
            </button>
            <button onClick={onNoShow} className="rounded-lg bg-gray-800 px-2.5 py-2.5 text-xs text-orange-400 active:scale-95">
              <UserX className="h-4 w-4" />
            </button>
          </>
        )}
        {onCancel && (
          <button onClick={onCancel} className="rounded-lg bg-gray-800 px-2.5 py-2.5 text-xs text-gray-500 hover:text-red-400 active:scale-95">
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
