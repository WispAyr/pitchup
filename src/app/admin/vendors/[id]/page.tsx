'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdminVendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/vendors/${params.id}`)
      .then((r) => r.json())
      .then(setVendor)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-amber-400" /></div>
  }

  if (!vendor) return <div className="text-gray-400 py-20 text-center">Vendor not found</div>

  return (
    <div>
      <Link href="/admin/vendors" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> Back to Vendors
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-xl font-bold"
          style={{ backgroundColor: vendor.primaryColor }}
        >
          {vendor.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{vendor.name}</h1>
          <p className="text-sm text-gray-500">{vendor.slug} · {vendor.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-500 uppercase">Details</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Cuisine', vendor.cuisineType],
              ['Phone', vendor.phone],
              ['Website', vendor.website],
              ['Template', vendor.templateId],
              ['Pre-ordering', vendor.preOrderingEnabled ? 'Enabled' : 'Disabled'],
              ['Custom Domain', vendor.customDomain || '—'],
              ['Domain Status', vendor.domainStatus || '—'],
              ['Stripe', vendor.stripeOnboarded ? 'Connected' : 'Not connected'],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-gray-300">{val || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-500 uppercase">Stats</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Menu Items', vendor._count?.menuItems],
              ['Orders', vendor._count?.orders],
              ['Locations', vendor._count?.locations],
              ['Vehicles', vendor._count?.vehicles],
              ['Documents', vendor._count?.documents],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-gray-300">{val ?? 0}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          href={`/vendor/${vendor.slug}/admin`}
          target="_blank"
          className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/20"
        >
          Open Vendor Admin →
        </Link>
        <Link
          href={`/vendor/${vendor.slug}`}
          target="_blank"
          className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
        >
          View Public Page →
        </Link>
      </div>
    </div>
  )
}
