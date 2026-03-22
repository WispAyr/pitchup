import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const schedules = await prisma.schedule.findMany({
    where: { vendorId: vendor.id },
    include: { location: true },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })
  return NextResponse.json(schedules)
}
