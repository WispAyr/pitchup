'use client'
import { createContext, useContext } from 'react'

type LiveSessionInfo = {
  id: string
  vehicleName: string | null
  locationName: string
  lat: number
  lng: number
}

type VendorData = {
  id: string
  slug: string
  name: string
  description: string | null
  logo: string | null
  banner: string | null
  primaryColor: string
  secondaryColor: string
  cuisineType: string | null
  phone: string | null
  email: string
  website: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  twitter: string | null
  preOrderingEnabled: boolean
  templateId: string
  isLive: boolean
  liveSessionCount?: number
  liveSessions?: LiveSessionInfo[]
  liveLocation?: { name: string; lat: number; lng: number } | null
}

const VendorContext = createContext<VendorData | null>(null)

export type { VendorData, LiveSessionInfo }

export function VendorProvider({ vendor, children }: { vendor: VendorData; children: React.ReactNode }) {
  return <VendorContext.Provider value={vendor}>{children}</VendorContext.Provider>
}

export function useVendor() {
  const ctx = useContext(VendorContext)
  if (!ctx) throw new Error('useVendor must be used within VendorProvider')
  return ctx
}
