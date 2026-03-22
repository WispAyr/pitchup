import { prisma } from '@/lib/prisma'
import { SchedulePageClient } from './page-client'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default async function SchedulePage({
  params,
}: {
  params: { slug: string }
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      schedules: {
        include: { location: true },
        orderBy: { dayOfWeek: 'asc' },
      },
      routes: {
        where: { isActive: true },
        include: {
          vehicle: true,
          stops: {
            include: { location: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { name: 'asc' }],
      },
      liveSessions: {
        where: { endedAt: null },
        include: { location: true },
        take: 1,
      },
    },
  })

  if (!vendor) return null

  const activeSession = vendor.liveSessions[0] || null

  const schedulesByDay = DAY_NAMES.map((dayName, index) => ({
    day: dayName,
    dayIndex: index,
    entries: vendor.schedules
      .filter((s) => s.dayOfWeek === index)
      .map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        locationName: s.location.name,
        lat: s.location.lat,
        lng: s.location.lng,
      })),
  }))

  // Collect all unique locations from schedules + routes
  const locMap = new Map<string, { id: string; name: string; lat: number; lng: number }>()
  vendor.schedules.forEach((s) => locMap.set(s.location.id, { id: s.location.id, name: s.location.name, lat: s.location.lat, lng: s.location.lng }))
  vendor.routes.forEach((r) => r.stops.forEach((s) => locMap.set(s.location.id, { id: s.location.id, name: s.location.name, lat: s.location.lat, lng: s.location.lng })))
  const locations = Array.from(locMap.values())

  const routesByDay = vendor.routes.map((r) => ({
    id: r.id,
    name: r.name,
    dayOfWeek: r.dayOfWeek,
    vehicleName: r.vehicle?.name || null,
    stops: r.stops.map((s) => ({
      id: s.id,
      locationName: s.location.name,
      startTime: s.startTime,
      endTime: s.endTime,
      lat: s.location.lat,
      lng: s.location.lng,
    })),
  }))

  return (
    <SchedulePageClient
      schedulesByDay={schedulesByDay}
      locations={locations}
      routes={routesByDay}
      activeSession={
        activeSession
          ? {
              locationName: activeSession.location.name,
              lat: activeSession.lat,
              lng: activeSession.lng,
            }
          : null
      }
    />
  )
}
