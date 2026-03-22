'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Clock } from 'lucide-react'
import { useVendor } from '@/lib/vendor-context'

const ScheduleMap = dynamic(() => import('./schedule-map').then((m) => m.ScheduleMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl bg-gray-100">
      <p className="text-sm text-gray-400">Loading map...</p>
    </div>
  ),
})

type ScheduleEntry = {
  id: string
  startTime: string
  endTime: string
  locationName: string; locationAddress?: string | null
  lat: number
  lng: number
}

type DaySchedule = {
  day: string
  dayIndex: number
  entries: ScheduleEntry[]
}

type LocationMarker = {
  id: string
  name: string
  lat: number
  lng: number
}

type RouteData = {
  id: string
  name: string
  dayOfWeek: number
  vehicleName: string | null
  stops: { id: string; locationName: string; locationAddress?: string | null; startTime: string; endTime: string; lat: number; lng: number }[]
}

type Props = {
  schedulesByDay: DaySchedule[]
  locations: LocationMarker[]
  routes?: RouteData[]
  activeSession: { locationName: string; locationAddress?: string | null; lat: number; lng: number } | null
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')}${suffix}`
}

export function SchedulePageClient({ schedulesByDay, locations, routes = [], activeSession }: Props) {
  const vendor = useVendor()
  const today = useMemo(() => new Date().getDay(), [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Schedule</h1>

      {/* Live banner */}
      {activeSession && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
          </span>
          <div>
            <p className="font-semibold text-green-800">
              Currently live at {activeSession.locationName}
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      {locations.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
          <ScheduleMap locations={locations} activeSession={activeSession} />
        </div>
      )}

      {/* Routes by day */}
      {routes.length > 0 && (
        <div className="space-y-2">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const dayRoutes = routes.filter(r => r.dayOfWeek === dayIndex)
            const dayScheduleEntries = schedulesByDay.find(d => d.dayIndex === dayIndex)?.entries || []
            if (dayRoutes.length === 0 && dayScheduleEntries.length === 0) return null
            const isToday = dayIndex === today
            return (
              <div
                key={dayName}
                className={`rounded-xl border p-4 transition-colors ${
                  isToday ? 'border-2 bg-white shadow-sm' : 'border-gray-100 bg-white'
                }`}
                style={isToday ? { borderColor: vendor.primaryColor } : undefined}
              >
                <h3
                  className={`text-sm font-bold sm:text-base ${isToday ? '' : 'text-gray-900'}`}
                  style={isToday ? { color: vendor.primaryColor } : undefined}
                >
                  {dayName}
                  {isToday && (
                    <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: vendor.primaryColor }}>
                      TODAY
                    </span>
                  )}
                </h3>

                {/* Routes */}
                {dayRoutes.map(route => (
                  <div key={route.id} className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🚐</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {route.vehicleName || route.name}
                      </span>
                    </div>
                    <div className="space-y-1 pl-7">
                      {route.stops.map(stop => (
                        <div key={stop.id} className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          <span className="text-gray-600">{stop.locationName}</span>{stop.locationAddress && <span className="text-xs text-gray-400 block">{stop.locationAddress}</span>}
                          <span className="text-gray-400">—</span>
                          <span className="font-medium text-gray-700">{formatTime(stop.startTime)}-{formatTime(stop.endTime)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Legacy schedule entries (non-route) */}
                {dayRoutes.length === 0 && dayScheduleEntries.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {dayScheduleEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 text-sm">
                        <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="font-medium text-gray-700">{entry.startTime} - {entry.endTime}</span>
                        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-600">{entry.locationName}</span>{entry.locationAddress && <span className="text-xs text-gray-400 block">{entry.locationAddress}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {dayRoutes.length === 0 && dayScheduleEntries.length === 0 && (
                  <p className="mt-1 text-xs text-gray-400">No scheduled appearances</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Fallback: old weekly calendar if no routes */}
      {routes.length === 0 && (
        <div className="space-y-2">
          {schedulesByDay.map((day) => {
            const isToday = day.dayIndex === today
            return (
              <div
                key={day.day}
                className={`rounded-xl border p-4 transition-colors ${
                  isToday ? 'border-2 bg-white shadow-sm' : 'border-gray-100 bg-white'
                }`}
                style={isToday ? { borderColor: vendor.primaryColor } : undefined}
              >
                <h3
                  className={`text-sm font-bold sm:text-base ${isToday ? '' : 'text-gray-900'}`}
                  style={isToday ? { color: vendor.primaryColor } : undefined}
                >
                  {day.day}
                  {isToday && (
                    <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: vendor.primaryColor }}>
                      TODAY
                    </span>
                  )}
                </h3>
                {day.entries.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {day.entries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3 text-sm">
                        <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="font-medium text-gray-700">{entry.startTime} - {entry.endTime}</span>
                        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="text-gray-600">{entry.locationName}</span>{entry.locationAddress && <span className="text-xs text-gray-400 block">{entry.locationAddress}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">No scheduled appearances</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
