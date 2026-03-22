import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getVendor(slug: string, session: any) {
  if (!session?.user || (session.user as any).vendorSlug !== slug) return null
  return prisma.vendor.findUnique({ where: { slug }, select: { id: true } })
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const vendor = await getVendor(params.slug, session)
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const locationId = req.nextUrl.searchParams.get('locationId')
  if (!locationId) return NextResponse.json({ error: 'locationId required' }, { status: 400 })

  const entries = await prisma.locationMenu.findMany({
    where: { locationId },
    include: { menuItem: { include: { category: true } } },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const vendor = await getVendor(params.slug, session)
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { locationId: string; items: { menuItemId: string; available: boolean; priceOverride?: number | null }[] }

  // Upsert all items
  const results = await Promise.all(
    body.items.map((item) =>
      prisma.locationMenu.upsert({
        where: { locationId_menuItemId: { locationId: body.locationId, menuItemId: item.menuItemId } },
        create: {
          locationId: body.locationId,
          menuItemId: item.menuItemId,
          available: item.available,
          priceOverride: item.priceOverride ?? null,
        },
        update: {
          available: item.available,
          priceOverride: item.priceOverride ?? null,
        },
      })
    )
  )
  return NextResponse.json(results)
}
