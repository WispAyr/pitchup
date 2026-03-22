import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'collected',
  'cancelled',
  'no-show',
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        vendor: { select: { name: true, slug: true } },
        customer: { select: { name: true, email: true } },
        liveSession: { select: { id: true, location: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const user = session.user as any
    if (user.role !== 'vendor' || user.id !== order.vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status, paymentMethod, cancelReason } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: any = { status }

    if (status === 'cancelled') {
      updateData.cancelledAt = new Date()
      updateData.cancelReason = cancelReason || null
    }

    if (status === 'no-show') {
      updateData.noShowAt = new Date()
    }

    if (status === 'collected' && paymentMethod) {
      updateData.paymentMethod = paymentMethod
      updateData.paidAt = new Date()
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        vendor: { select: { name: true, slug: true } },
        customer: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
