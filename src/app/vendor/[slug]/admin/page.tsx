import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { StatsCard } from '@/components/dashboard/StatsCard'
import Link from 'next/link'

export default async function AdminDashboardPage({
  params,
}: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    const { redirect } = require('next/navigation')
    redirect(`/auth/signin?callbackUrl=/vendor/${params.slug}/admin`)
    return null // unreachable but satisfies TS
  }
  const user = session!.user as any

  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      liveSessions: {
        where: { endedAt: null },
        include: { location: true },
        take: 1,
      },
    },
  })

  if (!vendor) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalOrders, totalRevenue, ordersToday, followers, recentOrders, activeSession] =
    await Promise.all([
      prisma.order.count({
        where: { vendorId: vendor.id, status: { not: 'cancelled' } },
      }),
      prisma.order.aggregate({
        where: { vendorId: vendor.id, status: 'collected' },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          vendorId: vendor.id,
          status: { not: 'cancelled' },
          createdAt: { gte: today },
        },
      }),
      prisma.follow.count({ where: { vendorId: vendor.id } }),
      prisma.order.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      Promise.resolve(vendor.liveSessions[0] || null),
    ])

  const revenue = totalRevenue._sum.total || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {vendor.name}
        </h1>
        <p className="mt-1 text-gray-500">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Live session status */}
      {activeSession && (
        <div className="mb-6 flex items-center justify-between rounded-xl border-2 border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
            </span>
            <div>
              <p className="text-sm font-semibold text-green-800">You are LIVE</p>
              <p className="text-xs text-green-600">
                at {activeSession.location.name} since{' '}
                {new Date(activeSession.startedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <Link
            href={`/vendor/${params.slug}/admin/go-live`}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            Manage
          </Link>
        </div>
      )}

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Total Orders" value={totalOrders} accentColor={vendor.primaryColor} />
        <StatsCard title="Revenue" value={formatPrice(revenue)} subtitle="Collected" accentColor={vendor.primaryColor} />
        <StatsCard title="Orders Today" value={ordersToday} accentColor={vendor.primaryColor} />
        <StatsCard title="Followers" value={followers} accentColor={vendor.primaryColor} />
      </div>

      {/* Quick actions */}
      {!activeSession && (
        <div className="mb-8">
          <Link
            href={`/vendor/${params.slug}/admin/go-live`}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: vendor.primaryColor }}
          >
            🔴 Go Live
          </Link>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <Link
            href={`/vendor/${params.slug}/admin/orders`}
            className="text-sm font-medium hover:underline"
            style={{ color: vendor.primaryColor }}
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">No orders yet. Go live to start receiving orders!</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase text-gray-500">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="px-4 py-3">
                      {order.pickupCode ? (
                        <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white">
                          {order.pickupCode}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{order.customerName}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          order.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'preparing'
                            ? 'bg-amber-100 text-amber-700'
                            : order.status === 'ready'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'collected'
                            ? 'bg-gray-100 text-gray-600'
                            : order.status === 'no-show'
                            ? 'bg-orange-100 text-orange-700'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
