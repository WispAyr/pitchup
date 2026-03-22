import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [vendorCount, ordersToday, revenueToday, activeSessions] = await Promise.all([
    prisma.vendor.count(),
    prisma.order.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: todayStart },
        status: { notIn: ['cancelled', 'no-show'] },
      },
      _sum: { total: true },
    }),
    prisma.liveSession.count({
      where: { endedAt: null, cancelled: false },
    }),
  ])

  const revenue = (revenueToday._sum.total || 0) / 100

  const stats = [
    { label: 'Total Vendors', value: vendorCount, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Orders Today', value: ordersToday, color: 'bg-green-500/10 text-green-400' },
    { label: 'Revenue Today', value: `£${revenue.toFixed(2)}`, color: 'bg-amber-500/10 text-amber-400' },
    { label: 'Live Sessions', value: activeSessions, color: 'bg-purple-500/10 text-purple-400' },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Platform Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold ${stat.color.split(' ')[1]}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
