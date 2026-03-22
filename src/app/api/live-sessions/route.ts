import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sessions = await prisma.liveSession.findMany({
      where: { endedAt: null, cancelled: false },
      include: {
        vendor: {
          select: {
            name: true,
            slug: true,
            cuisineType: true,
            primaryColor: true,
          },
        },
        location: {
          select: { name: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching live sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch live sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { locationId } = body

    if (!locationId) {
      return NextResponse.json({ error: 'locationId is required' }, { status: 400 })
    }

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    })
    if (!location || location.vendorId !== user.id) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // End any existing live sessions
    await prisma.liveSession.updateMany({
      where: { vendorId: user.id, endedAt: null },
      data: { endedAt: new Date() },
    })

    const liveSession = await prisma.liveSession.create({
      data: {
        vendorId: user.id,
        locationId,
        lat: location.lat,
        lng: location.lng,
      },
      include: {
        location: true,
      },
    })

    return NextResponse.json(liveSession, { status: 201 })
  } catch (error) {
    console.error('Error creating live session:', error)
    return NextResponse.json({ error: 'Failed to go live' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'vendor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, delayMinutes, delayMessage, cancelReason, sessionId } = body

    const liveSession = await prisma.liveSession.findFirst({
      where: sessionId
        ? { id: sessionId, vendorId: user.id }
        : { vendorId: user.id, endedAt: null },
    })

    if (!liveSession) {
      return NextResponse.json({ error: 'No active session found' }, { status: 404 })
    }

    if (action === 'delay') {
      // Mark as delayed
      const updated = await prisma.liveSession.update({
        where: { id: liveSession.id },
        data: {
          delayMinutes: delayMinutes || 0,
          delayMessage: delayMessage || null,
        },
      })

      // Shift time slots for pre-orders
      if (delayMinutes) {
        const activeOrders = await prisma.order.findMany({
          where: {
            liveSessionId: liveSession.id,
            status: { in: ['confirmed', 'preparing'] },
            timeSlotStart: { not: null },
          },
        })

        for (const order of activeOrders) {
          if (order.timeSlotStart && order.timeSlotEnd) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                timeSlotStart: new Date(order.timeSlotStart.getTime() + delayMinutes * 60000),
                timeSlotEnd: new Date(order.timeSlotEnd.getTime() + delayMinutes * 60000),
              },
            })
          }
        }
      }

      return NextResponse.json(updated)
    }

    if (action === 'cancel') {
      // Cancel the session
      const updated = await prisma.liveSession.update({
        where: { id: liveSession.id },
        data: {
          cancelled: true,
          cancelReason: cancelReason || null,
          cancelledAt: new Date(),
          endedAt: new Date(),
        },
      })

      // Cancel all pre-orders for this session
      await prisma.order.updateMany({
        where: {
          liveSessionId: liveSession.id,
          status: { in: ['pending', 'confirmed'] },
        },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelReason: 'Session cancelled by vendor',
        },
      })

      return NextResponse.json(updated)
    }

    if (action === 'end') {
      const updated = await prisma.liveSession.update({
        where: { id: liveSession.id },
        data: { endedAt: new Date() },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating live session:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}
