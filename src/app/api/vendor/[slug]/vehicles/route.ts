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

  const vehicles = await prisma.vehicle.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(vehicles)
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const vendor = await getVendor(params.slug, session)
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const vehicle = await prisma.vehicle.create({
    data: {
      vendorId: vendor.id,
      name: body.name,
      registration: body.registration || null,
      make: body.make || null,
      model: body.model || null,
      year: body.year ? parseInt(body.year) : null,
      photo: body.photo || null,
      notes: body.notes || null,
      status: body.status || 'active',
    },
  })
  return NextResponse.json(vehicle, { status: 201 })
}
