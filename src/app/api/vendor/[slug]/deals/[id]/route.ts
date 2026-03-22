import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const deal = await prisma.deal.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.price !== undefined && { price: body.price ? parseFloat(body.price) : null }),
      ...(body.savings !== undefined && { savings: body.savings }),
      ...(body.validDays !== undefined && { validDays: body.validDays ? JSON.stringify(body.validDays) : null }),
      ...(body.validFrom !== undefined && { validFrom: body.validFrom || null }),
      ...(body.validTo !== undefined && { validTo: body.validTo || null }),
      ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      ...(body.isFeatured !== undefined && { isFeatured: body.isFeatured }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })
  return NextResponse.json(deal)
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.deal.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
