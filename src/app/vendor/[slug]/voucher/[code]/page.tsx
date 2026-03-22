import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import VoucherPageClient from './voucher-page-client'

export async function generateMetadata({ params }: { params: { slug: string; code: string } }): Promise<Metadata> {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { name: true } })
  return {
    title: vendor ? `${params.code} — ${vendor.name} Voucher` : 'Voucher',
    description: `Use code ${params.code} at ${vendor?.name || 'checkout'}`,
  }
}

export default async function VoucherPage({ params }: { params: { slug: string; code: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, slug: true, logo: true, primaryColor: true, secondaryColor: true },
  })
  if (!vendor) notFound()

  const voucher = await prisma.voucher.findUnique({
    where: { code: params.code.toUpperCase() },
  })
  if (!voucher || voucher.vendorId !== vendor.id) notFound()

  const isExpired = voucher.expiresAt && new Date(voucher.expiresAt) < new Date()
  const isUsedUp = voucher.maxUses ? voucher.usesCount >= voucher.maxUses : false

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <VoucherPageClient
          voucher={{
            code: voucher.code,
            type: voucher.type,
            value: voucher.value,
            description: voucher.description,
            expiresAt: voucher.expiresAt?.toISOString() || null,
            giftCardBalance: voucher.giftCardBalance,
            isActive: voucher.isActive,
          }}
          vendor={{
            name: vendor.name,
            slug: vendor.slug,
            logo: vendor.logo,
            primaryColor: vendor.primaryColor,
            secondaryColor: vendor.secondaryColor,
          }}
          isExpired={!!isExpired}
          isUsedUp={isUsedUp}
        />

        <div className="mt-6 text-center space-y-2">
          <Link href={`/vendor/${vendor.slug}/order?voucher=${voucher.code}`}
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: vendor.primaryColor }}>
            Order Now with this Voucher →
          </Link>
          <div>
            <Link href={`/vendor/${vendor.slug}`} className="text-sm text-gray-500 hover:underline">
              Visit {vendor.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
