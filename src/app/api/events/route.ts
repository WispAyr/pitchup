import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/events — list all upcoming events (platform-wide) or filter by vendorId
export async function GET(request: NextRequest) {
  try {
    const vendorId = request.nextUrl.searchParams.get('vendorId')
    const status = request.nextUrl.searchParams.get('status')

    const events = await prisma.event.findMany({
      where: {
        ...(vendorId ? { vendorId } : {}),
        ...(status ? { status } : { status: { in: ['upcoming', 'live'] } }),
        endDate: { gte: new Date() },
      },
      include: {
        vendor: {
          select: { id: true, name: true, slug: true, primaryColor: true, secondaryColor: true, cuisineType: true, logo: true },
        },
        vehicle: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/events — create event (vendor only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any
    if (user.role !== 'vendor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { name, description, location, latitude, longitude, startDate, endDate, isMultiDay, vehicleId, preOrderEnabled, imageUrl } = body

    if (!name || !location || !startDate || !endDate) {
      return NextResponse.json({ error: 'name, location, startDate, endDate are required' }, { status: 400 })
    }

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
      if (!vehicle || vehicle.vendorId !== user.id) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
      }
    }

    const event = await prisma.event.create({
      data: {
        vendorId: user.id,
        vehicleId: vehicleId || null,
        name,
        description: description || null,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isMultiDay: isMultiDay || false,
        preOrderEnabled: preOrderEnabled !== false,
        imageUrl: imageUrl || null,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
