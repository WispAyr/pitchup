import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { MapPin, Calendar, Clock } from 'lucide-react'

export default async function VendorEventsPage({ params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      events: {
        orderBy: { startDate: 'asc' },
        include: { vehicle: { select: { name: true } } },
      },
    },
  })

  if (!vendor) return null

  const now = new Date()
  const upcoming = vendor.events.filter(e => new Date(e.endDate) >= now && e.status !== 'cancelled')
  const past = vendor.events.filter(e => new Date(e.endDate) < now || e.status === 'completed')

  function formatDateRange(start: Date, end: Date, isMultiDay: boolean) {
    const s = new Date(start)
    const e = new Date(end)
    if (isMultiDay) {
      return `${s.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`
    }
    return `${s.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
  }

  function formatTime(d: Date) {
    return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 animate-fade-in-up">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">Events</h1>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-3">🎪</p>
            <p className="text-lg font-bold text-gray-900">No events yet</p>
            <p className="mt-1 text-sm text-gray-500">Check back for festivals, airshows, and more.</p>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-4 mb-10">
          {upcoming.map((event) => {
            const isLive = now >= new Date(event.startDate) && now <= new Date(event.endDate)
            return (
              <div
                key={event.id}
                className={`rounded-2xl border p-5 ${isLive ? 'border-2 shadow-md' : 'border-gray-100 bg-white shadow-sm'}`}
                style={isLive ? { borderColor: vendor.primaryColor, backgroundColor: vendor.primaryColor + '06' } : {}}
              >
                {isLive && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: vendor.primaryColor }} />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: vendor.primaryColor }} />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: vendor.primaryColor }}>
                      At This Event Now
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Date badge */}
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gray-100">
                    <span className="text-[10px] font-bold uppercase text-gray-500">
                      {new Date(event.startDate).toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                    <span className="text-xl font-extrabold text-gray-900 leading-none">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-extrabold text-gray-900">{event.name}</h3>

                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatDateRange(event.startDate, event.endDate, event.isMultiDay)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatTime(event.startDate)} – {formatTime(event.endDate)}</span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{event.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {event.vehicle && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                          🚐 {event.vehicle.name}
                        </span>
                      )}
                      {event.preOrderEnabled && vendor.preOrderingEnabled && (
                        <Link
                          href="/order"
                          className="flex h-9 items-center rounded-full px-4 text-sm font-bold text-white active:scale-95"
                          style={{ backgroundColor: vendor.primaryColor }}
                        >
                          Pre-Order
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {event.imageUrl && (
                  <img src={event.imageUrl} alt={event.name} className="mt-4 w-full rounded-xl object-cover max-h-48" loading="lazy" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-bold text-gray-400">Past Events</h2>
          <div className="space-y-2 opacity-60">
            {past.slice(0, 5).map((event) => (
              <div key={event.id} className="rounded-xl border border-gray-100 bg-white p-4">
                <h3 className="font-bold text-gray-700">{event.name}</h3>
                <p className="text-sm text-gray-400">{event.location} · {formatDateRange(event.startDate, event.endDate, event.isMultiDay)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bottom spacer */}
      <div className="h-20 md:h-0" />
    </div>
  )
}
