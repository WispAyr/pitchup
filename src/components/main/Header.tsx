'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const navLinks = [
    { href: '/discover', label: 'Discover', emoji: '🗺️' },
    { href: '/vendors', label: 'Vendors', emoji: '🚐' },
    { href: '/events', label: 'Events', emoji: '📅' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-warm-700/50 bg-warm-900/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-base">
              P
            </div>
            <span className="text-lg font-extrabold text-white">
              Pitch<span className="text-brand-400">Up</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-warm-800 text-brand-400'
                    : 'text-warm-300 hover:bg-warm-800 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/auth/signin" className="rounded-lg px-4 py-2 text-sm font-medium text-warm-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-hover rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20">
              Sign Up
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl text-warm-300 active:bg-warm-800 md:hidden"
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
          <div className="fixed inset-0 top-14 z-40 bg-black/50 md:hidden transition-opacity duration-200" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 top-14 z-50 bg-warm-900 border-b border-warm-700/50 shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-xl px-4 py-3.5 text-base font-medium active:bg-warm-800 ${
                    pathname === link.href ? 'text-brand-400' : 'text-warm-200'
                  }`}
                >
                  {link.emoji} <span className="ml-2">{link.label}</span>
                </Link>
              ))}

              <div className="my-2 border-t border-warm-700/50" />

              <Link href="/auth/signin" onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-xl border border-warm-700 px-4 py-3 text-base font-semibold text-warm-200 active:bg-warm-800">
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
