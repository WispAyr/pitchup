'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useVendor } from '@/lib/vendor-context'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function CartDrawer() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cart = useCart()
  const vendor = useVendor()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only show for this vendor's cart
  const isOurCart = cart.vendorSlug === vendor.slug
  const count = isOurCart ? cart.itemCount() : 0

  if (!mounted || count === 0) return null

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-white shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: vendor.primaryColor }}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-bold">{count}</span>
        <span className="text-sm font-medium">{formatPrice(cart.total())}</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-bold">Your Order</h2>
          <button
            onClick={() => setOpen(false)}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.map((item) => (
            <div
              key={item.menuItemId}
              className="flex items-center justify-between border-b border-gray-50 py-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {formatPrice(item.price)} each
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-gray-200">
                  <button
                    onClick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100"
                    aria-label="Decrease"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-[1.25rem] text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-100"
                    aria-label="Increase"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <span className="w-16 text-right text-sm font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </span>

                <button
                  onClick={() => cart.removeItem(item.menuItemId)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Subtotal</span>
            <span className="text-lg font-bold">{formatPrice(cart.total())}</span>
          </div>
          <button
            onClick={() => {
              setOpen(false)
              router.push('/order')
            }}
            className="w-full rounded-full py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  )
}
