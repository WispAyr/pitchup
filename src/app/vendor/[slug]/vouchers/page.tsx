import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { name: true } })
  return { title: vendor ? `Vouchers — ${vendor.name}` : 'Vouchers' }
}

export default async function PublicVouchersPage({ params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, slug: true, logo: true, primaryColor: true, secondaryColor: true },
  })
  if (!vendor) notFound()

  const vouchers = await prisma.voucher.findMany({
    where: {
      vendorId: vendor.id,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          {vendor.logo && <img src={vendor.logo} alt={vendor.name} className="h-12 mx-auto mb-3 object-contain" />}
          <h1 className="text-2xl font-extrabold text-gray-900">{vendor.name}</h1>
          <p className="text-gray-500 mt-1">Available vouchers & offers</p>
        </div>

        {vouchers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center shadow-sm">
            <p className="text-4xl mb-3">🎟️</p>
            <p className="font-bold text-gray-900">No active vouchers right now</p>
            <p className="text-sm text-gray-500 mt-1">Check back soon for offers!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vouchers.map(v => (
              <Link key={v.id} href={`/vendor/${vendor.slug}/voucher/${v.code}`}
                className="block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6 text-center text-white"
                  style={{ background: `linear-gradient(135deg, ${vendor.primaryColor}, ${vendor.secondaryColor})` }}>
                  <p className="text-3xl font-black">{getValueText(v)}</p>
                  <p className="text-sm opacity-90 mt-1">{v.description}</p>
                </div>
                <div className="bg-white p-4 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-lg font-extrabold text-gray-900">{v.code}</span>
                    {v.expiresAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Expires {new Date(v.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold" style={{ color: vendor.primaryColor }}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href={`/vendor/${vendor.slug}`} className="text-sm font-medium hover:underline" style={{ color: vendor.primaryColor }}>
            ← Back to {vendor.name}
          </Link>
        </div>
      </div>
    </div>
  )
}

function getValueText(v: any): string {
  switch (v.type) {
    case 'percentage': return `${v.value}% OFF`
    case 'fixed': return `£${v.value?.toFixed(2)} OFF`
    case 'giftCard': return `£${((v.giftCardBalance || 0) / 100).toFixed(2)} GIFT CARD`
    case 'freeItem': return 'FREE ITEM'
    case 'buyOneGetOne': return 'BUY 1 GET 1 FREE'
    default: return ''
  }
}
