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
  locationName: string
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

type Props = {
  schedulesByDay: DaySchedule[]
  locations: LocationMarker[]
  activeSession: { locationName: string; lat: number; lng: number } | null
}

export function SchedulePageClient({ schedulesByDay, locations, activeSession }: Props) {
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

      {/* Weekly calendar */}
      <div className="space-y-2">
        {schedulesByDay.map((day) => {
          const isToday = day.dayIndex === today
          return (
            <div
              key={day.day}
              className={`rounded-xl border p-4 transition-colors ${
                isToday
                  ? 'border-2 bg-white shadow-sm'
                  : 'border-gray-100 bg-white'
              }`}
              style={isToday ? { borderColor: vendor.primaryColor } : undefined}
            >
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-bold sm:text-base ${
                    isToday ? '' : 'text-gray-900'
                  }`}
                  style={isToday ? { color: vendor.primaryColor } : undefined}
                >
                  {day.day}
                  {isToday && (
                    <span
                      className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: vendor.primaryColor }}
                    >
                      TODAY
                    </span>
                  )}
                </h3>
              </div>

              {day.entries.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {day.entries.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {entry.startTime} - {entry.endTime}
                      </span>
                      <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="text-gray-600">{entry.locationName}</span>
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
    </div>
  )
}
