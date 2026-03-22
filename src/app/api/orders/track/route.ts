import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const vendorId = searchParams.get('vendorId')

  if (!code) {
    return NextResponse.json({ error: 'Pickup code is required' }, { status: 400 })
  }

  const where: any = { pickupCode: code.toUpperCase() }
  if (vendorId) where.vendorId = vendorId

  const order = await prisma.order.findFirst({
    where,
    select: {
      id: true,
      pickupCode: true,
      status: true,
      customerName: true,
      items: true,
      total: true,
      timeSlotStart: true,
      timeSlotEnd: true,
      createdAt: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json(order)
}
