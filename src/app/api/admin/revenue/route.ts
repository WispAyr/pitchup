import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    activeSubs,
    cancelledSubs,
    recentPayments,
    planBreakdown,
    monthlyRevenue,
    totalCredits,
    appliedCredits,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'succeeded' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'succeeded', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'succeeded',
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.subscription.count({ where: { status: { in: ['active', 'trialing'] } } }),
    prisma.subscription.count({ where: { status: 'cancelled' } }),
    prisma.payment.findMany({
      where: { status: 'succeeded' },
      include: { vendor: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.subscription.groupBy({
      by: ['planId'],
      where: { status: { in: ['active', 'trialing'] } },
      _count: true,
    }),
    // Last 12 months revenue
    prisma.payment.findMany({
      where: {
        status: 'succeeded',
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) },
      },
      select: { amount: true, createdAt: true },
    }),
    prisma.vendorCredit.aggregate({ _sum: { amount: true } }),
    prisma.vendorCredit.aggregate({
      where: { appliedToInvoice: { not: null } },
      _sum: { amount: true },
    }),
  ])

  // Get plan names for breakdown
  const plans = await prisma.plan.findMany({
    select: { id: true, name: true, monthlyPrice: true },
  })
  const planMap = Object.fromEntries(plans.map((p) => [p.id, p]))

  const planStats = planBreakdown.map((pb) => ({
    plan: planMap[pb.planId] || { name: 'Unknown', monthlyPrice: 0 },
    count: pb._count,
  }))

  // Aggregate monthly revenue
  const monthlyData: Record<string, number> = {}
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyData[key] = 0
  }
  for (const p of monthlyRevenue) {
    const d = new Date(p.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (monthlyData[key] !== undefined) {
      monthlyData[key] += p.amount
    }
  }

  const totalSubs = activeSubs + cancelledSubs
  const churnRate = totalSubs > 0 ? ((cancelledSubs / totalSubs) * 100).toFixed(1) : '0'

  // MRR = sum of active subscription plan monthly prices
  const mrr = planStats.reduce((sum, ps) => sum + (ps.plan.monthlyPrice * ps.count), 0)

  return NextResponse.json({
    totalRevenue: totalRevenue._sum.amount || 0,
    monthRevenue: monthRevenue._sum.amount || 0,
    lastMonthRevenue: lastMonthRevenue._sum.amount || 0,
    mrr,
    activeSubs,
    cancelledSubs,
    churnRate: parseFloat(churnRate),
    recentPayments,
    planStats,
    monthlyRevenue: Object.entries(monthlyData).map(([month, amount]) => ({ month, amount })),
    credits: {
      total: totalCredits._sum.amount || 0,
      applied: appliedCredits._sum.amount || 0,
    },
  })
}
