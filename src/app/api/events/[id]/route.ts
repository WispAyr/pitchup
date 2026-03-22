import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/events/[id]
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        vendor: {
          select: { id: true, name: true, slug: true, primaryColor: true, secondaryColor: true, cuisineType: true, logo: true },
        },
        vehicle: { select: { id: true, name: true } },
      },
    })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PATCH /api/events/[id]
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any

    const event = await prisma.event.findUnique({ where: { id: params.id } })
    if (!event || event.vendorId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: new Date(body.endDate) }),
        ...(body.isMultiDay !== undefined && { isMultiDay: body.isMultiDay }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.preOrderEnabled !== undefined && { preOrderEnabled: body.preOrderEnabled }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.vehicleId !== undefined && { vehicleId: body.vehicleId || null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/events/[id]
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const user = session.user as any

    const event = await prisma.event.findUnique({ where: { id: params.id } })
    if (!event || event.vendorId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.event.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
