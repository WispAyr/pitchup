import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const routes = await prisma.route.findMany({
    where: { vendorId: vendor.id },
    include: {
      vehicle: true,
      stops: {
        include: { location: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(routes)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { name, dayOfWeek, vehicleId, isActive, stops } = body

  const route = await prisma.route.create({
    data: {
      vendorId: vendor.id,
      name,
      dayOfWeek,
      vehicleId: vehicleId || null,
      isActive: isActive !== false,
      stops: {
        create: (stops || []).map((s: any, i: number) => ({
          locationId: s.locationId,
          startTime: s.startTime,
          endTime: s.endTime,
          sortOrder: i,
        })),
      },
    },
    include: {
      vehicle: true,
      stops: { include: { location: true }, orderBy: { sortOrder: 'asc' } },
    },
  })

  return NextResponse.json(route)
}
