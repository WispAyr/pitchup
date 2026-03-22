import { prisma } from '@/lib/prisma'

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: 'desc' },
    include: { vendor: { select: { name: true, slug: true } } },
  })

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400',
    responded: 'bg-yellow-500/10 text-yellow-400',
    booked: 'bg-green-500/10 text-green-400',
    declined: 'bg-red-500/10 text-red-400',
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">All Enquiries</h1>

      <div className="overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {enquiries.map((e) => (
              <tr key={e.id} className="bg-gray-900/50 hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-white">{e.name}</div>
                  <div className="text-xs text-gray-500">{e.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{e.vendor.name}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{e.eventType || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{e.guestCount || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[e.status] || 'bg-gray-700 text-gray-400'}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{e.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {enquiries.length === 0 && (
          <div className="p-8 text-center text-gray-500">No enquiries yet</div>
        )}
      </div>
    </div>
  )
}
