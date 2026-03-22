import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const days = parseInt(req.nextUrl.searchParams.get('days') || '30')
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)

  const documents = await prisma.document.findMany({
    where: {
      vendorId: vendor.id,
      expiresAt: { not: null, lte: cutoff },
    },
    include: { vehicle: { select: { name: true } } },
    orderBy: { expiresAt: 'asc' },
  })

  return NextResponse.json(documents)
}
