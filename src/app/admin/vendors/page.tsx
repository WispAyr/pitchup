import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true, menuItems: true, liveSessions: true } },
    },
  })

  return (
    <div className="animate-fade-in-up">
      <h1 className="mb-6 text-2xl font-bold text-white">Vendors</h1>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuisine</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custom Domain</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {vendors.map((v) => (
              <tr key={v.id} className="bg-gray-900/50 hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
                      style={{ backgroundColor: v.primaryColor }}
                    >
                      {v.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-white">{v.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{v.slug}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{v.cuisineType || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{v._count.menuItems}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{v._count.orders}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{v.customDomain || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    v.stripeOnboarded ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {v.stripeOnboarded ? 'Connected' : 'Not set'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {v.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/vendors/${v.id}`}
                    className="text-sm text-amber-400 hover:text-amber-300"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && (
          <div className="p-8 text-center text-gray-500">No vendors yet</div>
        )}
      </div>
    </div>
  )
}
