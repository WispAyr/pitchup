'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, ExternalLink } from 'lucide-react'

const LiveMap = dynamic(() => import('@/components/maps/LiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading map...</p>
    </div>
  ),
})

interface LiveSession {
  id: string
  lat: number
  lng: number
  vendor: {
    name: string
    slug: string
    cuisineType: string | null
    primaryColor: string
  }
  location: {
    name: string
  }
}

interface MapVendor {
  id: string
  name: string
  slug: string
  cuisineType: string | null
  lat: number
  lng: number
  primaryColor: string
  locationName: string
}

export default function DiscoverPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/live-sessions')
        if (res.ok) {
          const data = await res.json()
          setSessions(data)
        }
      } catch (err) {
        console.error('Failed to fetch live sessions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  const mapVendors: MapVendor[] = sessions.map((s) => ({
    id: s.id,
    name: s.vendor.name,
    slug: s.vendor.slug,
    cuisineType: s.vendor.cuisineType,
    lat: s.lat,
    lng: s.lng,
    primaryColor: s.vendor.primaryColor,
    locationName: s.location.name,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
              <p className="text-sm text-gray-500">
                {loading
                  ? 'Finding live vendors...'
                  : sessions.length > 0
                  ? `${sessions.length} vendor${sessions.length !== 1 ? 's' : ''} live right now`
                  : 'No vendors are live right now'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Map */}
        <div className="h-[50vh] sm:h-[60vh] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-8">
          <LiveMap vendors={mapVendors} />
        </div>

        {/* Live vendor list */}
        {!loading && sessions.length === 0 ? (
          <div className="rounded-xl bg-white border border-gray-100 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
              <MapPin className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No vendors are live right now</h2>
            <p className="text-gray-500 mb-6">
              Check back later or browse the full vendor directory.
            </p>
            <Link
              href="/vendors"
              className="inline-flex items-center rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Browse Vendors
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Live Now</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-1.5" style={{ backgroundColor: session.vendor.primaryColor }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{session.vendor.name}</h3>
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                    {session.vendor.cuisineType && (
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-2"
                        style={{
                          backgroundColor: `${session.vendor.primaryColor}20`,
                          color: session.vendor.primaryColor,
                        }}
                      >
                        {session.vendor.cuisineType}
                      </span>
                    )}
                    <p className="text-sm text-gray-500 mb-3">{session.location.name}</p>
                    <Link
                      href={`${protocol}://${session.vendor.slug}.${rootDomain}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      View Menu
                      <ExternalLink className="h-3.5 w-3.5" />
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
