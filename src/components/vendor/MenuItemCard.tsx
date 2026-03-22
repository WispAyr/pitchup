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
  }

  return (
    <div className="group flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
      {/* Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-28 sm:w-28">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/60"
            style={{ backgroundColor: vendor.secondaryColor }}
          >
            {item.name.charAt(0)}
          </div>
        )}
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded bg-white px-2 py-1 text-xs font-bold text-gray-900">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
            <span
              className="flex-shrink-0 font-bold"
              style={{ color: vendor.primaryColor }}
            >
              {formatPrice(item.price)}
            </span>
          </div>

          {item.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
          )}

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {item.dietaryTags.map((tag) => {
              const colors = DIETARY_COLORS[tag] || { bg: 'bg-gray-100', text: 'text-gray-700' }
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}
                >
                  {tag}
                </span>
              )
            })}
            {item.allergens.map((a) => (
              <AllergenBadge key={a} allergen={a} />
            ))}
          </div>
        </div>

        {/* Add to cart */}
        {orderingEnabled && item.available && (
          <div className="mt-2 flex items-center justify-end">
            {quantity > 0 ? (
              <div className="flex items-center gap-2 rounded-full border border-gray-200 px-1">
                <button
                  onClick={() => cart.updateQuantity(item.id, quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[1.25rem] text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={handleAdd}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors"
                  style={{ backgroundColor: vendor.primaryColor }}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-105"
                style={{ backgroundColor: vendor.primaryColor }}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
