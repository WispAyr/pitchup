import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Public GET — returns active deals for this vendor
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = new URL(req.url)
  const adminMode = url.searchParams.get('admin') === 'true'

  if (adminMode) {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).vendorSlug !== params.slug)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const deals = await prisma.deal.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(deals)
  }

  // Public: only active, time-filtered
  const now = new Date()
  const deals = await prisma.deal.findMany({
    where: {
      vendorId: vendor.id,
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
  })

  // Filter by time-of-day and day-of-week
  const currentDay = now.getDay()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const filtered = deals.filter(deal => {
    if (deal.endDate && deal.endDate < now) return false
    if (deal.validDays) {
      const days = JSON.parse(deal.validDays) as number[]
      if (days.length > 0 && !days.includes(currentDay)) return false
    }
    if (deal.validFrom && currentTime < deal.validFrom) return false
    if (deal.validTo && currentTime > deal.validTo) return false
    return true
  })

  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const deal = await prisma.deal.create({
    data: {
      vendorId: vendor.id,
      title: body.title,
      description: body.description,
      type: body.type,
      price: body.price ? parseFloat(body.price) : null,
      savings: body.savings || null,
      imageUrl: body.imageUrl || null,
      items: body.items ? JSON.stringify(body.items) : null,
      validDays: body.validDays ? JSON.stringify(body.validDays) : null,
      validFrom: body.validFrom || null,
      validTo: body.validTo || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isFeatured: body.isFeatured ?? false,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(deal, { status: 201 })
}
