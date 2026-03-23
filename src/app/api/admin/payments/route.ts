import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const vendorSearch = searchParams.get('vendor')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const where: any = {}

  if (status) where.status = status
  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) where.createdAt.lte = new Date(to)
  }
  if (vendorSearch) {
    where.vendor = {
      OR: [
        { name: { contains: vendorSearch, mode: 'insensitive' } },
        { slug: { contains: vendorSearch, mode: 'insensitive' } },
      ],
    }
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { vendor: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ])

  return NextResponse.json({ payments, total, page, limit, pages: Math.ceil(total / limit) })
}
