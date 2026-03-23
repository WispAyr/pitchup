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
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-gray-800 bg-gray-900 p-5 animate-fade-in-up card-hover`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <div className="mt-2 flex items-end gap-2">
              <p className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/admin/vendors" className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors card-hover">
          🏪 Manage Vendors
        </a>
        <a href="/admin/orders" className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors card-hover">
          📦 View Orders
        </a>
        <a href="/admin/payments" className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors card-hover">
          💰 Payments
        </a>
        <a href="/admin/analytics" className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-300 hover:bg-gray-800 transition-colors card-hover">
          📈 Analytics
        </a>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-800">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-lg font-bold text-white">Platform Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monitor vendors, orders, and revenue from this dashboard.
        </p>
      </div>
    </div>
  )
}
