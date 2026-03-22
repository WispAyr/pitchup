import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const body = await req.json()
  const { name, dayOfWeek, vehicleId, isActive, stops } = body

  // Update route fields
  const route = await prisma.route.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(dayOfWeek !== undefined ? { dayOfWeek } : {}),
      ...(vehicleId !== undefined ? { vehicleId: vehicleId || null } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  })

  // If stops provided, replace them
  if (stops) {
    await prisma.routeStop.deleteMany({ where: { routeId: params.id } })
    await prisma.routeStop.createMany({
      data: stops.map((s: any, i: number) => ({
        routeId: params.id,
        locationId: s.locationId,
        startTime: s.startTime,
        endTime: s.endTime,
        sortOrder: i,
      })),
    })
  }

  const updated = await prisma.route.findUnique({
    where: { id: params.id },
    include: {
      vehicle: true,
      stops: { include: { location: true }, orderBy: { sortOrder: 'asc' } },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  await prisma.route.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
