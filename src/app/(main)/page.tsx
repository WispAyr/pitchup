import Link from 'next/link'
import { MapPin, ShoppingBag, Zap, Globe, Radio, CreditCard, QrCode } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getFeaturedVendors() {
  try {
    return await prisma.vendor.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        cuisineType: true,
        primaryColor: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const vendors = await getFeaturedVendors()
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.15),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Never Miss the{' '}
              <span className="text-brand-500">Van</span>{' '}
              Again
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Find mobile food vendors near you. See their menu, pre-order, skip the queue.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/discover"
                className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all hover:shadow-xl hover:shadow-brand-500/30"
              >
                Find Food Near You
              </Link>
              <Link
                href="/auth/vendor-signup"
                className="inline-flex items-center justify-center rounded-xl border-2 border-brand-200 bg-white px-7 py-3.5 text-base font-semibold text-brand-700 hover:bg-brand-50 hover:border-brand-300 transition-all"
              >
                List Your Van
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-3 text-gray-500 text-lg">Three simple steps to great street food</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 mb-5">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Find</h3>
              <p className="text-gray-500 leading-relaxed">
                See who&apos;s serving near you right now. Live locations updated in real time.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 mb-5">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Order</h3>
              <p className="text-gray-500 leading-relaxed">
                Browse the menu, pre-order for collection. Pay online, no fuss.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 mb-5">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enjoy</h3>
              <p className="text-gray-500 leading-relaxed">
                Skip the queue, grab your food. Hot, fresh, and ready when you arrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vendors */}
      {vendors.length > 0 && (
        <section className="py-20 sm:py-24 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Featured Vendors
              </h2>
              <p className="mt-3 text-gray-500 text-lg">Check out some of our top food vendors</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`${protocol}://${vendor.slug}.${rootDomain}`}
                  target="_blank"
                  className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="h-2" style={{ backgroundColor: vendor.primaryColor }} />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-lg"
                        style={{ backgroundColor: vendor.primaryColor }}
                      >
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                          {vendor.name}
                        </h3>
                        {vendor.cuisineType && (
                          <span className="text-xs text-gray-500">{vendor.cuisineType}</span>
                        )}
                      </div>
                    </div>
                    {vendor.description && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/vendors"
                className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                View all vendors &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* For Vendors Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                Your Van. Your Customers.{' '}
                <span className="text-brand-400">Your Schedule.</span>
              </h2>
              <p className="mt-4 text-gray-300 text-lg leading-relaxed">
                PitchUp gives mobile food vendors the tools to grow their business, connect with customers, and take orders online.
              </p>
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" />
                  <span className="text-gray-200">Your own branded page with your menu, story, and style</span>
                </li>
                <li className="flex items-start gap-3">
                  <Radio className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" />
                  <span className="text-gray-200">Live location sharing so customers know where to find you</span>
                </li>
                <li className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" />
                  <span className="text-gray-200">Pre-ordering and online payments via Stripe</span>
                </li>
                <li className="flex items-start gap-3">
                  <QrCode className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" />
                  <span className="text-gray-200">QR code for your van — customers scan, browse, and order</span>
                </li>
              </ul>
              <div className="mt-10">
                <Link
                  href="/auth/vendor-signup"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-72 h-72 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white/90">P</div>
                  <div className="text-lg font-semibold text-white/70 mt-2">PitchUp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
