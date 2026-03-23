'use client'

import { DynamicVendorMap } from '@/components/map/DynamicVendorMap'
import type { MapLocation, MapVendorInfo, MapPreset } from '@/components/map/types'

interface VendorMapSectionProps {
  vendor: {
    id: string
    slug: string
    name: string
    primaryColor: string
    secondaryColor: string
    cuisineType?: string | null
    logo?: string | null
    mapPreset?: string
    mapVisible?: boolean
    mapDefaultZoom?: number
    locations: Array<{
      id: string
      name: string
      address?: string | null
      lat: number
      lng: number
      isRegular: boolean
      schedules: Array<{
        id: string
        dayOfWeek: number
        startTime: string
        endTime: string
      }>
      liveSessions: Array<{
        id: string
        startedAt: Date
      }>
    }>
  }
}

export function VendorMapSection({ vendor }: VendorMapSectionProps) {
  if (vendor.mapVisible === false || !vendor.locations?.length) return null

  const vendorInfo: MapVendorInfo = {
    id: vendor.id,
    slug: vendor.slug,
    name: vendor.name,
    primaryColor: vendor.primaryColor,
    secondaryColor: vendor.secondaryColor,
    cuisineType: vendor.cuisineType,
    logo: vendor.logo,
  }

  const locations: MapLocation[] = vendor.locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    address: loc.address,
    lat: loc.lat,
    lng: loc.lng,
    isRegular: loc.isRegular,
    schedules: loc.schedules,
    liveSession: loc.liveSessions[0]
      ? { id: loc.liveSessions[0].id, startedAt: loc.liveSessions[0].startedAt.toISOString?.() ?? String(loc.liveSessions[0].startedAt) }
      : null,
  }))

  return (
    <section className="border-b border-gray-100 animate-fade-in-up">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-3 text-xl font-extrabold text-gray-900">Find Us</h2>
        <DynamicVendorMap
          vendor={vendorInfo}
          locations={locations}
          preset={(vendor.mapPreset as MapPreset) || 'light'}
          defaultZoom={vendor.mapDefaultZoom || 12}
          showMap={true}
          className="h-[350px] sm:h-[450px]"
        />
      </div>
    </section>
  )
}
