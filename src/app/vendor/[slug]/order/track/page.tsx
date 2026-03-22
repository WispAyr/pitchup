'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, CheckCircle, ChefHat, Package, Search } from 'lucide-react'
import { useVendor } from '@/lib/vendor-context'
import { formatPrice } from '@/lib/utils'

type OrderData = {
  id: string
  pickupCode: string
  status: string
  customerName: string
  items: { name: string; price: number; quantity: number }[]
  total: number
  timeSlotStart: string | null
  timeSlotEnd: string | null
  createdAt: string
}

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'collected', label: 'Collected', icon: CheckCircle },
]

export default function TrackOrderPage() {
  const vendor = useVendor()
  const searchParams = useSearchParams()
  const initialCode = searchParams.get('code') || ''

  const [code, setCode] = useState(initialCode)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrder = async (pickupCode: string) => {
    if (!pickupCode) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(pickupCode)}&vendorId=${vendor.id}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Order not found')
      }
      setOrder(await res.json())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialCode) fetchOrder(initialCode)
  }, [initialCode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh every 10 seconds when order is active
  useEffect(() => {
    if (!order || ['collected', 'cancelled', 'no-show'].includes(order.status)) return
    const interval = setInterval(() => fetchOrder(order.pickupCode), 10000)
    return () => clearInterval(interval)
  }, [order?.status, order?.pickupCode]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1
  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Track Your Order</h1>

      {/* Search */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter pickup code (e.g. P-4729)"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono tracking-wider focus:border-transparent focus:outline-none focus:ring-2"
            style={{ '--tw-ring-color': vendor.primaryColor } as React.CSSProperties}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrder(code)}
          />
          <button
            onClick={() => fetchOrder(code)}
            disabled={loading || !code}
            className="rounded-xl px-5 py-3 text-white font-semibold text-sm disabled:opacity-50"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Status - cancelled */}
          {order.status === 'cancelled' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <p className="font-bold text-red-700">Order Cancelled</p>
              <p className="text-sm text-red-600 mt-1">This order has been cancelled.</p>
            </div>
          )}

          {order.status === 'no-show' && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
              <p className="font-bold text-orange-700">Marked as No-Show</p>
              <p className="text-sm text-orange-600 mt-1">You didn&apos;t collect this order in time.</p>
            </div>
          )}

          {/* Pickup code */}
          {!['cancelled', 'no-show'].includes(order.status) && (
            <div className="rounded-2xl border-2 border-dashed p-6 text-center" style={{ borderColor: vendor.primaryColor }}>
              <p className="text-sm text-gray-500 mb-1">Pickup Code</p>
              <p className="text-4xl font-black tracking-wider" style={{ color: vendor.primaryColor }}>
                {order.pickupCode}
              </p>
              {order.timeSlotStart && order.timeSlotEnd && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Ready: {formatTime(order.timeSlotStart)} - {formatTime(order.timeSlotEnd)}
                </div>
              )}
            </div>
          )}

          {/* Progress steps */}
          {!['cancelled', 'no-show'].includes(order.status) && (
            <div className="flex justify-between">
              {STATUS_STEPS.map((step, i) => {
                const isActive = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        isCurrent
                          ? 'text-white ring-4 ring-opacity-30'
                          : isActive
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: vendor.primaryColor,
                              ...(isCurrent ? { ringColor: vendor.primaryColor } : {}),
                            }
                          : undefined
                      }
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Order details */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Order Details</h3>
            <div className="divide-y divide-gray-50">
              {(order.items as { name: string; price: number; quantity: number }[]).map((item, i) => (
                <div key={i} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-700">
                    {item.quantity}× {item.name}
                  </span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold" style={{ color: vendor.primaryColor }}>
                {formatPrice(order.total)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Pay on collection — cash or card</p>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href={`/vendor/${vendor.slug}`} className="text-sm text-gray-500 hover:text-gray-700">
          Back to {vendor.name}
        </Link>
      </div>
    </div>
  )
}
