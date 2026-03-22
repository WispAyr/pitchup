import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { MapPin, Clock, ArrowRight, Calendar, ChevronRight, Star } from 'lucide-react'
import { VendorHomeClient } from './page-client'
import { VendorMapSection } from './vendor-map-section'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function VendorHomePage({
  params,
}: {
  params: { slug: string }
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      menuItems: {
        where: { available: true },
        orderBy: { sortOrder: 'asc' },
        take: 6,
        include: { category: true },
      },
      liveSessions: {
        where: { endedAt: null, cancelled: false },
        include: { location: true, vehicle: true },
      },
      schedules: {
        include: { location: true },
        orderBy: { dayOfWeek: 'asc' },
      },
      locations: {
        include: {
          schedules: { orderBy: { dayOfWeek: 'asc' } },
          liveSessions: { where: { endedAt: null, cancelled: false }, include: { vehicle: true }, take: 5 },
        },
      },
      events: {
        where: { status: { in: ['upcoming', 'live'] }, endDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 3,
        include: { vehicle: true },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { customer: { select: { name: true } } },
      },
      _count: { select: { reviews: true, vehicles: true } },
    },
  })

  if (!vendor) return null

  const activeSessions = vendor.liveSessions
  const today = new Date().getDay()
  const todaySchedules = vendor.schedules.filter((s) => s.dayOfWeek === today)
  const nextSchedule = vendor.schedules.find((s) => s.dayOfWeek > today) || vendor.schedules[0]
  const avgRating = vendor.reviews.length > 0
    ? await prisma.review.aggregate({ where: { vendorId: vendor.id }, _avg: { rating: true } })
    : null

  const now = new Date()
  const todayEvents = vendor.events.filter(e => {
    const start = new Date(e.startDate)
    const end = new Date(e.endDate)
    return now >= start && now <= end
  })

  return (
    <div>
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden">
        {vendor.banner ? (
          <div className="relative h-48 sm:h-64 lg:h-80">
            <img src={vendor.banner} alt={vendor.name} className="h-full w-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        ) : (
          <div
            className="relative h-48 sm:h-64 lg:h-80"
            style={{ background: `linear-gradient(135deg, ${vendor.primaryColor}, ${vendor.secondaryColor})` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.1),_transparent_60%)]" />
          </div>
        )}

        {/* Hero content — overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl drop-shadow-sm">
              {vendor.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {vendor.cuisineType && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {vendor.cuisineType}
                </span>
              )}
              {avgRating?._avg?.rating && (
                <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {avgRating._avg.rating.toFixed(1)} · {vendor._count.reviews} review{vendor._count.reviews !== 1 ? 's' : ''}
                </span>
              )}
              {vendor._count.vehicles > 0 && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  🚐 {vendor._count.vehicles} van{vendor._count.vehicles !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {vendor.description && (
              <p className="mt-2 max-w-xl text-sm text-white/90 line-clamp-2">{vendor.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Live vans status ═══ */}
      {activeSessions.length > 0 && (
        <section className="border-b border-green-200 bg-green-50 px-4 py-3">
          <div className="mx-auto max-w-5xl space-y-2">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>
                  <p className="text-sm font-bold text-green-800">
                    {session.vehicle?.name
                      ? `🚐 ${session.vehicle.name} at ${session.location.name}`
                      : `Serving at ${session.location.name}`}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${session.lat},${session.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 items-center gap-1 rounded-full bg-green-100 px-3 text-xs font-bold text-green-700 active:bg-green-200"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Map
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ Quick action bar — sticky on mobile ═══ */}
      <section className="sticky top-[52px] z-20 border-b border-gray-100 bg-white/95 backdrop-blur-sm px-4 py-2.5 md:hidden">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <Link
            href="/menu"
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            🍔 Menu
          </Link>
          <Link href="/schedule" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700">
            📅 Schedule
          </Link>
          {vendor.preOrderingEnabled && (
            <Link href="/order" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700">
              🛒 Pre-Order
            </Link>
          )}
          {vendor.events.length > 0 && (
            <Link href="/events" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700">
              🎪 Events
            </Link>
          )}
        </div>
      </section>

      {/* ═══ Map ═══ */}
      <VendorMapSection vendor={vendor} />

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-10">

        {/* ═══ Events happening today ═══ */}
        {todayEvents.length > 0 && (
          <section>
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl p-4 text-white"
                style={{ backgroundColor: vendor.primaryColor }}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-80">
                  <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-white" /></span>
                  At Event Now
                </div>
                <h3 className="mt-1 text-lg font-extrabold">{event.name}</h3>
                <p className="mt-0.5 text-sm opacity-80">📍 {event.location}</p>
                {event.preOrderEnabled && vendor.preOrderingEnabled && (
                  <Link href="/order" className="mt-3 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-bold active:scale-95" style={{ color: vendor.primaryColor }}>
                    Pre-Order for This Event
                  </Link>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ═══ Menu Preview ═══ */}
        {vendor.menuItems.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-900">Our Menu</h2>
              <Link href="/menu" className="flex items-center gap-1 text-sm font-bold" style={{ color: vendor.primaryColor }}>
                Full Menu <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 lg:grid-cols-3">
              {vendor.menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  <div
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-xl"
                    style={{ backgroundColor: vendor.secondaryColor + '20' }}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white/50" style={{ backgroundColor: vendor.secondaryColor }}>
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <p className="text-base font-extrabold" style={{ color: vendor.primaryColor }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ Today's Schedule ═══ */}
        {todaySchedules.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-900">Today</h2>
              <Link href="/schedule" className="flex items-center gap-1 text-sm font-bold" style={{ color: vendor.primaryColor }}>
                Full Schedule <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {todaySchedules.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: vendor.primaryColor + '15' }}>
                    <Clock className="h-5 w-5" style={{ color: vendor.primaryColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900">{s.location.name}</p>
                    <p className="text-sm text-gray-500">{s.startTime} – {s.endTime}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ Next appearance (if nothing today) ═══ */}
        {todaySchedules.length === 0 && nextSchedule && (
          <section>
            <h2 className="mb-4 text-xl font-extrabold text-gray-900">Next Appearance</h2>
            <Link href="/schedule" className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: vendor.primaryColor + '15' }}>
                <MapPin className="h-5 w-5" style={{ color: vendor.primaryColor }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">
                  {DAY_NAMES[nextSchedule.dayOfWeek]} at {nextSchedule.location.name}
                </p>
                <p className="text-sm text-gray-500">{nextSchedule.startTime} – {nextSchedule.endTime}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </Link>
          </section>
        )}

        {/* ═══ Upcoming Events ═══ */}
        {vendor.events.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-gray-900">📅 Upcoming Events</h2>
              <Link href="/events" className="flex items-center gap-1 text-sm font-bold" style={{ color: vendor.primaryColor }}>
                All Events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {vendor.events.map((event) => {
                const start = new Date(event.startDate)
                const end = new Date(event.endDate)
                const isToday = now >= start && now <= end
                return (
                  <div
                    key={event.id}
                    className={`rounded-2xl border p-4 ${isToday ? 'border-2 shadow-md' : 'border-gray-100 bg-white shadow-sm'}`}
                    style={isToday ? { borderColor: vendor.primaryColor, backgroundColor: vendor.primaryColor + '08' } : {}}
                  >
                    {isToday && (
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: vendor.primaryColor }} /><span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: vendor.primaryColor }} /></span>
                        <span className="text-xs font-bold" style={{ color: vendor.primaryColor }}>AT EVENT NOW</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gray-100 text-center">
                        <span className="text-xs font-bold text-gray-500">{start.toLocaleDateString('en-GB', { month: 'short' })}</span>
                        <span className="text-lg font-extrabold text-gray-900 leading-none">{start.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900">{event.name}</h3>
                        <p className="text-sm text-gray-500">📍 {event.location}</p>
                        {event.isMultiDay && (
                          <p className="text-xs text-gray-400">
                            {start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} – {end.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                      {event.vehicle && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                          🚐 {event.vehicle.name}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ═══ Follow & Social ═══ */}
        <VendorHomeClient />
      </div>

      {/* ═══ Sticky bottom CTA — mobile only ═══ */}
      {vendor.preOrderingEnabled && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 pb-safe backdrop-blur-md md:hidden">
          <Link
            href="/order"
            className="flex h-12 w-full items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-lg active:scale-[0.98]"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            🛒 Pre-Order Now
          </Link>
        </div>
      )}
    </div>
  )
}
