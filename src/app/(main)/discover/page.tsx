'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, ExternalLink, Search } from 'lucide-react'
import type { DiscoverVendor } from '@/components/map/types'

const DynamicDiscoverMap = dynamic(
  () => import('@/components/map/VendorMap').then((mod) => mod.DiscoverMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading map...</p>
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
    <div className="flex h-[calc(100vh-56px)] flex-col md:h-[calc(100vh-64px)]">
      {/* Map — takes most of the screen on mobile */}
      <div className="relative flex-1">
        <DynamicDiscoverMap vendors={vendors} className="h-full" />

        {/* Floating filter bar */}
        <div className="absolute left-3 right-3 top-3 z-10 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold shadow-md backdrop-blur-sm ${
              filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white/90 text-gray-700'
            }`}
          >
            All ({vendors.length})
          </button>
          {liveCount > 0 && (
            <button
              onClick={() => setFilter('live')}
              className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold shadow-md backdrop-blur-sm ${
                filter === 'live' ? 'bg-green-600 text-white' : 'bg-white/90 text-gray-700'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live ({liveCount})
            </button>
          )}
        </div>
      </div>

      {/* Bottom sheet — vendor cards */}
      <div className="border-t border-gray-200 bg-white">
        {/* Handle bar */}
        <div className="flex justify-center py-2">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="max-h-[40vh] overflow-y-auto px-4 pb-4 md:max-h-[50vh]">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="font-bold text-gray-900">No vendors found</p>
              <p className="text-sm text-gray-500">Try a different filter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Live vendors first */}
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
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 active:bg-gray-50"
                    >
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                        style={{ backgroundColor: vendor.primaryColor }}
                      >
                        {vendor.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-bold text-gray-900">{vendor.name}</h3>
                          {isLive && (
                            <span className="flex items-center gap-1 shrink-0 text-xs font-bold text-green-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                              Live
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {vendor.cuisineType && <span>{vendor.cuisineType}</span>}
                          {isLive && liveLoc && (
                            <>
                              <span>·</span>
                              <span>{liveLoc.name}</span>
                            </>
                          )}
                          {!isLive && <span>{vendor.locations.length} location{vendor.locations.length !== 1 ? 's' : ''}</span>}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-gray-300" />
                    </Link>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
