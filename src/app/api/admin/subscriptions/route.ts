import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const planId = searchParams.get('planId')

  const where: any = {}
  if (status) where.status = status
  if (planId) where.planId = planId

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      vendor: { select: { id: true, name: true, slug: true } },
      plan: { select: { id: true, name: true, slug: true, monthlyPrice: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ subscriptions })
}
