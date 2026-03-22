import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/menu/pricing?vendorId=xxx — get all pricing rules
// GET /api/menu/pricing?vendorId=xxx&time=17:00&day=2 — get effective prices at a time
export async function GET(req: NextRequest) {
  const vendorId = req.nextUrl.searchParams.get('vendorId')
  if (!vendorId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

  const time = req.nextUrl.searchParams.get('time')
  const day = req.nextUrl.searchParams.get('day')

  const items = await prisma.menuItem.findMany({
    where: { vendorId },
    include: {
      pricingRules: { where: { isActive: true } },
      category: true,
    },
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
  })

  // If time & day provided, resolve effective prices
  if (time && day) {
    const dayNum = parseInt(day)
    const result = items.map(item => {
      let effectivePrice = item.price
      let priceLabel: string | null = null

      for (const rule of item.pricingRules) {
        if (!rule.daysOfWeek.includes(dayNum)) continue
        if (time >= rule.startTime && time < rule.endTime) {
          effectivePrice = rule.price
          priceLabel = rule.label
          break
        }
      }

      return {
        ...item,
        effectivePrice,
        priceLabel,
        pricingRules: undefined, // strip from response
      }
    })
    return NextResponse.json(result)
  }

  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { menuItemId, label, price, startTime, endTime, daysOfWeek } = body

  const rule = await prisma.menuPricing.create({
    data: {
      menuItemId,
      label,
      price,
      startTime,
      endTime,
      daysOfWeek,
      isActive: true,
    },
  })

  return NextResponse.json(rule)
}
