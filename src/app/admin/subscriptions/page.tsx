'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Crown, AlertTriangle, XCircle } from 'lucide-react'

type Subscription = {
  id: string
  vendorId: string
  vendor: { id: string; name: string; slug: string }
  plan: { id: string; name: string; slug: string; monthlyPrice: number }
  status: string
  billingCycle: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  trialEndsAt: string | null
  createdAt: string
}

type Plan = {
  id: string
  name: string
  slug: string
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
    fetchPlans()
  }, [statusFilter, planFilter])

  async function fetchSubscriptions() {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    if (planFilter) params.set('planId', planFilter)
    const res = await fetch(`/api/admin/subscriptions?${params}`)
    const data = await res.json()
    setSubscriptions(data.subscriptions || [])
    setLoading(false)
  }

  async function fetchPlans() {
    const res = await fetch('/api/admin/plans')
    const data = await res.json()
    setPlans(data.plans || [])
  }

  const formatPence = (p: number) => `£${(p / 100).toFixed(2)}`
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    trialing: 'bg-blue-500/20 text-blue-400',
    past_due: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
    paused: 'bg-gray-500/20 text-gray-400',
  }

  const statusIcons: Record<string, any> = {
    active: Crown,
    trialing: Users,
    past_due: AlertTriangle,
    cancelled: XCircle,
  }

  const counts = {
    active: subscriptions.filter((s) => s.status === 'active').length,
    trialing: subscriptions.filter((s) => s.status === 'trialing').length,
    past_due: subscriptions.filter((s) => s.status === 'past_due').length,
    cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Subscriptions</h1>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Object.entries(counts).map(([status, count]) => {
          const Icon = statusIcons[status] || Users
          return (
            <div key={status} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm capitalize text-gray-400">{status.replace('_', ' ')}</p>
                <Icon className={`h-5 w-5 ${statusColors[status]?.split(' ')[1] || 'text-gray-400'}`} />
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{count}</p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Plans</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Cycle</th>
              <th className="px-4 py-3 font-medium">Started</th>
              <th className="px-4 py-3 font-medium">Next Billing</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : subscriptions.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No subscriptions found</td></tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/vendors/${sub.vendor.id}/billing`} className="font-medium text-white hover:text-amber-400">
                      {sub.vendor.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {sub.plan.name} <span className="text-gray-500">({formatPence(sub.plan.monthlyPrice)}/mo)</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[sub.status] || 'bg-gray-700 text-gray-300'}`}>
                      {sub.status}
                    </span>
                    {sub.cancelAtPeriodEnd && (
                      <span className="ml-1 text-xs text-orange-400">cancels at period end</span>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-400">{sub.billingCycle}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(sub.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(sub.currentPeriodEnd)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/vendors/${sub.vendor.id}/billing`}
                      className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-400 hover:border-amber-500 hover:text-amber-400"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
