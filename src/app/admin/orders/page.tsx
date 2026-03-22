'use client'

import { useEffect, useState } from 'react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [statusFilter])

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    confirmed: 'bg-blue-500/10 text-blue-400',
    preparing: 'bg-purple-500/10 text-purple-400',
    ready: 'bg-green-500/10 text-green-400',
    collected: 'bg-gray-700 text-gray-300',
    cancelled: 'bg-red-500/10 text-red-400',
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">All Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300"
        >
          <option value="all">All statuses</option>
          {['pending', 'confirmed', 'preparing', 'ready', 'collected', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-amber-400" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders.map((o) => (
                <tr key={o.id} className="bg-gray-900/50 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm font-mono text-amber-400">{o.pickupCode || o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{o.vendor?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{o.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">£{(o.total / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status] || 'bg-gray-700 text-gray-400'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-500">No orders found</div>
          )}
        </div>
      )}
    </div>
  )
}
