import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const vendors = await prisma.vendor.findMany({
    where: { customDomain: { not: null } },
    select: {
      id: true,
      name: true,
      slug: true,
      customDomain: true,
      domainStatus: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(vendors)
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { vendorId, domainStatus } = await request.json()
  if (!vendorId || !['pending', 'verified', 'active'].includes(domainStatus)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { domainStatus },
  })

  return NextResponse.json({ success: true })
}
