import Link from 'next/link'
import { MapPin, ShoppingBag, Zap, Globe, Smartphone, Truck, Calendar, BarChart3, FileCheck, Map, MessageSquare, PartyPopper, PiggyBank, ChevronDown, Star, Users, ShieldCheck } from 'lucide-react'
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
        _count: { select: { reviews: true, vehicles: true } },
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

  return (
    <>
      {/* ════════════════════════════════════════════════════
          CONSUMER SECTION — Find food fast
          ════════════════════════════════════════════════════ */}

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12),_transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:pb-24 sm:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="animate-fade-in-up text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Never Miss the{' '}
              <span className="text-brand-500">Van</span>{' '}
              Again
            </h1>
            <p className="animate-fade-in-up animate-delay-1 mx-auto mt-4 max-w-lg text-lg text-gray-500 sm:text-xl">
              Find mobile food vendors near you. Pre-order, skip the queue, eat great food.
            </p>

            {/* CTA */}
            <div className="animate-fade-in-up animate-delay-2 mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/discover"
                className="flex h-14 items-center justify-center rounded-2xl bg-brand-500 px-8 text-base font-bold text-white shadow-lg shadow-brand-500/20 active:scale-[0.98] sm:text-lg"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Find Food Near Me
              </Link>
              <Link
                href="/vendors"
                className="flex h-14 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-8 text-base font-bold text-gray-700 active:scale-[0.98] sm:text-lg"
              >
                Browse Vendors
              </Link>
            </div>

            {/* Live count */}
            {stats.liveCount > 0 && (
              <div className="animate-fade-in-up animate-delay-3 mt-6 flex items-center justify-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>
                <span className="text-sm font-semibold text-green-700">
                  {stats.liveCount} van{stats.liveCount !== 1 ? 's' : ''} serving right now
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="border-b border-gray-100 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="mb-10 text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
            How It Works
          </h2>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { icon: MapPin, title: 'Find', desc: 'See who\'s serving near you right now' },
              { icon: ShoppingBag, title: 'Order', desc: 'Browse the menu, pre-order for pickup' },
              { icon: Zap, title: 'Collect', desc: 'Skip the queue — hot, fresh, ready' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {i + 1}
                </div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vendors */}
      {vendors.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5">
            <h2 className="mb-8 text-center text-2xl font-extrabold text-gray-900 sm:text-3xl">
              Featured Vendors
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {vendors.map((v) => (
                <Link
                  key={v.id}
                  href={`${protocol}://${v.slug}.${rootDomain}`}
                  target="_blank"
                  className="card-hover group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all active:scale-[0.98] hover:shadow-md"
                >
                  {/* Brand bar */}
                  <div className="h-1.5" style={{ backgroundColor: v.primaryColor }} />
                  <div className="p-5">
                    <div className="mb-3 flex items-center gap-3">
                      {v.logo ? (
                        <img src={v.logo} alt="" className="h-11 w-11 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: v.primaryColor }}>
                          {v.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                          {v.name}
                        </h3>
                        {v.cuisineType && (
                          <span className="text-xs text-gray-500">{v.cuisineType}</span>
                        )}
                      </div>
                    </div>
                    {v.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{v.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                      {v._count.vehicles > 0 && (
                        <span>🚐 {v._count.vehicles} van{v._count.vehicles !== 1 ? 's' : ''}</span>
                      )}
                      {v._count.reviews > 0 && (
                        <span>⭐ {v._count.reviews} review{v._count.reviews !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/vendors" className="text-sm font-bold text-brand-600 hover:text-brand-700">
                View all vendors →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Social proof */}
      {stats.orderCount > 10 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-8 px-5 text-center">
            <div>
              <div className="text-3xl font-extrabold text-gray-900">{stats.orderCount.toLocaleString()}+</div>
              <div className="text-sm text-gray-500">Orders placed</div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="text-3xl font-extrabold text-gray-900">{stats.vendorCount}</div>
              <div className="text-sm text-gray-500">Vendors</div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <div className="text-3xl font-extrabold text-gray-900">£0</div>
              <div className="text-sm text-gray-500">Commission</div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════
          VENDOR SECTION — Build trust, show depth
          ════════════════════════════════════════════════════ */}

      {/* Divider */}
      <section className="bg-gradient-to-b from-white to-gray-900 py-20 text-center">
        <div className="mx-auto max-w-2xl px-5">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">For Vendors</p>
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Run a mobile food business?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-gray-500">
            Everything you need to look professional, manage your fleet, and grow — all in one platform.
          </p>
          <ChevronDown className="mx-auto mt-6 h-6 w-6 animate-bounce text-gray-400" />
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-gray-900 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Globe, title: 'Your Own Website', desc: 'Branded subdomain or custom domain. Looks professional — no design skills needed.' },
              { icon: Smartphone, title: 'Pre-Orders & Queue Management', desc: 'Customers order ahead with pickup codes. KDS on a tablet. No queues.' },
              { icon: Truck, title: 'Multi-Van Fleet', desc: 'Manage multiple vans with named drivers. Each van goes live independently.' },
              { icon: Calendar, title: 'Smart Scheduling', desc: 'Multi-stop routes, events, lunch & evening shifts. Customers always know where you are.' },
              { icon: BarChart3, title: 'Business Dashboard', desc: 'Orders, analytics, revenue tracking — all in one place.' },
              { icon: FileCheck, title: 'Document Vault', desc: 'MOT, insurance, food hygiene, gas certs. Stored, tracked, expiry alerts.' },
              { icon: Map, title: 'Beautiful Maps', desc: 'Your locations on gorgeous branded maps with live tracking for customers.' },
              { icon: MessageSquare, title: 'Social Content', desc: 'Generate ready-to-post graphics and schedule content. Built in.' },
              { icon: PartyPopper, title: 'Events', desc: 'Festivals, airshows, weddings — manage alongside your regular routes.' },
              { icon: PiggyBank, title: 'No Commission', desc: 'Pay-at-van model. No JustEat/Deliveroo cut. Your money stays yours.' },
            ].map((f, i) => (
              <div key={i} className="card-hover rounded-2xl bg-white/5 p-6 transition-colors hover:bg-white/10">
                <f.icon className="mb-3 h-6 w-6 text-brand-400" />
                <h3 className="mb-1 font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case study */}
      <section className="bg-gray-950 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-4xl px-5">
          <div className="rounded-3xl bg-gradient-to-br from-[#2979FF]/20 to-[#64B5F6]/10 p-8 sm:p-12">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2979FF] text-2xl font-black text-white">
                J
              </div>
              <div>
                <h3 className="text-xl font-extrabold">Joanna&apos;s Chippy Van</h3>
                <p className="text-sm text-[#64B5F6]">Fish &amp; Chips · Ayrshire</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-4 text-center">
                <div className="text-2xl font-extrabold">3</div>
                <div className="text-xs text-gray-400">Vans on the road</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center">
                <div className="text-2xl font-extrabold">7 days</div>
                <div className="text-xs text-gray-400">Multi-stop routes</div>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center">
                <div className="text-2xl font-extrabold">Events</div>
                <div className="text-xs text-gray-400">Airshows &amp; festivals</div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-gray-300">
              &ldquo;PitchUp gives each of our vans their own live tracking and pre-order queue. 
              Customers know exactly which van is where, and our drivers manage their own sessions. 
              The document vault alone saved us hours before our last council inspection.&rdquo;
            </p>
            <Link
              href={`${protocol}://joannas-chippy.${rootDomain}`}
              target="_blank"
              className="mt-4 inline-block text-sm font-bold text-[#64B5F6] hover:text-white transition-colors"
            >
              See their page →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-900 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="mb-3 text-center text-2xl font-extrabold sm:text-3xl">Simple Pricing</h2>
          <p className="mb-10 text-center text-gray-400">Start free. Upgrade when you grow.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Free */}
            <div className="card-hover animate-fade-in-up rounded-2xl border border-gray-800 bg-gray-950 p-6">
              <h3 className="text-lg font-bold">Starter</h3>
              <div className="mt-2 text-3xl font-extrabold">Free</div>
              <ul className="mt-6 space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> 1 van</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> Branded website</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> Schedule &amp; map</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> 50 pre-orders/month</li>
              </ul>
              <Link href="/auth/vendor-signup" className="mt-6 flex h-12 items-center justify-center rounded-xl border border-gray-700 font-bold text-white hover:bg-gray-800 transition-colors">
                Get Started
              </Link>
            </div>
            {/* Pro */}
            <div className="card-hover animate-fade-in-up animate-delay-1 rounded-2xl border-2 border-brand-500 bg-gray-950 p-6 ring-1 ring-brand-500/20">
              <div className="mb-2 inline-block rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-400">Most Popular</div>
              <h3 className="text-lg font-bold">Pro</h3>
              <div className="mt-2"><span className="text-3xl font-extrabold">£29</span><span className="text-gray-500">/mo</span></div>
              <ul className="mt-6 space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> Unlimited vans</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> Fleet management</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> Document vault</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> Events &amp; custom domain</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> Unlimited pre-orders</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" /> Analytics dashboard</li>
              </ul>
              <Link href="/auth/vendor-signup" className="mt-6 flex h-12 items-center justify-center rounded-xl bg-brand-500 font-bold text-white hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20">
                Start Free Trial
              </Link>
            </div>
            {/* Enterprise */}
            <div className="card-hover animate-fade-in-up animate-delay-2 rounded-2xl border border-gray-800 bg-gray-950 p-6">
              <h3 className="text-lg font-bold">Enterprise</h3>
              <div className="mt-2 text-3xl font-extrabold">Custom</div>
              <ul className="mt-6 space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> Multi-brand</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> API access</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> POS integration</li>
                <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> Priority support</li>
              </ul>
              <Link href="mailto:hello@local-connect.uk" className="mt-6 flex h-12 items-center justify-center rounded-xl border border-gray-700 font-bold text-white hover:bg-gray-800 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-950 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="mb-10 text-center text-2xl font-extrabold sm:text-3xl">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'Do I need to take payment online?', a: 'No — customers pay at the van. Cash or card, your choice. No payment processing to set up.' },
              { q: 'Can I use my own domain?', a: 'Yes! Connect any domain you own. Your customers visit yourdomain.com and see your branded page.' },
              { q: 'How do my customers find me?', a: 'Via the PitchUp platform, your own shareable link, QR code on your van, or your custom domain. You choose.' },
              { q: 'What if I have multiple vans?', a: 'Full fleet management. Each van has its own name, routes, live sessions, and order queue. Drivers manage independently.' },
              { q: 'Is there a contract?', a: 'No contracts. Free tier is free forever. Pro is month-to-month, cancel anytime.' },
            ].map((faq, i) => (
              <details key={i} className={`animate-fade-in-up animate-delay-${i + 1} group rounded-2xl border border-gray-800 bg-gray-900/50 px-6 py-4`}>
                <summary className="flex cursor-pointer items-center justify-between font-bold text-white [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-500 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-5">
          <h2 className="animate-fade-in-up text-3xl font-extrabold text-white sm:text-4xl">
            List Your Van — Free in 5 Minutes
          </h2>
          <p className="mt-3 text-brand-100">
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
