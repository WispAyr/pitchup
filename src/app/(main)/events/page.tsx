'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MapPin, Calendar, ExternalLink } from 'lucide-react'

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

  function getDateBadge(dateStr: string) {
    const d = new Date(dateStr)
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    }
  }

  return (
    <div className="min-h-screen bg-warm-900">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-warm-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.1),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:py-14">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Events</h1>
          <p className="mt-2 text-warm-400">Festivals, airshows, markets — find your next food stop.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-dark h-48 w-full rounded-2xl" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-4">🎪</p>
              <h2 className="text-xl font-bold text-white">No upcoming events</h2>
              <p className="mt-1 text-warm-400">Check back soon for festivals, markets, and more.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Coming Up heading */}
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-warm-300">
              <Calendar className="h-5 w-5 text-brand-400" />
              Coming Up
            </h2>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {events.map((event) => {
                const isLive = now >= new Date(event.startDate) && now <= new Date(event.endDate)
                const dateBadge = getDateBadge(event.startDate)
                return (
                  <div
                    key={event.id}
                    className={`overflow-hidden rounded-2xl border transition-all ${
                      isLive
                        ? 'border-brand-500/40 bg-warm-800 ring-1 ring-brand-500/20'
                        : 'border-warm-800 bg-warm-800/50 hover:border-warm-700'
                    }`}
                  >
                    <div className="flex">
                      {/* Date badge */}
                      <div className="flex w-20 shrink-0 flex-col items-center justify-center border-r border-warm-700/50 bg-warm-900/50 p-4">
                        <span className="text-2xl font-extrabold text-brand-400">{dateBadge.day}</span>
                        <span className="text-xs font-bold text-warm-400">{dateBadge.month}</span>
                      </div>

                      <div className="flex-1 p-5">
                        {isLive && (
                          <div className="mb-2 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                            </span>
                            <span className="text-xs font-bold text-red-400">HAPPENING NOW</span>
                          </div>
                        )}

                        <h3 className="text-lg font-extrabold text-white">{event.name}</h3>

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-warm-400">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-warm-500" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-warm-400">
                            <Calendar className="h-3.5 w-3.5 shrink-0 text-warm-500" />
                            {formatDateRange(event.startDate, event.endDate, event.isMultiDay)}
                          </div>
                        </div>

                        {event.description && (
                          <p className="mt-2 text-sm text-warm-400 line-clamp-2">{event.description}</p>
                        )}

                        {/* Vendor link */}
                        <div className="mt-4 flex items-center justify-between">
                          <Link
                            href={`${protocol}://${event.vendor.slug}.${rootDomain}`}
                            target="_blank"
                            className="flex items-center gap-2 group"
                          >
                            {event.vendor.logo ? (
                              <img src={event.vendor.logo} alt="" className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: event.vendor.primaryColor }}>
                                {event.vendor.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-bold text-warm-200 group-hover:text-brand-400 transition-colors">{event.vendor.name}</span>
                            <ExternalLink className="h-3 w-3 text-warm-500" />
                          </Link>

                          {event.vehicle && (
                            <span className="rounded-full bg-warm-700 px-2.5 py-1 text-xs font-bold text-warm-300">
                              🚐 {event.vehicle.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {event.imageUrl && (
                      <img src={event.imageUrl} alt={event.name} className="h-40 w-full object-cover border-t border-warm-700/50" loading="lazy" />
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
