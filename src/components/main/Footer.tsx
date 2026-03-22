import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-sm">
                P
              </div>
              <span className="text-lg font-bold text-white">
                Pitch<span className="text-brand-400">Up</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Find mobile food vendors near you. Pre-order, skip the queue, enjoy great food.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/discover" className="text-sm hover:text-brand-400 transition-colors">
                  Discover
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="text-sm hover:text-brand-400 transition-colors">
                  Vendor Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              For Vendors
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/vendor-signup"
                  className="text-sm hover:text-brand-400 transition-colors"
                >
                  List Your Van
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="text-sm hover:text-brand-400 transition-colors">
                  Vendor Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/signin" className="text-sm hover:text-brand-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-sm hover:text-brand-400 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 PitchUp &mdash; Mobile Food, Sorted.
          </p>
        </div>
      </div>
    </footer>
  )
}
