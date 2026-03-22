'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [open, setOpen] = useState(false)

  // Lock body scroll when menu open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-base">
              P
            </div>
            <span className="text-lg font-extrabold text-gray-900">
              Pitch<span className="text-brand-500">Up</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/discover" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              Discover
            </Link>
            <Link href="/vendors" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              Vendors
            </Link>
            <Link href="/events" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              Events
            </Link>
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/auth/signin" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600 transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>

          {/* Mobile hamburger - 44px touch target */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-700 active:bg-gray-100 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-out overlay */}
      {open && (
        <>
          <div className="fixed inset-0 top-14 z-40 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 top-14 z-50 bg-white shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col px-4 py-3 gap-1">
              <Link href="/discover" onClick={() => setOpen(false)}
                className="flex items-center rounded-xl px-4 py-3.5 text-base font-medium text-gray-800 active:bg-gray-50">
                🗺️ Discover
              </Link>
              <Link href="/vendors" onClick={() => setOpen(false)}
                className="flex items-center rounded-xl px-4 py-3.5 text-base font-medium text-gray-800 active:bg-gray-50">
                🚐 Vendors
              </Link>
              <Link href="/events" onClick={() => setOpen(false)}
                className="flex items-center rounded-xl px-4 py-3.5 text-base font-medium text-gray-800 active:bg-gray-50">
                📅 Events
              </Link>

              <div className="my-2 border-t border-gray-100" />

              <Link href="/auth/signin" onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-base font-semibold text-gray-700 active:bg-gray-50">
                Sign In
              </Link>
              <Link href="/auth/signup" onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl bg-brand-500 px-4 py-3 text-base font-bold text-white active:bg-brand-600">
                Sign Up
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
