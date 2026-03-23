'use client'

import { useEffect, useRef, useState } from 'react'
import { MenuItemCard } from '@/components/vendor/MenuItemCard'
import { AllergenBadge } from '@/components/vendor/AllergenBadge'
import { useVendor } from '@/lib/vendor-context'

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  allergens: string[]
  dietaryTags: string[]
  available: boolean
}

type Category = {
  id: string
  name: string
  items: MenuItem[]
}

type MenuPageClientProps = {
  categories: Category[]
  allAllergens: string[]
  preOrderingEnabled: boolean
}

export function MenuPageClient({ categories, allAllergens, preOrderingEnabled }: MenuPageClientProps) {
  const vendor = useVendor()
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id)
          }
        }
      },
      { rootMargin: '-120px 0px -60% 0px' }
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [categories])

  // Auto-scroll nav pill into view
  useEffect(() => {
    if (!navRef.current) return
    const activeEl = navRef.current.querySelector(`[data-cat="${activeCategory}"]`)
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeCategory])

  const scrollToCategory = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 140
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-lg font-bold text-gray-900">Menu coming soon</p>
          <p className="mt-1 text-sm text-gray-500">Check back later for our full menu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 animate-fade-in-up">
      <h1 className="mb-4 text-2xl font-extrabold text-gray-900">Our Menu</h1>

      {/* Sticky category nav — scrollable pills */}
      {categories.length > 1 && (
        <div className="sticky top-[52px] z-20 -mx-4 mb-5 border-b border-gray-100 bg-white/95 backdrop-blur-sm md:top-[65px]">
          <div ref={navRef} className="flex gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-cat={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-bold transition-colors ${
                  activeCategory === cat.id ? 'text-white' : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
                style={activeCategory === cat.id ? { backgroundColor: vendor.primaryColor } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu sections */}
      <div className="space-y-8">
        {categories.map((cat, index) => (
          <section
            key={cat.id}
            id={cat.id}
            ref={(el) => { sectionRefs.current[cat.id] = el }}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(index * 0.1, 0.5)}s` }}
          >
            <h2 className="mb-3 text-lg font-extrabold text-gray-900">{cat.name}</h2>
            {/* Full-width stacked cards on mobile, 2-col on desktop */}
            <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
              {cat.items.map((item) => (
                <MenuItemCard key={item.id} item={item} orderingEnabled={preOrderingEnabled} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Allergens */}
      {allAllergens.length > 0 && (
        <section className="mt-10 rounded-2xl bg-gray-50 p-5">
          <h3 className="mb-3 text-sm font-bold text-gray-700">Allergen Information</h3>
          <div className="flex flex-wrap gap-2">
            {allAllergens.map((a) => <AllergenBadge key={a} allergen={a} />)}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            If you have any food allergies, please speak to a member of our team.
          </p>
        </section>
      )}

      {/* Bottom spacer for sticky CTA */}
      {preOrderingEnabled && <div className="h-20 md:h-0" />}
    </div>
  )
}
