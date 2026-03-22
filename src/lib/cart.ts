import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = {
  menuItemId: string
  name: string
  price: number // pence
  quantity: number
}

type CartStore = {
  items: CartItem[]
  vendorId: string | null
  vendorSlug: string | null
  addItem: (item: Omit<CartItem, 'quantity'>, vendorId: string, vendorSlug: string) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      vendorId: null,
      vendorSlug: null,

      addItem: (item, vendorId, vendorSlug) => {
        const state = get()

        // If adding from a different vendor, clear cart first
        if (state.vendorId && state.vendorId !== vendorId) {
          set({ items: [], vendorId, vendorSlug })
        }

        const existing = get().items.find((i) => i.menuItemId === item.menuItemId)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
            vendorId,
            vendorSlug,
          })
        } else {
          set({
            items: [...get().items, { ...item, quantity: 1 }],
            vendorId,
            vendorSlug,
          })
        }
      },

      removeItem: (menuItemId) => {
        const newItems = get().items.filter((i) => i.menuItemId !== menuItemId)
        set({
          items: newItems,
          vendorId: newItems.length === 0 ? null : get().vendorId,
          vendorSlug: newItems.length === 0 ? null : get().vendorSlug,
        })
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [], vendorId: null, vendorSlug: null }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'pitchup-cart',
    }
  )
)

export type { CartItem, CartStore }
