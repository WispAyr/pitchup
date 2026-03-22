'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ShoppingBag, CheckCircle, ArrowLeft, Clock, Copy, Check } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useVendor } from '@/lib/vendor-context'
import { formatPrice } from '@/lib/utils'

function generateTimeSlots() {
  const slots: string[] = []
  const now = new Date()
  const startMinutes = Math.ceil((now.getMinutes() + 15) / 15) * 15
  const start = new Date(now)
  start.setMinutes(startMinutes, 0, 0)

  for (let i = 0; i < 16; i++) {
    const slot = new Date(start.getTime() + i * 15 * 60000)
    if (slot.getHours() >= 23) break
    const h = slot.getHours().toString().padStart(2, '0')
    const m = slot.getMinutes().toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
  }

  return slots
}

export default function OrderPage() {
  const cart = useCart()
  const vendor = useVendor()
  const router = useRouter()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [collectionTime, setCollectionTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [confirmationData, setConfirmationData] = useState<{
    pickupCode: string
    timeSlotStart: string
    timeSlotEnd: string
    total: number
  } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const timeSlots = useMemo(() => generateTimeSlots(), [])

  const isOurCart = cart.vendorSlug === vendor.slug
  const items = isOurCart ? cart.items : []
  const total = isOurCart ? cart.total() : 0

  const handleCopyCode = () => {
    if (confirmationData?.pickupCode) {
      navigator.clipboard.writeText(confirmationData.pickupCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    setError('')

    try {
      const [hours, minutes] = collectionTime.split(':').map(Number)
      const collectionDate = new Date()
      collectionDate.setHours(hours, minutes, 0, 0)

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          subtotal: total,
          total,
          customerName,
          customerPhone: customerPhone || undefined,
          customerEmail: customerEmail || undefined,
          collectionTime: collectionDate.toISOString(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create order')
      }

      const order = await res.json()
      cart.clearCart()
      setConfirmationData({
        pickupCode: order.pickupCode,
        timeSlotStart: order.timeSlotStart,
        timeSlotEnd: order.timeSlotEnd,
        total: order.total,
      })
      setOrderConfirmed(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
      </div>
    )
  }

  // Order confirmed — show pickup code
  if (orderConfirmed && confirmationData) {
    const slotStart = new Date(confirmationData.timeSlotStart)
    const slotEnd = new Date(confirmationData.timeSlotEnd)
    const formatTime = (d: Date) =>
      `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`

    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="mt-2 text-gray-500">
            Your pre-order has been submitted. Pay when you collect.
          </p>

          {/* Pickup Code */}
          <div className="mt-6 rounded-2xl border-2 border-dashed p-6" style={{ borderColor: vendor.primaryColor }}>
            <p className="text-sm font-medium text-gray-500 mb-2">Your Pickup Code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-black tracking-wider" style={{ color: vendor.primaryColor }}>
                {confirmationData.pickupCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                title="Copy code"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">Show this code when you arrive</p>
          </div>

          {/* Time Slot */}
          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Ready between{' '}
                <strong className="text-gray-900">
                  {formatTime(slotStart)} - {formatTime(slotEnd)}
                </strong>
              </span>
            </div>
            <p className="mt-2 text-lg font-bold" style={{ color: vendor.primaryColor }}>
              Total: {formatPrice(confirmationData.total)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Pay on collection — cash or card</p>
          </div>

          {/* Track order link */}
          <Link
            href={`/vendor/${vendor.slug}/order/track?code=${confirmationData.pickupCode}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            Track Your Order
          </Link>

          <div className="mt-4">
            <Link
              href={`/vendor/${vendor.slug}`}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to {vendor.name}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse our menu and add some items to get started.
          </p>
          <Link
            href={`/vendor/${vendor.slug}/menu`}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            <ArrowLeft className="h-4 w-4" />
            View Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Pre-Order</h1>
      <p className="mb-6 text-sm text-gray-500">
        Order ahead and pay when you collect. No payment required now.
      </p>

      {/* Cart items */}
      <section className="mb-6 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 px-4 py-3">
          <h2 className="text-sm font-bold text-gray-700">Your Order</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-gray-200">
                  <button
                    onClick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                    aria-label="Decrease"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                    aria-label="Increase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <span className="w-16 text-right text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>

                <button
                  onClick={() => cart.removeItem(item.menuItemId)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold" style={{ color: vendor.primaryColor }}>
              {formatPrice(total)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Pay on collection — cash or card accepted</p>
        </div>
      </section>

      {/* Order form */}
      <form onSubmit={handleSubmit}>
        <section className="mb-6 space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700">Your Details</h2>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': vendor.primaryColor } as React.CSSProperties}
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': vendor.primaryColor } as React.CSSProperties}
              placeholder="07xxx xxxxxx"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email <span className="text-gray-400">(for order updates)</span>
            </label>
            <input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': vendor.primaryColor } as React.CSSProperties}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="time" className="mb-1 block text-sm font-medium text-gray-700">
              Preferred Collection Time *
            </label>
            <select
              id="time"
              required
              value={collectionTime}
              onChange={(e) => setCollectionTime(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': vendor.primaryColor } as React.CSSProperties}
            >
              <option value="">Select a time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">You&apos;ll get an exact time slot when confirmed</p>
          </div>
        </section>

        {/* Pay on collection info */}
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 flex-shrink-0">
              💳
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Pay on Collection</p>
              <p className="text-xs text-amber-700 mt-0.5">
                No payment required now. You&apos;ll receive a pickup code and pay when you arrive at the van — cash or card.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !customerName || !collectionTime}
          className="w-full rounded-full py-4 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          style={{ backgroundColor: vendor.primaryColor }}
        >
          {loading ? 'Placing Pre-Order...' : `Place Pre-Order — ${formatPrice(total)}`}
        </button>
      </form>
    </div>
  )
}
