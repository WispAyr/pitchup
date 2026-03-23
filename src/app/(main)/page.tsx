import Link from 'next/link'
import { MapPin, ShoppingBag, Zap, Globe, Smartphone, Truck, Calendar, BarChart3, FileCheck, Map, ChevronDown, ShieldCheck } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getStats() {
  try {
    const [vendorCount, orderCount, liveCount] = await Promise.all([
      prisma.vendor.count(),
      prisma.order.count({ where: { status: { not: 'cancelled' } } }),
      prisma.liveSession.count({ where: { endedAt: null, cancelled: false } }),
    ])
    return { vendorCount, orderCount, liveCount }
  } catch {
    return { vendorCount: 0, orderCount: 0, liveCount: 0 }
  }
}

async function getFeaturedVendors() {
  try {
    return await prisma.vendor.findMany({
      select: {
        id: true, slug: true, name: true, description: true, cuisineType: true,
        primaryColor: true, secondaryColor: true, logo: true,
        _count: { select: { reviews: true, vehicles: true, locations: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })
  } catch { return [] }
}

export default async function HomePage() {
  const [stats, vendors] = await Promise.all([getStats(), getFeaturedVendors()])
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'

  const cuisineIcons = [
    { emoji: '🍟', label: 'Fish & Chips' },
    { emoji: '🍕', label: 'Pizza' },
    { emoji: '🍔', label: 'Burgers' },
    { emoji: '☕', label: 'Coffee' },
    { emoji: '🌮', label: 'Tacos' },
    { emoji: '🍦', label: 'Ice Cream' },
    { emoji: '🥙', label: 'Wraps' },
    { emoji: '🍜', label: 'Noodles' },
  ]

  return (
    <>
      {/* ════════════════════════════════════════════════════
          CONSUMER SECTION — Find food fast
          ════════════════════════════════════════════════════ */}

      {/* Hero */}
      <section className="relative overflow-hidden bg-warm-900">
        {/* Warm gradient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(245,158,11,0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(234,88,12,0.08),_transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-fade-in-up text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Street Food,{' '}
              <span className="bg-gradient-to-r from-brand-400 to-orange-500 bg-clip-text text-transparent">Found</span>
            </h1>
            <p className="animate-fade-in-up animate-delay-1 mx-auto mt-5 max-w-xl text-lg text-warm-300 sm:text-xl">
              Find mobile food vendors near you. Pre-order, skip the queue, eat great food.
            </p>

            {/* Search bar */}
            <div className="animate-fade-in-up animate-delay-2 mx-auto mt-8 max-w-xl">
              <Link href="/discover" className="group flex items-center gap-3 rounded-2xl border border-warm-700 bg-warm-800/80 px-5 py-4 shadow-lg shadow-black/20 transition-all hover:border-brand-500/50 hover:bg-warm-800">
                <MapPin className="h-5 w-5 text-brand-400" />
                <span className="flex-1 text-left text-warm-400 group-hover:text-warm-300">Search by location or cuisine...</span>
                <span className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white">Search</span>
              </Link>
            </div>

            {/* Cuisine quick filters */}
            <div className="animate-fade-in-up animate-delay-3 mt-6 flex justify-center">
              <div className="scrollbar-hide flex gap-3 overflow-x-auto px-2 pb-2">
                {cuisineIcons.map((c) => (
                  <Link
                    key={c.label}
                    href={`/vendors`}
                    className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl px-3 py-2 text-center transition-colors hover:bg-warm-800"
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-xs font-medium text-warm-400">{c.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Live count */}
            {stats.liveCount > 0 && (
              <div className="animate-fade-in-up animate-delay-4 mt-6 flex items-center justify-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <span className="text-sm font-semibold text-red-400">
                  {stats.liveCount} van{stats.liveCount !== 1 ? 's' : ''} live now
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="border-b border-warm-800 bg-warm-900 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="mb-12 text-center text-2xl font-extrabold text-white sm:text-3xl">
            How It Works
          </h2>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              { icon: MapPin, title: 'Find', desc: 'See who\'s serving near you right now' },
              { icon: ShoppingBag, title: 'Order', desc: 'Browse the menu, pre-order for pickup' },
              { icon: Zap, title: 'Collect', desc: 'Skip the queue — hot, fresh, ready' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-warm-800 text-brand-400">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-warm-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vendors */}
      {vendors.length > 0 && (
        <section className="bg-warm-900 py-20">
          <div className="mx-auto max-w-7xl px-5">
            <h2 className="mb-10 text-center text-2xl font-extrabold text-white sm:text-3xl">
              Featured Vendors
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {vendors.map((v) => (
                <Link
                  key={v.id}
                  href={`${protocol}://${v.slug}.${rootDomain}`}
                  target="_blank"
                  className="card-hover group overflow-hidden rounded-2xl border border-warm-700/50 bg-warm-800 shadow-lg shadow-black/10 transition-all active:scale-[0.98]"
                >
                  {/* Gradient header using vendor color */}
                  <div
                    className="h-20 p-4 flex items-end"
                    style={{ background: `linear-gradient(135deg, ${v.primaryColor}40, ${v.primaryColor}10)` }}
                  >
                    {v.logo ? (
                      <img src={v.logo} alt="" className="h-11 w-11 rounded-xl object-cover ring-2 ring-warm-800" />
                    ) : (
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white ring-2 ring-warm-800"
                        style={{ backgroundColor: v.primaryColor }}
                      >
                        {v.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="truncate text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                      {v.name}
                    </h3>
                    {v.cuisineType && (
                      <span
                        className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${v.primaryColor}20`,
                          color: v.primaryColor,
                        }}
                      >
                        {v.cuisineType}
                      </span>
                    )}
                    {v.description && (
                      <p className="mt-2 text-sm text-warm-400 line-clamp-2 leading-relaxed">{v.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-warm-500">
                      {v._count.locations > 0 && (
                        <span>📍 {v._count.locations} location{v._count.locations !== 1 ? 's' : ''}</span>
                      )}
                      {v._count.vehicles > 0 && (
                        <span>🚐 {v._count.vehicles} van{v._count.vehicles !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className="rounded-lg px-4 py-2 text-xs font-bold text-white transition-colors"
                        style={{ backgroundColor: v.primaryColor }}
                      >
                        Visit →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/vendors" className="text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors">
                View all vendors →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats strip */}
      <section className="border-y border-warm-800 bg-warm-950 py-14">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-10 px-5 text-center">
          <div>
            <div className="text-3xl font-extrabold text-brand-400">{stats.vendorCount}</div>
            <div className="text-sm text-warm-500">Vendors</div>
          </div>
          <div className="h-8 w-px bg-warm-700" />
          <div>
            <div className="text-3xl font-extrabold text-brand-400">{stats.orderCount > 0 ? `${stats.orderCount.toLocaleString()}+` : '0'}</div>
            <div className="text-sm text-warm-500">Orders served</div>
          </div>
          <div className="h-8 w-px bg-warm-700" />
          <div>
            <div className="text-3xl font-extrabold text-brand-400">£0</div>
            <div className="text-sm text-warm-500">Commission</div>
          </div>
        </div>
      </section>

      {/* Map teaser */}
      <section className="bg-warm-900 py-20">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Explore the Map</h2>
          <p className="mt-3 text-warm-400">Find exactly who&apos;s serving, where they are, and what&apos;s on the menu.</p>
          <Link
            href="/discover"
            className="mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-brand-500 px-8 text-base font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors active:scale-[0.98]"
          >
            <Map className="h-5 w-5" />
            Open Map
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          VENDOR SECTION — Build trust, show depth
          ════════════════════════════════════════════════════ */}

      {/* Divider */}
      <section className="bg-warm-900 py-20 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-400">For Vendors</p>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Built for the Van Life
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-warm-400">
            Everything you need to look professional, manage your fleet, and grow — all in one platform.
          </p>
          <ChevronDown className="mx-auto mt-6 h-6 w-6 animate-bounce text-warm-600" />
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-warm-950 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Globe, title: 'Your Own Website', desc: 'Branded subdomain or custom domain. Looks professional — no design skills needed.' },
              { icon: Smartphone, title: 'Pre-Orders & Queue Management', desc: 'Customers order ahead with pickup codes. KDS on a tablet. No queues.' },
              { icon: Truck, title: 'Multi-Van Fleet', desc: 'Manage multiple vans with named drivers. Each van goes live independently.' },
              { icon: Calendar, title: 'Smart Scheduling', desc: 'Multi-stop routes, events, lunch & evening shifts. Customers always know where you are.' },
              { icon: BarChart3, title: 'Business Dashboard', desc: 'Orders, analytics, revenue tracking — all in one place.' },
              { icon: FileCheck, title: 'Document Vault', desc: 'MOT, insurance, food hygiene, gas certs. Stored, tracked, expiry alerts.' },
            ].map((f, i) => (
              <div key={i} className="card-hover rounded-2xl border border-warm-800 bg-warm-900 p-6 transition-colors hover:border-warm-700">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                  <f.icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="mb-1 font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-warm-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-warm-900 py-20 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            From <span className="text-brand-400">FREE</span>
          </h2>
          <p className="mt-3 text-warm-400">Start free. Upgrade when you grow. No commission, ever.</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/vendor-signup"
              className="flex h-14 items-center justify-center rounded-2xl bg-brand-500 px-8 text-base font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors active:scale-[0.98]"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/signin"
              className="flex h-14 items-center justify-center rounded-2xl border border-warm-700 px-8 text-base font-bold text-warm-200 hover:bg-warm-800 transition-colors active:scale-[0.98]"
            >
              Vendor Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-warm-950 py-20">
        <div className="mx-auto max-w-4xl px-5">
          <div className="rounded-3xl bg-gradient-to-br from-brand-500/10 to-orange-600/5 border border-warm-800 p-8 sm:p-12">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2979FF] text-2xl font-black text-white">
                J
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Joanna&apos;s Chippy Van</h3>
                <p className="text-sm text-brand-400">Fish &amp; Chips &middot; Ayrshire</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl bg-warm-800/50 p-4 text-center">
                <div className="text-2xl font-extrabold text-brand-400">3</div>
                <div className="text-xs text-warm-400">Vans on the road</div>
              </div>
              <div className="rounded-xl bg-warm-800/50 p-4 text-center">
                <div className="text-2xl font-extrabold text-brand-400">7 days</div>
                <div className="text-xs text-warm-400">Multi-stop routes</div>
              </div>
              <div className="rounded-xl bg-warm-800/50 p-4 text-center">
                <div className="text-2xl font-extrabold text-brand-400">Events</div>
                <div className="text-xs text-warm-400">Airshows &amp; festivals</div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-warm-300">
              &ldquo;PitchUp gives each of our vans their own live tracking and pre-order queue.
              Customers know exactly which van is where, and our drivers manage their own sessions.
              The document vault alone saved us hours before our last council inspection.&rdquo;
            </p>
            <Link
              href={`${protocol}://joannas-chippy.${rootDomain}`}
              target="_blank"
              className="mt-4 inline-block text-sm font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              See their page →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-warm-900 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="mb-10 text-center text-2xl font-extrabold text-white sm:text-3xl">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Do I need to take payment online?', a: 'No — customers pay at the van. Cash or card, your choice. No payment processing to set up.' },
              { q: 'Can I use my own domain?', a: 'Yes! Connect any domain you own. Your customers visit yourdomain.com and see your branded page.' },
              { q: 'How do my customers find me?', a: 'Via the PitchUp platform, your own shareable link, QR code on your van, or your custom domain. You choose.' },
              { q: 'What if I have multiple vans?', a: 'Full fleet management. Each van has its own name, routes, live sessions, and order queue. Drivers manage independently.' },
              { q: 'Is there a contract?', a: 'No contracts. Free tier is free forever. Pro is month-to-month, cancel anytime.' },
            ].map((faq, i) => (
              <details key={i} className={`animate-fade-in-up animate-delay-${i + 1} group rounded-2xl border border-warm-800 bg-warm-800/50 px-6 py-4`}>
                <summary className="flex cursor-pointer items-center justify-between font-bold text-white [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-warm-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-warm-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-orange-600 py-20 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="animate-fade-in-up text-3xl font-extrabold text-white sm:text-4xl">
            List Your Van — Free in 5 Minutes
          </h2>
          <p className="mt-3 text-brand-100/80">
            Join {stats.vendorCount > 0 ? stats.vendorCount : ''} vendors already on PitchUp.
          </p>
          <Link
            href="/auth/vendor-signup"
            className="animate-fade-in-up mt-8 inline-flex h-14 items-center justify-center rounded-2xl bg-white px-10 text-lg font-extrabold text-brand-700 shadow-lg active:scale-[0.98]"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </>
  )
}
