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
        where: { endedAt: null, cancelled: false },
        include: { location: true, vehicle: true },
      },
    },
  })

  if (!vendor) notFound()

  const activeSessions = vendor.liveSessions
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
    isLive: activeSessions.length > 0,
    liveSessionCount: activeSessions.length,
    liveSessions: activeSessions.map((s) => ({
      id: s.id,
      vehicleName: s.vehicle?.name || null,
      locationName: s.location.name,
      lat: s.lat,
      lng: s.lng,
    })),
    liveLocation: activeSessions[0]
      ? {
          name: activeSessions[0].location.name,
          lat: activeSessions[0].lat,
          lng: activeSessions[0].lng,
        }
      : null,
  }

  return (
    <VendorProvider vendor={vendorData}>
      <div
        className="flex min-h-screen flex-col bg-white"
        style={
          {
            '--vendor-primary': vendor.primaryColor,
            '--vendor-secondary': vendor.secondaryColor,
          } as React.CSSProperties
        }
      >
        {/* Live banner — shows all active vans */}
        {activeSessions.length > 0 && (
          <LiveBanner
            sessions={activeSessions.map((s) => ({
              vehicleName: s.vehicle?.name || null,
              locationName: s.location.name,
            }))}
            primaryColor={vendor.primaryColor}
          />
        )}

        {/* Header — sticky, compact on mobile */}
        <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold text-white" style={{ backgroundColor: vendor.primaryColor }}>
                  {vendor.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold text-gray-900 leading-tight">
                  {vendor.name}
                </h1>
                {activeSessions.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    {activeSessions.length === 1
                      ? `LIVE${activeSessions[0].vehicle?.name ? ` — ${activeSessions[0].vehicle.name}` : ''}`
                      : `${activeSessions.length} VANS LIVE`}
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
        <footer className="border-t border-gray-100 px-4 py-6 text-center text-xs text-gray-400">
          Powered by{' '}
          <a
            href={process.env.NEXT_PUBLIC_ROOT_URL || 'https://pitchup.local-connect.uk'}
            className="font-bold transition-colors hover:text-gray-600"
            style={{ color: vendor.primaryColor }}
          >
            PitchUp
          </a>
        </footer>

        {/* Cart */}
        {vendor.preOrderingEnabled && <CartDrawer />}
      </div>
    </VendorProvider>
  )
}
