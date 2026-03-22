'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Monitor, ShoppingBag, Calendar, Route,
  Flame, Ticket, Share2, PartyPopper,
  Truck, FileCheck, Wrench, MessageSquare,
  Settings, Palette, Globe,
  LogOut, Menu, X, ExternalLink, Radio,
  UtensilsCrossed, Image, MapPin, BarChart3,
  ChevronDown,
} from 'lucide-react'

type SidebarProps = {
  vendorSlug: string
  vendorName: string
  primaryColor: string
}

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard', href: '', icon: LayoutDashboard },
      { label: 'Live / KDS', href: '/live', icon: Monitor },
      { label: 'Go Live', href: '/go-live', icon: Radio },
      { label: 'Orders', href: '/orders', icon: ShoppingBag },
      { label: 'Menu', href: '/menu', icon: UtensilsCrossed },
      { label: 'Schedule', href: '/schedule', icon: Calendar },
      { label: 'Routes', href: '/routes', icon: Route },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Deals', href: '/deals', icon: Flame },
      { label: 'Vouchers', href: '/vouchers', icon: Ticket },
      { label: 'Social Posts', href: '/social', icon: Share2 },
      { label: 'Events', href: '/events', icon: PartyPopper },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Fleet', href: '/fleet', icon: Truck },
      { label: 'Documents', href: '/documents', icon: FileCheck },
      { label: 'Maintenance', href: '/maintenance', icon: Wrench },
      { label: 'Enquiries', href: '/enquiries', icon: MessageSquare },
      { label: 'Gallery', href: '/gallery', icon: Image },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Profile & Branding', href: '/settings', icon: Settings },
    ],
  },
]

export default function Sidebar({ vendorSlug, vendorName, primaryColor }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const basePath = `/vendor/${vendorSlug}/admin`

  const isActive = (href: string) => {
    const fullPath = `${basePath}${href}`
    if (href === '') return pathname === basePath
    return pathname.startsWith(fullPath)
  }

  const nav = (
    <>
      {/* Brand */}
      <div className={`p-4 border-b border-gray-100 ${collapsed ? 'px-2' : ''}`}>
        <Link href={basePath} className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white font-bold shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            {vendorName.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{vendorName}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={`${basePath}${item.href}`}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                    style={active ? { backgroundColor: primaryColor } : undefined}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-2 space-y-0.5">
        <Link
          href={`/vendor/${vendorSlug}`}
          target="_blank"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'View Public Page' : undefined}
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          {!collapsed && 'View Public Page'}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-4 left-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r border-gray-100 bg-white transition-all lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-16' : 'w-64'}`}
      >
        {nav}
      </aside>
    </>
  )
}
