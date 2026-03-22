'use client'

import dynamic from 'next/dynamic'
import type { MapLocation, MapVendorInfo, MapPreset, DiscoverVendor } from './types'

const LoadingSkeleton = () => (
  <div className="h-full w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center" style={{ minHeight: '400px' }}>
    <div className="flex flex-col items-center gap-2">
      <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin" />
      <p className="text-sm text-gray-400">Loading map...</p>
    </div>
  </div>
)

export const DynamicVendorMap = dynamic(
  () => import('./VendorMap').then((mod) => mod.VendorMap),
  { ssr: false, loading: LoadingSkeleton },
)

export const DynamicDiscoverMap = dynamic(
  () => import('./VendorMap').then((mod) => mod.DiscoverMap),
  { ssr: false, loading: LoadingSkeleton },
)
