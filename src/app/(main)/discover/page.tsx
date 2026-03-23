'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, ExternalLink } from 'lucide-react'
import type { DiscoverVendor } from '@/components/map/types'

const DynamicDiscoverMap = dynamic(
  () => import('@/components/map/VendorMap').then((mod) => mod.DiscoverMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-warm-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-warm-700 border-t-brand-500 animate-spin" />
          <p className="text-sm text-warm-500">Loading map...</p>
        </div>
      </div>
    ),
  },
)

export default function DiscoverPage() {
  const [vendors, setVendors] = useState<DiscoverVendor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'live'>('all')

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'

  useEffect(() => {
    fetch('/api/discover/map')
      .then(r => r.json())
      .then(setVendors)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const liveCount = vendors.filter(v => v.locations.some(l => l.liveSession)).length
  const filtered = filter === 'live'
    ? vendors.filter(v => v.locations.some(l => l.liveSession))
    : vendors

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col md:flex-row md:h-[calc(100vh-64px)]">
      {/* Vendor list — left on desktop, bottom sheet on mobile */}
      <div className="order-2 md:order-1 md:w-[45%] md:min-w-[380px] border-t border-warm-800 md:border-t-0 md:border-r md:border-warm-800 bg-warm-900 flex flex-col">
        {/* Search & filters */}
        <div className="shrink-0 border-b border-warm-800 p-4">
          <Link href="/discover" className="group mb-3 flex items-center gap-3 rounded-xl border border-warm-700 bg-warm-800 px-4 py-3 transition-all hover:border-brand-500/50">
            <MapPin className="h-4 w-4 text-brand-400" />
            <span className="flex-1 text-sm text-warm-400">Search by location...</span>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-colors ${
                filter === 'all' ? 'bg-brand-500 text-white' : 'bg-warm-800 text-warm-300 hover:bg-warm-700'
              }`}
            >
              All ({vendors.length})
            </button>
            {liveCount > 0 && (
              <button
                onClick={() => setFilter('live')}
                className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-colors ${
                  filter === 'live' ? 'bg-red-600 text-white' : 'bg-warm-800 text-warm-300 hover:bg-warm-700'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Live Now ({liveCount})
              </button>
            )}
          </div>
        </div>

        {/* Vendor list */}
        <div className="max-h-[40vh] md:max-h-none flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-dark h-20 w-full rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <MapPin className="mx-auto h-8 w-8 text-warm-600 mb-2" />
              <p className="font-bold text-white">No vendors found</p>
              <p className="text-sm text-warm-500">Try a different filter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered
                .sort((a, b) => {
                  const aLive = a.locations.some(l => l.liveSession) ? 0 : 1
                  const bLive = b.locations.some(l => l.liveSession) ? 0 : 1
                  return aLive - bLive
                })
                .map(vendor => {
                  const liveLoc = vendor.locations.find(l => l.liveSession)
                  const isLive = !!liveLoc
                  return (
                    <Link
                      key={vendor.id}
                      href={`${protocol}://${vendor.slug}.${rootDomain}`}
                      target="_blank"
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:bg-warm-800 active:scale-[0.98] ${
                        isLive
                          ? 'border-brand-500/30 bg-brand-500/5'
                          : 'border-warm-800 bg-warm-800/50'
                      }`}
                      style={isLive ? { borderLeftWidth: '4px', borderLeftColor: vendor.primaryColor } : { borderLeftWidth: '4px', borderLeftColor: vendor.primaryColor }}
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                        style={{ backgroundColor: vendor.primaryColor }}
                      >
                        {vendor.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-bold text-white">{vendor.name}</h3>
                          {isLive && (
                            <span className="flex items-center gap-1 shrink-0 text-xs font-bold text-brand-400">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
                              </span>
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-warm-400">
                          {vendor.cuisineType && (
                            <span className="rounded bg-warm-700 px-1.5 py-0.5 text-warm-300">{vendor.cuisineType}</span>
                          )}
                          {isLive && liveLoc && (
                            <>
                              <span>&middot;</span>
                              <span className="text-brand-400">{liveLoc.name}</span>
                            </>
                          )}
                          {!isLive && <span>{vendor.locations.length} location{vendor.locations.length !== 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-warm-600" />
                    </Link>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {/* Map — right on desktop, top on mobile */}
      <div className="relative order-1 flex-1 md:order-2">
        <DynamicDiscoverMap vendors={vendors} className="h-full" />

        {/* Mobile handle bar (shown only on mobile) */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center py-1.5 md:hidden bg-gradient-to-t from-warm-900 to-transparent">
          <div className="h-1 w-10 rounded-full bg-warm-600" />
        </div>
      </div>
    </div>
  )
}
