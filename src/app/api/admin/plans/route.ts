import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  const features = await prisma.planFeature.findMany({
    orderBy: { category: 'asc' },
  })

  return NextResponse.json({ plans, features })
}
