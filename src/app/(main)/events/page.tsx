'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Clock, ExternalLink } from 'lucide-react'

type EventData = {
  id: string
  name: string
  description: string | null
  location: string
  latitude: number | null
  longitude: number | null
  startDate: string
  endDate: string
  isMultiDay: boolean
  imageUrl: string | null
  status: string
  preOrderEnabled: boolean
  vendor: {
    id: string
    name: string
    slug: string
    primaryColor: string
    cuisineType: string | null
    logo: string | null
  }
  vehicle: { id: string; name: string } | null
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()

  function formatDateRange(start: string, end: string, isMultiDay: boolean) {
    const s = new Date(start)
    const e = new Date(end)
    if (isMultiDay) {
      return `${s.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`
    }
    return s.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <h1 className="text-3xl font-extrabold text-gray-900">🎪 Events</h1>
          <p className="mt-1 text-gray-500">Festivals, airshows, markets — find your next food stop.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-40 w-full rounded-2xl" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-4">🎪</p>
              <h2 className="text-xl font-bold text-gray-900">No upcoming events</h2>
              <p className="mt-1 text-gray-500">Check back soon for festivals, markets, and more.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {events.map((event) => {
              const isLive = now >= new Date(event.startDate) && now <= new Date(event.endDate)
              return (
                <div
                  key={event.id}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${isLive ? 'border-2 ring-1 ring-opacity-20' : 'border-gray-100'}`}
                  style={isLive ? { borderColor: event.vendor.primaryColor, ringColor: event.vendor.primaryColor } : {}}
                >
                  {/* Vendor brand bar */}
                  <div className="h-1.5" style={{ backgroundColor: event.vendor.primaryColor }} />

                  {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.name} className="h-40 w-full object-cover" loading="lazy" />
                  )}

                  <div className="p-5">
                    {isLive && (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        <span className="text-xs font-bold text-green-700">HAPPENING NOW</span>
                      </div>
                    )}

                    <h3 className="text-lg font-extrabold text-gray-900">{event.name}</h3>

                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {formatDateRange(event.startDate, event.endDate, event.isMultiDay)}
                      </div>
                    </div>

                    {event.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    )}

                    {/* Vendor link */}
                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        href={`${protocol}://${event.vendor.slug}.${rootDomain}`}
                        target="_blank"
                        className="flex items-center gap-2"
                      >
                        {event.vendor.logo ? (
                          <img src={event.vendor.logo} alt="" className="h-7 w-7 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: event.vendor.primaryColor }}>
                            {event.vendor.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm font-bold text-gray-900">{event.vendor.name}</span>
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </Link>

                      {event.vehicle && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500">
                          🚐 {event.vehicle.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
