'use client'

import { formatPrice } from '@/lib/utils'

interface OrderItem {
  menuItemId?: string
  name: string
  price: number
  quantity: number
}

interface OrderCardProps {
  order: {
    id: string
    customerName: string
    items: OrderItem[]
    total: number
    status: string
    collectionTime?: string | null
    createdAt: string
    customer?: { name: string; email?: string }
  }
  accentColor?: string
  onUpdateStatus: (orderId: string, newStatus: string) => void
  updating?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-purple-500/20 text-purple-400',
  ready: 'bg-green-500/20 text-green-400',
  collected: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function OrderCard({ order, accentColor, onUpdateStatus, updating }: OrderCardProps) {
  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[]
  const shortId = order.id.slice(-6).toUpperCase()

  const nextStatus: Record<string, string> = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'collected',
  }

  const actionLabels: Record<string, string> = {
    pending: 'Confirm',
    confirmed: 'Start Preparing',
    preparing: 'Mark Ready',
    ready: 'Mark Collected',
  }

  return (
    <div className="rounded-lg bg-[#1F2937] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-sm font-bold text-white">#{shortId}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] || ''}`}>
          {order.status.toUpperCase()}
        </span>
      </div>

      <p className="text-sm font-medium text-gray-300">
        {order.customerName || order.customer?.name || 'Customer'}
      </p>

      <div className="mt-2 space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs text-gray-400">
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-gray-700 pt-2">
        <span className="text-sm font-bold text-white">{formatPrice(order.total)}</span>
        <span className="text-xs text-gray-500">{timeAgo(order.createdAt)}</span>
      </div>

      {order.collectionTime && (
        <p className="mt-1 text-xs text-gray-500">
          Collection: {new Date(order.collectionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {nextStatus[order.status] && (
          <button
            onClick={() => onUpdateStatus(order.id, nextStatus[order.status])}
            disabled={updating}
            className="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: accentColor || '#F59E0B' }}
          >
            {actionLabels[order.status]}
          </button>
        )}
        {(order.status === 'pending' || order.status === 'confirmed') && (
          <button
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            disabled={updating}
            className="rounded-lg bg-red-600/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition-opacity hover:bg-red-600/30 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
