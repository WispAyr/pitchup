import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold text-white">P</div>
              <span className="text-base font-extrabold text-white">Pitch<span className="text-brand-400">Up</span></span>
            </Link>
            <p className="text-xs leading-relaxed text-gray-500">
              Find mobile food vendors near you. Pre-order, skip the queue.
            </p>
            <p className="mt-3 text-xs text-gray-600">Made in Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿</p>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Customers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/discover" className="hover:text-white transition-colors">Discover</Link></li>
              <li><Link href="/vendors" className="hover:text-white transition-colors">All Vendors</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Vendors</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/vendor-signup" className="hover:text-white transition-colors">List Your Van</Link></li>
              <li><Link href="/auth/signin" className="hover:text-white transition-colors">Vendor Sign In</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/signin" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} PitchUp — Mobile Food, Sorted.
        </div>
      </div>
    </footer>
  )
}
