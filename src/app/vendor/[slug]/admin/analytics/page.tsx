'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { StatsCard } from '@/components/dashboard/StatsCard'

interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  ordersToday: number
  revenueToday: number
  completedOrders: number
  cancelledOrders: number
  noShowOrders: number
  cashPayments: number
  cardPayments: number
  popularItems: { name: string; count: number }[]
  recentOrders: {
    id: string
    customerName: string
    total: number
    status: string
    createdAt: string
    pickupCode: string | null
    paymentMethod: string | null
    customer?: { name: string }
  }[]
}

export default function AnalyticsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalytics = useCallback(async () => {
    try {
      const vendorRes = await fetch(`/api/vendors/${slug}`)
      const vendor = await vendorRes.json()
      if (!vendor.id) throw new Error('Vendor not found')

      const res = await fetch(`/api/analytics?vendorId=${vendor.id}`)
      if (!res.ok) throw new Error('Failed to load analytics')
      const analytics = await res.json()
      setData(analytics)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-600" />
      </div>
    )
  }

  if (error) {
    return <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
  }

  if (!data) return null

  const reliabilityRate = data.totalOrders > 0
    ? Math.round(((data.completedOrders) / data.totalOrders) * 100)
    : 100
  const noShowRate = data.totalOrders > 0
    ? Math.round((data.noShowOrders / data.totalOrders) * 100)
    : 0

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Total Orders" value={data.totalOrders} />
        <StatsCard title="Total Revenue" value={formatPrice(data.totalRevenue)} />
        <StatsCard title="Orders Today" value={data.ordersToday} />
        <StatsCard title="Revenue Today" value={formatPrice(data.revenueToday)} />
      </div>

      {/* Reliability & Payment stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Completion Rate" value={`${reliabilityRate}%`} />
        <StatsCard title="Cancelled" value={data.cancelledOrders} />
        <StatsCard title="Cash Payments" value={data.cashPayments} />
        <StatsCard title="Card Payments" value={data.cardPayments} />
      </div>

      {noShowRate > 10 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            ⚠️ Your no-show rate is {noShowRate}%. Consider shorter time windows or requiring phone numbers.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Popular items */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Popular Items</h2>
          {data.popularItems.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {data.popularItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{item.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Recent Orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                    {order.pickupCode && (
                      <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white">
                        {order.pickupCode}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.customerName || order.customer?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
