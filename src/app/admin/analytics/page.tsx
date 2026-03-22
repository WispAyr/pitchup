import { prisma } from '@/lib/prisma'

export default async function AdminAnalyticsPage() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalOrders, weekOrders, monthRevenue, topVendors, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { notIn: ['cancelled', 'no-show'] },
      },
      _sum: { total: true },
    }),
    prisma.vendor.findMany({
      select: {
        name: true,
        slug: true,
        primaryColor: true,
        _count: { select: { orders: true } },
      },
      orderBy: { orders: { _count: 'desc' } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true,
    }),
  ])

  const monthRev = (monthRevenue._sum.total || 0) / 100

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-500">Total Orders (All Time)</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-500">Orders This Week</p>
          <p className="mt-2 text-3xl font-bold text-green-400">{weekOrders}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-500">Revenue (30 days)</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">£{monthRev.toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="mb-4 text-lg font-bold text-white">Top Vendors by Orders</h2>
        <div className="space-y-3">
          {topVendors.map((v, i) => (
            <div key={v.slug} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-6">{i + 1}.</span>
              <div
                className="flex h-7 w-7 items-center justify-center rounded text-white text-xs font-bold"
                style={{ backgroundColor: v.primaryColor }}
              >
                {v.name.charAt(0)}
              </div>
              <span className="flex-1 text-sm text-gray-300">{v.name}</span>
              <span className="text-sm font-medium text-gray-400">{v._count.orders} orders</span>
            </div>
          ))}
          {topVendors.length === 0 && (
            <p className="text-sm text-gray-500">No vendor data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
