'use client'

import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/lib/cart'
import { useVendor } from '@/lib/vendor-context'
import { AllergenBadge } from './AllergenBadge'

type MenuItemCardProps = {
  item: {
    id: string
    name: string
    description: string | null
    price: number
    image: string | null
    allergens: string[]
    dietaryTags: string[]
    available: boolean
  }
  orderingEnabled: boolean
}

const DIETARY_LABELS: Record<string, string> = {
  vegetarian: 'V',
  vegan: 'VG',
  'gluten-free': 'GF',
}

const DIETARY_COLORS: Record<string, { bg: string; text: string }> = {
  vegetarian: { bg: 'bg-green-100', text: 'text-green-800' },
  vegan: { bg: 'bg-green-100', text: 'text-green-800' },
  'gluten-free': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
}

export function MenuItemCard({ item, orderingEnabled }: MenuItemCardProps) {
  const vendor = useVendor()
  const cart = useCart()
  const cartItem = cart.items.find((i) => i.menuItemId === item.id)
  const quantity = cartItem?.quantity || 0

  const handleAdd = () => {
    cart.addItem(
      { menuItemId: item.id, name: item.name, price: item.price },
      vendor.id,
      vendor.slug
    )
    // Trigger bounce animation
    const el = document.getElementById(`add-btn-${item.id}`)
    if (el) {
      el.classList.add('animate-bounce-add')
      setTimeout(() => el.classList.remove('animate-bounce-add'), 400)
    }
  }

  return (
    <div className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow active:shadow-md card-hover">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/60" style={{ backgroundColor: vendor.secondaryColor }}>
            {item.name.charAt(0)}
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-gray-900">Sold Out</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 leading-tight">{item.name}</h3>
          </div>
          {item.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
          )}
          {/* Tags */}
          {(item.dietaryTags.length > 0 || item.allergens.length > 0) && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {item.dietaryTags.map((tag) => {
                const colors = DIETARY_COLORS[tag] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                return (
                  <span key={tag} className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                    {DIETARY_LABELS[tag] || tag}
                  </span>
                )
              })}
              {item.allergens.map((a) => <AllergenBadge key={a} allergen={a} />)}
            </div>
          )}
        </div>

        {/* Price + add button */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-extrabold" style={{ color: vendor.primaryColor }}>
            {formatPrice(item.price)}
          </span>

          {orderingEnabled && item.available && (
            <>
              {quantity > 0 ? (
                <div id={`add-btn-${item.id}`} className="flex items-center gap-1 rounded-full border border-gray-200">
                  <button
                    onClick={() => cart.updateQuantity(item.id, quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
                    aria-label="Decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-bold">{quantity}</span>
                  <button
                    onClick={handleAdd}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white active:opacity-80"
                    style={{ backgroundColor: vendor.primaryColor }}
                    aria-label="Increase"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  id={`add-btn-${item.id}`}
                  onClick={handleAdd}
                  className="flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white active:scale-95"
                  style={{ backgroundColor: vendor.primaryColor }}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
