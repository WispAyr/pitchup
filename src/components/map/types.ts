export interface MapLocation {
  id: string
  name: string
  address?: string | null
  lat: number
  lng: number
  isRegular: boolean
  schedules: MapSchedule[]
  liveSession?: MapLiveSession | null
}

export interface MapSchedule {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface MapLiveSession {
  id: string
  startedAt: string
}

export interface MapVendorInfo {
  id: string
  name: string
  slug: string
  primaryColor: string
  secondaryColor: string
  cuisineType?: string | null
  logo?: string | null
}

export interface DiscoverVendor extends MapVendorInfo {
  locations: MapLocation[]
}

export type MapMode = 'vendor' | 'discover'
