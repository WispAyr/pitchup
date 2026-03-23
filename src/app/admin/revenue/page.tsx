'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Users, Percent, Gift, CreditCard } from 'lucide-react'

type RevenueData = {
  totalRevenue: number
  monthRevenue: number
  lastMonthRevenue: number
  mrr: number
  activeSubs: number
  cancelledSubs: number
  churnRate: number
  recentPayments: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
    vendor: { name: string; slug: string }
  }>
  planStats: Array<{
    plan: { name: string; monthlyPrice: number }
    count: number
  }>
  monthlyRevenue: Array<{ month: string; amount: number }>
  credits: { total: number; applied: number }
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const formatPence = (p: number) => `£${(p / 100).toFixed(2)}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  if (loading || !data) {
    return <div className="flex items-center justify-center py-20 text-gray-500">Loading revenue data...</div>
  }

  const maxMonthly = Math.max(...data.monthlyRevenue.map((m) => m.amount), 1)
  const monthGrowth = data.lastMonthRevenue > 0
    ? (((data.monthRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Revenue</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'MRR', value: formatPence(data.mrr), icon: TrendingUp, color: 'text-green-400', sub: `${monthGrowth}% vs last month` },
          { label: 'Total Revenue', value: formatPence(data.totalRevenue), icon: DollarSign, color: 'text-amber-400', sub: `${formatPence(data.monthRevenue)} this month` },
          { label: 'Active Subscribers', value: String(data.activeSubs), icon: Users, color: 'text-blue-400', sub: `${data.cancelledSubs} cancelled` },
          { label: 'Churn Rate', value: `${data.churnRate}%`, icon: Percent, color: 'text-red-400', sub: 'of all subscriptions' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Monthly Revenue</h2>
          <div className="flex items-end gap-1.5" style={{ height: '200px' }}>
            {data.monthlyRevenue.map((m) => {
              const height = maxMonthly > 0 ? (m.amount / maxMonthly) * 100 : 0
              const monthLabel = m.month.split('-')[1]
              const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end" style={{ height: '170px' }}>
                    <div
                      className="w-full rounded-t bg-amber-500/80 hover:bg-amber-400 transition-colors"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${months[parseInt(monthLabel)]}: ${formatPence(m.amount)}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">{months[parseInt(monthLabel)]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Plan Breakdown</h2>
          <div className="space-y-3">
            {data.planStats.length === 0 ? (
              <p className="text-sm text-gray-500">No active plans</p>
            ) : (
              data.planStats.map((ps, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{ps.plan.name}</p>
                    <p className="text-xs text-gray-500">{formatPence(ps.plan.monthlyPrice)}/mo</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{ps.count}</span>
                    <span className="text-xs text-gray-500">vendors</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Credits */}
          <div className="mt-6 border-t border-gray-800 pt-4">
            <h3 className="mb-2 text-sm font-medium text-gray-400 flex items-center gap-2">
              <Gift className="h-4 w-4" /> Credits
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Issued</span>
              <span className="text-white">{formatPence(data.credits.total)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Applied</span>
              <span className="text-green-400">{formatPence(data.credits.applied)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-400" /> Recent Payments
        </h2>
        <div className="space-y-2">
          {data.recentPayments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium text-white">{p.vendor.name}</p>
                <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-400">{formatPence(p.amount)}</p>
                <span className="text-xs text-gray-500">{p.status}</span>
              </div>
            </div>
          ))}
          {data.recentPayments.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">No payments yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
