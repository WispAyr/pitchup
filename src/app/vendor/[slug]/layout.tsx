import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { VendorProvider } from '@/lib/vendor-context'
import type { VendorData } from '@/lib/vendor-context'
import { CartDrawer } from '@/components/vendor/CartDrawer'
import { LiveBanner } from '@/components/vendor/LiveBanner'
import { VendorLayoutClient } from './layout-client'

export default async function VendorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      liveSessions: {
        where: { endedAt: null },
        include: { location: true },
        take: 1,
      },
    },
  })

  if (!vendor) notFound()

  const activeSession = vendor.liveSessions[0] || null

  const templateId = (vendor as any).templateId || 'classic'

  const vendorData: VendorData = {
    id: vendor.id,
    slug: vendor.slug,
    name: vendor.name,
    description: vendor.description,
    logo: vendor.logo,
    banner: vendor.banner,
    primaryColor: vendor.primaryColor,
    secondaryColor: vendor.secondaryColor,
    cuisineType: vendor.cuisineType,
    phone: vendor.phone,
    email: vendor.email,
    website: vendor.website,
    facebook: vendor.facebook,
    instagram: vendor.instagram,
    tiktok: vendor.tiktok,
    twitter: vendor.twitter,
    preOrderingEnabled: vendor.preOrderingEnabled,
    templateId,
    isLive: !!activeSession,
    liveLocation: activeSession
      ? {
          name: activeSession.location.name,
          lat: activeSession.lat,
          lng: activeSession.lng,
        }
      : null,
  }

  return (
    <VendorProvider vendor={vendorData}>
      <div
        className={`flex min-h-screen flex-col ${
          templateId === 'bold' ? 'bg-gray-950 text-white' :
          templateId === 'minimal' ? 'bg-gray-50' :
          'bg-white'
        }`}
        style={
          {
            '--vendor-primary': vendor.primaryColor,
            '--vendor-secondary': vendor.secondaryColor,
          } as React.CSSProperties
        }
      >
        {/* Live banner */}
        {vendorData.isLive && vendorData.liveLocation && (
          <LiveBanner
            locationName={vendorData.liveLocation.name}
            primaryColor={vendor.primaryColor}
          />
        )}

        {/* Header */}
        <header className={`sticky top-0 z-30 border-b backdrop-blur-sm ${
          templateId === 'bold'
            ? 'border-gray-800 bg-gray-900/95'
            : 'border-gray-100 bg-white/95'
        }`}>
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              {vendor.logo ? (
                <img
                  src={vendor.logo}
                  alt={vendor.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: vendor.primaryColor }}
                >
                  {vendor.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className={`text-lg font-bold leading-tight ${templateId === 'bold' ? 'text-white' : 'text-gray-900'}`}>
                  {vendor.name}
                </h1>
                {vendorData.isLive && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    LIVE NOW
                  </span>
                )}
              </div>
            </Link>

            <VendorLayoutClient
              preOrderingEnabled={vendor.preOrderingEnabled}
              primaryColor={vendor.primaryColor}
            />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer
          className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-400"
          style={{ backgroundColor: vendor.secondaryColor + '10' }}
        >
          <p>
            Powered by{' '}
            <a
              href={`${process.env.NEXT_PUBLIC_ROOT_URL || 'https://pitchup.local-connect.uk'}`}
              className="font-semibold transition-colors hover:text-gray-600"
              style={{ color: vendor.primaryColor }}
            >
              PitchUp
            </a>
          </p>
        </footer>

        {/* Cart drawer */}
        {vendor.preOrderingEnabled && <CartDrawer />}
      </div>
    </VendorProvider>
  )
}
