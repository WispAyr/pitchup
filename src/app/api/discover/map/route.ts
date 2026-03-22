import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        mapVisible: true,
        locations: { some: {} },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        primaryColor: true,
        secondaryColor: true,
        cuisineType: true,
        logo: true,
        locations: {
          select: {
            id: true,
            name: true,
            address: true,
            lat: true,
            lng: true,
            isRegular: true,
            schedules: {
              select: {
                id: true,
                dayOfWeek: true,
                startTime: true,
                endTime: true,
              },
              orderBy: { dayOfWeek: 'asc' },
            },
            liveSessions: {
              where: { endedAt: null },
              select: {
                id: true,
                startedAt: true,
              },
              take: 1,
            },
          },
        },
      },
    })

    // Transform liveSessions array to single liveSession
    const result = vendors.map((v) => ({
      ...v,
      locations: v.locations.map((loc) => ({
        ...loc,
        liveSession: loc.liveSessions[0] || null,
        liveSessions: undefined,
      })),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching discover map data:', error)
    return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 })
  }
}
