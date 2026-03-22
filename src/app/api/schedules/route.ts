import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const schedules = await prisma.schedule.findMany({
      where: { vendorId },
      include: { location: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vendorId, locationId, dayOfWeek, startTime, endTime, recurring } = body

    if (
      !vendorId ||
      !locationId ||
      dayOfWeek === undefined ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        {
          error:
            'vendorId, locationId, dayOfWeek, startTime, and endTime are required',
        },
        { status: 400 }
      )
    }

    const user = session.user as any
    if (user.role !== 'vendor' || user.id !== vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)' },
        { status: 400 }
      )
    }

    const schedule = await prisma.schedule.create({
      data: {
        vendorId,
        locationId,
        dayOfWeek,
        startTime,
        endTime,
        recurring: recurring ?? true,
      },
      include: { location: true },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}
