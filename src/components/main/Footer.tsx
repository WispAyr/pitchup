import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-warm-800 bg-warm-950 text-warm-400">
      <div className="mx-auto max-w-7xl px-5 py-12">
        {/* Vendor CTA banner */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-500/10 to-brand-600/5 border border-brand-500/20 p-6 text-center">
          <p className="text-sm font-bold text-white">Run a food truck?</p>
          <p className="mt-1 text-xs text-warm-400">List your van free in 5 minutes</p>
          <Link href="/auth/vendor-signup" className="mt-3 inline-flex h-10 items-center rounded-xl bg-brand-500 px-6 text-sm font-bold text-white hover:bg-brand-600 transition-colors">
            Get Started Free
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">P</div>
              <span className="text-base font-extrabold text-white">Pitch<span className="text-brand-400">Up</span></span>
            </Link>
            <p className="text-xs leading-relaxed text-warm-500">
              Find mobile food vendors near you. Pre-order, skip the queue.
            </p>
            <p className="mt-3 text-xs text-warm-600">Made in Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿</p>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-warm-500">Customers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/discover" className="hover:text-brand-400 transition-colors">Discover</Link></li>
              <li><Link href="/vendors" className="hover:text-brand-400 transition-colors">All Vendors</Link></li>
              <li><Link href="/events" className="hover:text-brand-400 transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-warm-500">Vendors</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/vendor-signup" className="hover:text-brand-400 transition-colors">List Your Van</Link></li>
              <li><Link href="/auth/signin" className="hover:text-brand-400 transition-colors">Vendor Sign In</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-warm-500">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signin" className="hover:text-brand-400 transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-brand-400 transition-colors">Sign Up</Link></li>
              <li><span className="text-warm-600 cursor-default">Privacy Policy</span></li>
              <li><span className="text-warm-600 cursor-default">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-warm-800 pt-6 text-center text-xs text-warm-600">
          &copy; {new Date().getFullYear()} PitchUp &mdash; Mobile Food, Sorted.
        </div>
      </div>
    </footer>
  )
}
