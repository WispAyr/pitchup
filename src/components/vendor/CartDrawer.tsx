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

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isOurCart = cart.vendorSlug === vendor.slug
  const count = isOurCart ? cart.itemCount() : 0

  if (!mounted || count === 0) return null

  return (
    <>
      {/* Floating cart summary bar — mobile */}
      <div className="fixed inset-x-0 bottom-16 z-30 px-4 md:hidden animate-slide-up">
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl px-5 py-3.5 text-white shadow-xl active:scale-[0.98] transition-transform"
          style={{ backgroundColor: vendor.primaryColor }}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-extrabold">
              {count}
            </div>
            <span className="text-sm font-bold">View Order</span>
          </div>
          <span className="text-base font-extrabold">{formatPrice(cart.total())}</span>
        </button>
      </div>

      {/* Floating cart button — desktop */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 hidden items-center gap-2 rounded-full px-5 py-3 text-white shadow-xl active:scale-95 md:flex btn-hover"
        style={{ backgroundColor: vendor.primaryColor }}
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="font-extrabold">{count}</span>
        <span className="text-sm font-bold">{formatPrice(cart.total())}</span>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} />
      )}

      {/* Drawer — slides up from bottom on mobile, from right on desktop */}
      <div className={`fixed z-50 transition-transform duration-300 ease-out
        inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl bg-white shadow-2xl
        md:inset-y-0 md:right-0 md:left-auto md:w-96 md:max-h-full md:rounded-none
        ${open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}
      `}>
        {/* Handle bar (mobile) */}
        <div className="flex justify-center py-2 md:hidden">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-lg font-extrabold">Your Order</h2>
          <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between border-b border-gray-50 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(item.price)} each</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 rounded-full border border-gray-200">
                  <button onClick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full active:bg-gray-100" aria-label="Decrease">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full active:bg-gray-100" aria-label="Increase">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="w-14 text-right text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
                <button onClick={() => cart.removeItem(item.menuItemId)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-red-400 active:bg-red-50" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-5 pb-safe">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-bold text-gray-600">Subtotal</span>
            <span className="text-xl font-extrabold">{formatPrice(cart.total())}</span>
          </div>
          <button
            onClick={() => { setOpen(false); router.push('/order') }}
            className="flex h-13 w-full items-center justify-center rounded-2xl text-base font-extrabold text-white active:scale-[0.98]"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            Checkout — {formatPrice(cart.total())}
          </button>
        </div>
      </div>
    </>
  )
}
