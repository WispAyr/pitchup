'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

type Props = {
  preOrderingEnabled: boolean
  primaryColor: string
}

export function VendorLayoutClient({ preOrderingEnabled, primaryColor }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const navLinks = [
    { href: '/', label: 'Home', emoji: '🏠' },
    { href: '/menu', label: 'Menu', emoji: '🍔' },
    { href: '/schedule', label: 'Schedule', emoji: '📅' },
    { href: '/events', label: 'Events', emoji: '🎪' },
    { href: '/deals', label: 'Deals', emoji: '🔥' },
    { href: '/about', label: 'About', emoji: 'ℹ️' },
    { href: '/gallery', label: 'Gallery', emoji: '📸' },
    { href: '/enquire', label: 'Enquire', emoji: '💬' },
  ]

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 md:flex">
        {navLinks.slice(0, 5).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            {link.label}
          </Link>
        ))}
        {preOrderingEnabled && (
          <Link
            href="/order"
            className="ml-2 rounded-full px-5 py-2 text-sm font-bold text-white transition-all active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            Pre-Order
          </Link>
        )}
      </nav>

      {/* Mobile hamburger */}
      <button
        className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
      </button>

      {/* Mobile slide-out */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 top-[52px] z-50 bg-white shadow-xl md:hidden">
            <nav className="flex flex-col px-4 py-3 gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium text-gray-800 active:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-lg">{link.emoji}</span>
                  {link.label}
                </Link>
              ))}
              {preOrderingEnabled && (
                <Link
                  href="/order"
                  className="mt-2 flex h-12 items-center justify-center rounded-xl text-base font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => setOpen(false)}
                >
                  🛒 Pre-Order Now
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  )
}
