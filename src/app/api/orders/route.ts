import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function generatePickupCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `P-${num}`
}

async function getUniquePickupCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generatePickupCode()
    const existing = await prisma.order.findUnique({ where: { pickupCode: code } })
    if (!existing) return code
  }
  // Fallback with more digits
  return `P-${Math.floor(10000 + Math.random() * 90000)}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const customerId = searchParams.get('customerId')

    const user = session.user as any

    if (vendorId && user.role === 'vendor' && user.id !== vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (customerId && user.role === 'customer' && user.id !== customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const where: any = {}
    if (vendorId) where.vendorId = vendorId
    if (customerId) where.customerId = customerId

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: { select: { name: true, slug: true } },
        customer: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      vendorId,
      customerId,
      items,
      collectionTime,
      customerName,
      customerPhone,
      customerEmail,
      liveSessionId,
    } = body

    if (!vendorId || !items || !customerName) {
      return NextResponse.json(
        { error: 'vendorId, items, and customerName are required' },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array' },
        { status: 400 }
      )
    }

    // Get vendor for prep time config
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )
    const total = subtotal

    // Generate pickup code
    const pickupCode = await getUniquePickupCode()

    // Calculate time slot
    let timeSlotStart: Date | null = null
    let timeSlotEnd: Date | null = null

    if (collectionTime) {
      const requestedTime = new Date(collectionTime)
      // Calculate total prep time for this order
      const totalItems = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0)
      const prepMinutes = totalItems * vendor.defaultPrepTime

      timeSlotStart = new Date(requestedTime)
      timeSlotEnd = new Date(requestedTime.getTime() + vendor.slotIntervalMinutes * 60000)
    }

    const order = await prisma.order.create({
      data: {
        vendorId,
        customerId: customerId ?? null,
        items,
        subtotal,
        total,
        status: 'confirmed',
        collectionTime: collectionTime ? new Date(collectionTime) : null,
        customerName,
        customerPhone: customerPhone ?? null,
        customerEmail: customerEmail ?? null,
        liveSessionId: liveSessionId ?? null,
        pickupCode,
        timeSlotStart,
        timeSlotEnd,
      },
      include: {
        vendor: { select: { name: true, slug: true } },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
