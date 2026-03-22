'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Flame, ArrowLeft, Timer } from 'lucide-react'

type DealData = {
  id: string; title: string; description: string; type: string
  price: number | null; savings: string | null; imageUrl: string | null
  validDays: string | null; validFrom: string | null; validTo: string | null
  endDate: string | null; isFeatured: boolean
}

type Props = {
  vendor: { id: string; name: string; slug: string; primaryColor: string }
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const diff = new Date(endDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Expired'); return }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      if (days > 0) setTimeLeft(`${days}d ${hours}h left`)
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m left`)
      else setTimeLeft(`${mins}m left`)
    }
    update()
    const i = setInterval(update, 60000)
    return () => clearInterval(i)
  }, [endDate])

  if (!timeLeft) return null
  return (
    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
      <Timer className="h-3 w-3" /> {timeLeft}
    </span>
  )
}

export function DealsClient({ vendor }: Props) {
  const [deals, setDeals] = useState<DealData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/vendor/${vendor.slug}/deals`)
      .then(r => r.json())
      .then(setDeals)
      .finally(() => setLoading(false))
  }, [vendor.slug])

  const featured = deals.find(d => d.isFeatured)
  const others = deals.filter(d => !d.isFeatured)

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link href={`/vendor/${vendor.slug}`} className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to {vendor.name}
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Flame className="h-6 w-6" style={{ color: vendor.primaryColor }} />
        <h1 className="text-2xl font-extrabold text-gray-900">Deals & Offers</h1>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">🔥</p>
          <p className="font-bold text-gray-900">No deals right now</p>
          <p className="text-sm text-gray-500 mt-1">Check back soon for special offers!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Featured hero deal */}
          {featured && (
            <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ backgroundColor: vendor.primaryColor }}>
              <div className="absolute top-3 right-3 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                ⭐ Featured
              </div>
              <h2 className="text-2xl font-extrabold">{featured.title}</h2>
              <p className="mt-2 text-sm opacity-90">{featured.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {featured.price && (
                  <span className="rounded-full bg-white/20 px-4 py-2 text-lg font-extrabold backdrop-blur-sm">
                    £{(featured.price / 100).toFixed(2)}
                  </span>
                )}
                {featured.savings && (
                  <span className="rounded-full bg-green-500/30 px-3 py-1 text-sm font-bold backdrop-blur-sm">
                    {featured.savings}
                  </span>
                )}
                {featured.endDate && <Countdown endDate={featured.endDate} />}
              </div>
              {featured.validDays && (
                <p className="mt-3 text-xs opacity-70">
                  Available: {(JSON.parse(featured.validDays) as number[]).map(d => DAY_NAMES[d]).join(', ')}
                </p>
              )}
              {featured.validFrom && featured.validTo && (
                <p className="text-xs opacity-70 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {featured.validFrom} – {featured.validTo}
                </p>
              )}
            </div>
          )}

          {/* Other deals */}
          {others.map(deal => (
            <div key={deal.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900">{deal.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{deal.description}</p>
                </div>
                {deal.price && (
                  <span className="shrink-0 ml-3 rounded-xl px-4 py-2 text-lg font-extrabold text-white"
                    style={{ backgroundColor: vendor.primaryColor }}>
                    £{(deal.price / 100).toFixed(2)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {deal.savings && (
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                    {deal.savings}
                  </span>
                )}
                {deal.validDays && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {(JSON.parse(deal.validDays) as number[]).map(d => DAY_NAMES[d]).join(', ')}
                  </span>
                )}
                {deal.validFrom && deal.validTo && (
                  <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    <Clock className="h-3 w-3" /> {deal.validFrom} – {deal.validTo}
                  </span>
                )}
                {deal.endDate && <Countdown endDate={deal.endDate} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
