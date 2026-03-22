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
      <div className="h-full w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
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

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch('/api/discover/map')
        if (res.ok) {
          const data = await res.json()
          setVendors(data)
        }
      } catch (err) {
        console.error('Failed to fetch discover data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchVendors()
  }, [])

  // Count live vendors
  const liveCount = vendors.filter((v) =>
    v.locations.some((l) => l.liveSession),
  ).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
              <p className="text-sm text-gray-500">
                {loading
                  ? 'Finding vendors...'
                  : liveCount > 0
                    ? `${liveCount} vendor${liveCount !== 1 ? 's' : ''} live now · ${vendors.length} total`
                    : `${vendors.length} vendor${vendors.length !== 1 ? 's' : ''} on the platform`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Map — full featured with filters, clusters, search */}
        <div className="h-[60vh] sm:h-[70vh] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-8">
          <DynamicDiscoverMap vendors={vendors} className="h-full" />
        </div>

        {/* Vendor cards below the map */}
        {!loading && vendors.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-100 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
              <MapPin className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No vendors yet</h2>
            <p className="text-gray-500">Check back soon!</p>
          </div>
        ) : (
          <>
            {liveCount > 0 && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">🔴 Live Now</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {vendors
                    .filter((v) => v.locations.some((l) => l.liveSession))
                    .map((vendor) => {
                      const liveLoc = vendor.locations.find((l) => l.liveSession)!
                      return (
                        <div
                          key={vendor.id}
                          className="overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="h-1.5" style={{ backgroundColor: vendor.primaryColor }} />
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Live
                              </span>
                            </div>
                            {vendor.cuisineType && (
                              <span
                                className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2"
                                style={{
                                  backgroundColor: `${vendor.primaryColor}20`,
                                  color: vendor.primaryColor,
                                }}
                              >
                                {vendor.cuisineType}
                              </span>
                            )}
                            <p className="text-sm text-gray-500 mb-3">{liveLoc.name}</p>
                            <Link
                              href={`${protocol}://${vendor.slug}.${rootDomain}`}
                              target="_blank"
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                            >
                              View Menu
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </>
            )}

            <h2 className="text-xl font-bold text-gray-900 mb-4">All Vendors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-1" style={{ backgroundColor: vendor.primaryColor }} />
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1">{vendor.name}</h3>
                    {vendor.cuisineType && (
                      <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 mb-2">
                        {vendor.cuisineType}
                      </span>
                    )}
                    <p className="text-xs text-gray-400">
                      {vendor.locations.length} location{vendor.locations.length !== 1 ? 's' : ''}
                    </p>
                    <Link
                      href={`${protocol}://${vendor.slug}.${rootDomain}`}
                      target="_blank"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      Visit
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
