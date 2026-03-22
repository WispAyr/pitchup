import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { orders: true, menuItems: true, locations: true, vehicles: true, documents: true },
      },
    },
  })

  if (!vendor) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { passwordHash, ...safe } = vendor
  return NextResponse.json(safe)
}
