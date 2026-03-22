import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { slug: params.slug },
      include: {
        liveSessions: {
          where: { endedAt: null, cancelled: false },
          include: { location: true },
          take: 5,
        },
        schedules: {
          include: { location: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const now = new Date()
    const today = now.getDay()

    // Active live sessions
    const liveSessions = vendor.liveSessions.map((s) => {
      // Find the matching schedule for end time estimation
      const matchingSchedule = vendor.schedules.find(
        (sch) => sch.locationId === s.locationId && sch.dayOfWeek === today
      )

      let estimatedEnd: Date | null = null
      if (matchingSchedule) {
        const [eh, em] = matchingSchedule.endTime.split(':').map(Number)
        estimatedEnd = new Date(now)
        estimatedEnd.setHours(eh, em, 0, 0)
      }

      return {
        type: 'live' as const,
        sessionId: s.id,
        locationId: s.locationId,
        locationName: s.location.name,
        startedAt: s.startedAt.toISOString(),
        estimatedEnd: estimatedEnd?.toISOString() || null,
        delayMinutes: s.delayMinutes,
        delayMessage: s.delayMessage,
      }
    })

    // Upcoming scheduled sessions (next 7 days)
    const upcomingSessions: {
      type: 'scheduled'
      scheduleId: string
      locationId: string
      locationName: string
      dayOfWeek: number
      dayName: string
      date: string
      startTime: string
      endTime: string
      startDateTime: string
      endDateTime: string
    }[] = []

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + dayOffset)
      const targetDay = targetDate.getDay()

      const daySchedules = vendor.schedules.filter((s) => s.dayOfWeek === targetDay)

      for (const schedule of daySchedules) {
        const [sh, sm] = schedule.startTime.split(':').map(Number)
        const [eh, em] = schedule.endTime.split(':').map(Number)

        const startDT = new Date(targetDate)
        startDT.setHours(sh, sm, 0, 0)

        const endDT = new Date(targetDate)
        endDT.setHours(eh, em, 0, 0)

        // Skip if already passed
        if (endDT <= now) continue

        // Skip if there's already a live session at this location
        const hasLive = liveSessions.some((ls) => ls.locationId === schedule.locationId)
        if (hasLive && dayOffset === 0) continue

        upcomingSessions.push({
          type: 'scheduled',
          scheduleId: schedule.id,
          locationId: schedule.locationId,
          locationName: schedule.location.name,
          dayOfWeek: targetDay,
          dayName: DAY_NAMES[targetDay],
          date: targetDate.toISOString().split('T')[0],
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          startDateTime: startDT.toISOString(),
          endDateTime: endDT.toISOString(),
        })
      }
    }

    return NextResponse.json({
      vendorId: vendor.id,
      vendorName: vendor.name,
      defaultPrepTime: vendor.defaultPrepTime,
      slotIntervalMinutes: vendor.slotIntervalMinutes,
      maxOrdersPerSlot: vendor.maxOrdersPerSlot,
      liveSessions,
      upcomingSessions,
    })
  } catch (error) {
    console.error('Error fetching vendor sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}
