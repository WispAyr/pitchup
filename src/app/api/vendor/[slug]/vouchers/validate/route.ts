import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { code, orderTotal, customerId } = await req.json()
  if (!code) return NextResponse.json({ error: 'Code is required' }, { status: 400 })

  const voucher = await prisma.voucher.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { _count: { select: { redemptions: true } } },
  })

  if (!voucher || voucher.vendorId !== vendor.id)
    return NextResponse.json({ error: 'Invalid voucher code' }, { status: 404 })

  if (!voucher.isActive)
    return NextResponse.json({ error: 'This voucher is no longer active' }, { status: 400 })

  const now = new Date()
  if (voucher.validFrom > now)
    return NextResponse.json({ error: 'This voucher is not yet valid' }, { status: 400 })

  if (voucher.expiresAt && voucher.expiresAt < now)
    return NextResponse.json({ error: 'This voucher has expired' }, { status: 400 })

  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses)
    return NextResponse.json({ error: 'This voucher has reached its usage limit' }, { status: 400 })

  // Per-customer limit
  if (voucher.maxUsesPerCustomer && customerId) {
    const customerUses = await prisma.voucherRedemption.count({
      where: { voucherId: voucher.id, customerId },
    })
    if (customerUses >= voucher.maxUsesPerCustomer)
      return NextResponse.json({ error: 'You have already used this voucher' }, { status: 400 })
  }

  // Min order check
  if (voucher.minOrder && orderTotal && orderTotal < voucher.minOrder)
    return NextResponse.json({ error: `Minimum order of £${(voucher.minOrder / 100).toFixed(2)} required` }, { status: 400 })

  // Calculate discount
  let discount = 0
  let discountDescription = ''

  switch (voucher.type) {
    case 'percentage':
      discount = orderTotal ? Math.round(orderTotal * (voucher.value! / 100)) : 0
      discountDescription = `${voucher.value}% off`
      break
    case 'fixed':
      discount = (voucher.value || 0) * 100 // value stored as pounds, convert to pence
      discountDescription = `£${voucher.value?.toFixed(2)} off`
      break
    case 'freeItem':
      discountDescription = voucher.description
      break
    case 'buyOneGetOne':
      discountDescription = 'Buy one get one free'
      break
    case 'giftCard':
      const balance = voucher.giftCardBalance || 0
      discount = orderTotal ? Math.min(balance, orderTotal) : 0
      discountDescription = `Gift card (£${(balance / 100).toFixed(2)} remaining)`
      break
  }

  return NextResponse.json({
    valid: true,
    voucher: {
      id: voucher.id,
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      description: voucher.description,
      freeItemId: voucher.freeItemId,
    },
    discount,
    discountDescription,
  })
}
