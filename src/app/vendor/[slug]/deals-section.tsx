'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Clock, Flame } from 'lucide-react'

type DealData = {
  id: string; title: string; description: string; type: string
  price: number | null; savings: string | null
  validFrom: string | null; validTo: string | null
  isFeatured: boolean
}

export function DealsSection({ vendorSlug, primaryColor }: { vendorSlug: string; primaryColor: string }) {
  const [deals, setDeals] = useState<DealData[]>([])

  useEffect(() => {
    fetch(`/api/vendor/${vendorSlug}/deals`)
      .then(r => r.ok ? r.json() : [])
      .then(setDeals)
      .catch(() => {})
  }, [vendorSlug])

  if (deals.length === 0) return null

  const featured = deals.find(d => d.isFeatured)
  const rest = deals.filter(d => !d.isFeatured).slice(0, 2)

  return (
    <section className="animate-fade-in-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
          <Flame className="h-5 w-5" style={{ color: primaryColor }} />
          Deals & Offers
        </h2>
        <Link href="/deals" className="flex items-center gap-1 text-sm font-bold" style={{ color: primaryColor }}>
          All Deals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {featured && (
          <Link href="/deals" className="block rounded-2xl p-5 text-white" style={{ backgroundColor: primaryColor }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider opacity-70">⭐ Featured Deal</div>
                <h3 className="mt-1 text-lg font-extrabold">{featured.title}</h3>
                <p className="mt-1 text-sm opacity-90">{featured.description}</p>
              </div>
              {featured.price && (
                <span className="shrink-0 ml-3 rounded-xl bg-white/20 px-4 py-2 text-xl font-extrabold backdrop-blur-sm">
                  £{(featured.price / 100).toFixed(2)}
                </span>
              )}
            </div>
            {featured.savings && (
              <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{featured.savings}</span>
            )}
          </Link>
        )}

        {rest.map(deal => (
          <Link key={deal.id} href="/deals"
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm card-hover">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900">{deal.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">{deal.description}</p>
              <div className="mt-1 flex gap-2">
                {deal.savings && <span className="text-xs font-bold text-green-600">{deal.savings}</span>}
                {deal.validFrom && deal.validTo && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" /> {deal.validFrom} – {deal.validTo}
                  </span>
                )}
              </div>
            </div>
            {deal.price && (
              <span className="shrink-0 ml-3 rounded-xl px-3 py-1.5 text-base font-extrabold text-white"
                style={{ backgroundColor: primaryColor }}>
                £{(deal.price / 100).toFixed(2)}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
