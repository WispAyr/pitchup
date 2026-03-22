import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const vehicle = await prisma.vehicle.update({
    where: { id: params.id },
    data: {
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
  return NextResponse.json(vehicle)
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.vehicle.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
