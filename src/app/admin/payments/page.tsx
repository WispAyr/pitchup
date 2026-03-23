'use client'

import { useState, useEffect } from 'react'
import { CreditCard, DollarSign, TrendingUp, Users, RefreshCw, Download, Search, X } from 'lucide-react'

type Payment = {
  id: string
  vendorId: string
  vendor: { id: string; name: string; slug: string }
  stripePaymentId: string | null
  amount: number
  currency: string
  status: string
  description: string | null
  refundedAmount: number
  createdAt: string
}

type RevenueStats = {
  mrr: number
  monthRevenue: number
  activeSubs: number
  churnRate: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [vendorSearch, setVendorSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refundModal, setRefundModal] = useState<Payment | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
  const [refunding, setRefunding] = useState(false)

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [page, statusFilter, vendorSearch])

  async function fetchPayments() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (statusFilter) params.set('status', statusFilter)
    if (vendorSearch) params.set('vendor', vendorSearch)
    const res = await fetch(`/api/admin/payments?${params}`)
    const data = await res.json()
    setPayments(data.payments || [])
    setTotalPages(data.pages || 1)
    setLoading(false)
  }

  async function fetchStats() {
    const res = await fetch('/api/admin/revenue')
    const data = await res.json()
    setStats(data)
  }

  async function handleRefund() {
    if (!refundModal) return
    setRefunding(true)
    try {
      const body: any = { reason: refundReason }
      if (refundType === 'partial' && refundAmount) {
        body.amount = Math.round(parseFloat(refundAmount) * 100)
      }
      await fetch(`/api/admin/payments/${refundModal.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setRefundModal(null)
      setRefundAmount('')
      setRefundReason('')
      fetchPayments()
    } catch (e) {
      console.error('Refund failed:', e)
    }
    setRefunding(false)
  }

  const formatPence = (p: number) => `£${(p / 100).toFixed(2)}`
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const statusColors: Record<string, string> = {
    succeeded: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    failed: 'bg-red-500/20 text-red-400',
    refunded: 'bg-purple-500/20 text-purple-400',
    partially_refunded: 'bg-orange-500/20 text-orange-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <button className="flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 hover:text-white">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'MRR', value: formatPence(stats.mrr), icon: TrendingUp, color: 'text-green-400' },
            { label: 'This Month', value: formatPence(stats.monthRevenue), icon: DollarSign, color: 'text-amber-400' },
            { label: 'Active Subs', value: String(stats.activeSubs), icon: Users, color: 'text-blue-400' },
            { label: 'Churn Rate', value: `${stats.churnRate}%`, icon: RefreshCw, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search vendor..."
            value={vendorSearch}
            onChange={(e) => { setVendorSearch(e.target.value); setPage(1) }}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-3 text-sm text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="partially_refunded">Partially Refunded</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-4 py-3 font-medium">Vendor</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No payments found</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white font-medium">{payment.vendor.name}</td>
                  <td className="px-4 py-3 text-white">
                    {formatPence(payment.amount)}
                    {payment.refundedAmount > 0 && (
                      <span className="ml-1 text-xs text-red-400">(-{formatPence(payment.refundedAmount)})</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[payment.status] || 'bg-gray-700 text-gray-300'}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{payment.description || '-'}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3">
                    {payment.status === 'succeeded' && payment.stripePaymentId && (
                      <button
                        onClick={() => { setRefundModal(payment); setRefundType('full') }}
                        className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-400 hover:border-red-500 hover:text-red-400"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setRefundModal(null)}>
          <div className="mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Refund Payment</h3>
              <button onClick={() => setRefundModal(null)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-4 text-sm text-gray-400">
              Payment of {formatPence(refundModal.amount)} from {refundModal.vendor.name}
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setRefundType('full')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${refundType === 'full' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-gray-700 text-gray-400'}`}
                >
                  Full Refund
                </button>
                <button
                  onClick={() => setRefundType('partial')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${refundType === 'partial' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-gray-700 text-gray-400'}`}
                >
                  Partial Refund
                </button>
              </div>
              {refundType === 'partial' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    max={(refundModal.amount - refundModal.refundedAmount) / 100}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Reason</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                  placeholder="Reason for refund..."
                />
              </div>
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {refunding ? 'Processing...' : refundType === 'full' ? `Refund ${formatPence(refundModal.amount - refundModal.refundedAmount)}` : `Refund £${refundAmount || '0.00'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
