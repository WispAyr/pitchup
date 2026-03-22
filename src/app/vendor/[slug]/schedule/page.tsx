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

  const locations = vendor.schedules
    .map((s) => ({
      id: s.location.id,
      name: s.location.name,
      lat: s.location.lat,
      lng: s.location.lng,
    }))
    .filter((loc, i, arr) => arr.findIndex((l) => l.id === loc.id) === i)

  return (
    <SchedulePageClient
      schedulesByDay={schedulesByDay}
      locations={locations}
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
