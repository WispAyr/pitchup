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

  const vehicleId = req.nextUrl.searchParams.get('vehicleId')
  const logs = await prisma.maintenanceLog.findMany({
    where: { vendorId: vendor.id, ...(vehicleId ? { vehicleId } : {}) },
    include: { vehicle: { select: { name: true, registration: true } } },
    orderBy: { performedAt: 'desc' },
  })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const vendor = await getVendor(params.slug, session)
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const log = await prisma.maintenanceLog.create({
    data: {
      vendorId: vendor.id,
      vehicleId: body.vehicleId,
      type: body.type || 'service',
      title: body.title,
      description: body.description || null,
      cost: body.cost ? Math.round(parseFloat(body.cost) * 100) : null,
      mileage: body.mileage ? parseInt(body.mileage) : null,
      performedBy: body.performedBy || null,
      performedAt: body.performedAt ? new Date(body.performedAt) : new Date(),
      nextDueAt: body.nextDueAt ? new Date(body.nextDueAt) : null,
      nextDueMileage: body.nextDueMileage ? parseInt(body.nextDueMileage) : null,
    },
  })
  return NextResponse.json(log, { status: 201 })
}
