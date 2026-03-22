import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/vendor/[slug]/orders/[id]/pay
// Mark an order as paid (for POS integration or vendor admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { slug: params.slug },
    })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })
    if (!order || order.vendorId !== vendor.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.paidAt) {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    const body = await request.json()
    const { paymentMethod } = body // 'cash' or 'card'

    if (!paymentMethod || !['cash', 'card'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'paymentMethod must be "cash" or "card"' },
        { status: 400 }
      )
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'collected',
        paymentMethod,
        paidAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error marking order as paid:', error)
    return NextResponse.json({ error: 'Failed to mark order as paid' }, { status: 500 })
  }
}
