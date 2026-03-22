import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { MapPin, Clock, ArrowRight, ExternalLink } from 'lucide-react'
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
        where: { endedAt: null },
        include: { location: true },
        take: 1,
      },
      schedules: {
        include: { location: true },
        orderBy: { dayOfWeek: 'asc' },
      },
      locations: {
        include: {
          schedules: {
            orderBy: { dayOfWeek: 'asc' },
          },
          liveSessions: {
            where: { endedAt: null },
            take: 1,
          },
        },
      },
    },
  })

  if (!vendor) return null

  const activeSession = vendor.liveSessions[0] || null
  const today = new Date().getDay()

  const todaySchedules = vendor.schedules.filter((s) => s.dayOfWeek === today)

  // Find next scheduled appearance
  const nextSchedule = vendor.schedules.find((s) => s.dayOfWeek > today)
    || vendor.schedules[0]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {vendor.banner ? (
          <div className="relative h-48 sm:h-64 md:h-80">
            <img
              src={vendor.banner}
              alt={vendor.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : (
          <div
            className="relative h-48 sm:h-64 md:h-80"
            style={{
              background: `linear-gradient(135deg, ${vendor.primaryColor}, ${vendor.secondaryColor})`,
            }}
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {vendor.name}
            </h1>
            {vendor.cuisineType && (
              <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                {vendor.cuisineType}
              </span>
            )}
            {vendor.description && (
              <p className="mt-2 max-w-xl text-sm text-white/90 sm:text-base">
                {vendor.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Map */}
      <VendorMapSection vendor={vendor} />

      {/* Live status banner */}
      {activeSession && (
        <section className="border-b border-green-200 bg-green-50 px-4 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
              </span>
              <div>
                <p className="font-semibold text-green-800">
                  We&apos;re serving at {activeSession.location.name}!
                </p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps?q=${activeSession.lat},${activeSession.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-900"
            >
              <MapPin className="h-4 w-4" />
              Map
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Menu Preview */}
        {vendor.menuItems.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Our Menu</h2>
              <Link
                href="/menu"
                className="flex items-center gap-1 text-sm font-semibold transition-colors"
                style={{ color: vendor.primaryColor }}
              >
                View Full Menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vendor.menuItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  <div
                    className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg"
                    style={{ backgroundColor: vendor.secondaryColor + '20' }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-xl font-bold text-white/50"
                        style={{ backgroundColor: vendor.secondaryColor }}
                      >
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                      {item.description && (
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: vendor.primaryColor }}
                    >
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Today's Schedule */}
        {todaySchedules.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
              Today&apos;s Schedule
            </h2>
            <div className="space-y-2">
              {todaySchedules.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{s.location.name}</p>
                    <p className="text-sm text-gray-500">
                      {s.startTime} - {s.endTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Next Appearance */}
        {nextSchedule && todaySchedules.length === 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
              Next Appearance
            </h2>
            <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <MapPin className="h-5 w-5" style={{ color: vendor.primaryColor }} />
              <div>
                <p className="font-medium text-gray-900">
                  {DAY_NAMES[nextSchedule.dayOfWeek]} at {nextSchedule.location.name}
                </p>
                <p className="text-sm text-gray-500">
                  {nextSchedule.startTime} - {nextSchedule.endTime}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Follow & Social */}
        <VendorHomeClient />
      </div>
    </div>
  )
}
