'use client'

import { useEffect, useState } from 'react'

export default function AdminDomainsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/domains')
      .then((r) => r.json())
      .then(setVendors)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(vendorId: string, status: string) {
    await fetch('/api/admin/domains', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, domainStatus: status }),
    })
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, domainStatus: status } : v))
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    verified: 'bg-blue-500/10 text-blue-400',
    active: 'bg-green-500/10 text-green-400',
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-amber-400" /></div>
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="mb-6 text-2xl font-bold text-white">Custom Domains</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {vendors.map((v) => (
              <tr key={v.id} className="bg-gray-900/50 hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm text-white">{v.name}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-300">{v.customDomain}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[v.domainStatus] || 'bg-gray-700 text-gray-400'}`}>
                    {v.domainStatus}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {v.domainStatus === 'pending' && (
                    <button
                      onClick={() => updateStatus(v.id, 'verified')}
                      className="rounded bg-blue-500/10 px-3 py-1 text-xs text-blue-400 hover:bg-blue-500/20"
                    >
                      Mark Verified
                    </button>
                  )}
                  {(v.domainStatus === 'verified' || v.domainStatus === 'pending') && (
                    <button
                      onClick={() => updateStatus(v.id, 'active')}
                      className="rounded bg-green-500/10 px-3 py-1 text-xs text-green-400 hover:bg-green-500/20"
                    >
                      Activate
                    </button>
                  )}
                  {v.domainStatus === 'active' && (
                    <button
                      onClick={() => updateStatus(v.id, 'pending')}
                      className="rounded bg-red-500/10 px-3 py-1 text-xs text-red-400 hover:bg-red-500/20"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && (
          <div className="p-8 text-center text-gray-500">No custom domain requests</div>
        )}
      </div>
    </div>
  )
}
