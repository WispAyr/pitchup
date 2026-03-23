import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCoupon } from '@/lib/stripe'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, type, value, duration, durationMonths } = await request.json()

    if (!name || !type || !value) {
      return NextResponse.json({ error: 'name, type, and value required' }, { status: 400 })
    }

    let stripeCouponId: string | null = null
    try {
      const coupon = await createCoupon({ name, type, value, duration, durationMonths })
      stripeCouponId = coupon.id
    } catch (e) {
      console.error('Stripe coupon creation failed:', e)
    }

    const discount = await prisma.vendorDiscount.create({
      data: {
        vendorId: params.id,
        name,
        type,
        value,
        duration: duration || 'once',
        durationMonths,
        stripeCouponId,
        createdBy: 'admin',
      },
    })

    return NextResponse.json({ discount })
  } catch (error) {
    console.error('Discount error:', error)
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 })
  }
}
