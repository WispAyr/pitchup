'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

type Props = {
  preOrderingEnabled: boolean
  primaryColor: string
}

export function VendorLayoutClient({ preOrderingEnabled, primaryColor }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/about', label: 'About' },
  ]

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-6 md:flex">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            {link.label}
          </Link>
        ))}
        {preOrderingEnabled && (
          <Link
            href="/order"
            className="rounded-full px-5 py-2 text-sm font-bold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            Order Now
          </Link>
        )}
      </nav>

      {/* Mobile menu button */}
      <button
        className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-gray-100 bg-white p-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {preOrderingEnabled && (
              <Link
                href="/order"
                className="mt-2 rounded-full px-5 py-3 text-center text-sm font-bold text-white"
                style={{ backgroundColor: primaryColor }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Order Now
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  )
}
