'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X, MapPin, Clock, Navigation, Bell, ShoppingBag, ChevronUp } from 'lucide-react'
import type { MapLocation, MapVendorInfo, MapSchedule } from './types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface BottomSheetProps {
  location: MapLocation | null
  vendor: MapVendorInfo
  onClose: () => void
  onFollow?: () => void
  userLocation?: [number, number] | null
}

function getNextSession(schedules: MapSchedule[]): { dayName: string; startTime: string; countdown: string } | null {
  if (schedules.length === 0) return null
  const now = new Date()
  const currentDay = now.getDay()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // Sort schedules by proximity from now
  type Candidate = { schedule: MapSchedule; daysAway: number; minutesTillStart: number }
  const candidates: Candidate[] = []

  for (const s of schedules) {
    const [h, m] = s.startTime.split(':').map(Number)
    const startMin = h * 60 + m
    let daysAway = s.dayOfWeek - currentDay
    if (daysAway < 0) daysAway += 7
    if (daysAway === 0 && startMin <= currentMinutes) daysAway = 7 // already passed today

    candidates.push({ schedule: s, daysAway, minutesTillStart: daysAway * 24 * 60 + (startMin - currentMinutes) })
  }

  candidates.sort((a, b) => a.minutesTillStart - b.minutesTillStart)
  const next = candidates[0]
  if (!next) return null

  const totalMin = next.minutesTillStart
  const days = Math.floor(totalMin / (24 * 60))
  const hours = Math.floor((totalMin % (24 * 60)) / 60)

  let countdown = ''
  if (days > 0) countdown += `${days}d `
  if (hours > 0) countdown += `${hours}h`
  if (days === 0 && hours === 0) countdown = 'Less than 1h'

  return {
    dayName: DAY_NAMES[next.schedule.dayOfWeek],
    startTime: next.schedule.startTime,
    countdown: countdown.trim(),
  }
}

function getDirectionsUrl(lat: number, lng: number, userLoc?: [number, number] | null): string {
  const isApple = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Mac/.test(navigator.userAgent) && !('chrome' in window)
  if (isApple) {
    return `https://maps.apple.com/?daddr=${lat},${lng}`
  }
  const origin = userLoc ? `&origin=${userLoc[1]},${userLoc[0]}` : ''
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${origin}`
}

export function BottomSheet({ location, vendor, onClose, onFollow, userLocation }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const isLive = !!location?.liveSession
  const nextSession = location ? getNextSession(location.schedules) : null

  // Reset expanded when location changes
  useEffect(() => {
    setExpanded(false)
  }, [location?.id])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Touch drag to dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY)
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = e.changedTouches[0].clientY - touchStart
    if (diff > 100) {
      if (expanded) setExpanded(false)
      else onClose()
    } else if (diff < -60) {
      setExpanded(true)
    }
    setTouchStart(null)
  }, [touchStart, expanded, onClose])

  if (!location) return null

  // Group schedules by day
  const scheduleByDay: Record<number, MapSchedule[]> = {}
  location.schedules.forEach((s) => {
    if (!scheduleByDay[s.dayOfWeek]) scheduleByDay[s.dayOfWeek] = []
    scheduleByDay[s.dayOfWeek].push(s)
  })

  const rootDomain = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000')
    : 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'

  return (
    <>
      {/* Backdrop — desktop only */}
      <div
        className="hidden md:block fixed inset-0 z-30"
        onClick={onClose}
      />

      {/* Sheet — bottom on mobile, sidebar on desktop */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`
          fixed z-40 bg-white shadow-2xl transition-all duration-300 ease-out animate-slide-up
          /* Mobile: bottom sheet */
          inset-x-0 bottom-0 rounded-t-2xl
          ${expanded ? 'max-h-[85vh]' : 'max-h-[55vh]'}
          /* Desktop: right sidebar */
          md:inset-x-auto md:bottom-auto md:top-0 md:right-0 md:h-full md:w-[400px] md:max-h-full md:rounded-none md:rounded-l-2xl
        `}
        style={{ 
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-2 md:pt-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 truncate">{location.name}</h3>
              {isLive && (
                <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            {location.address && (
              <p className="mt-0.5 text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                {location.address}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: 'calc(100% - 80px)' }}>
          {/* Next session / Live status */}
          {isLive ? (
            <div
              className="mt-3 rounded-xl p-4"
              style={{ backgroundColor: `${vendor.primaryColor}10` }}
            >
              <p className="text-sm font-semibold" style={{ color: vendor.primaryColor }}>
                🔴 Serving right now!
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Started at {new Date(location.liveSession!.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <a
                href={`${protocol}://${vendor.slug}.${rootDomain}/order?session=${location.liveSession!.id}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: vendor.primaryColor }}
              >
                <ShoppingBag className="h-4 w-4" />
                Order Now
              </a>
            </div>
          ) : nextSession ? (
            <div className="mt-3 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">Next session</span>
              </div>
              <p className="mt-1 text-sm text-gray-900">
                {nextSession.dayName} at {nextSession.startTime}
              </p>
              <p className="text-xs text-gray-500">In {nextSession.countdown}</p>
            </div>
          ) : null}

          {/* Schedule */}
          <div className="mt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 md:pointer-events-none"
            >
              <span>Weekly Schedule</span>
              <ChevronUp className={`h-4 w-4 text-gray-400 transition-transform md:hidden ${expanded ? '' : 'rotate-180'}`} />
            </button>
            <div className={`mt-2 space-y-1 ${expanded ? '' : 'hidden md:block'}`}>
              {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                const entries = scheduleByDay[day]
                const isToday = new Date().getDay() === day
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      isToday ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    <span className={isToday ? 'text-gray-900' : 'text-gray-500'}>
                      {DAY_SHORT[day]}
                      {isToday && <span className="ml-1 text-xs text-gray-400">(today)</span>}
                    </span>
                    {entries ? (
                      <span className="text-gray-700">
                        {entries.map((e) => `${e.startTime}–${e.endTime}`).join(', ')}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex gap-2">
            <a
              href={getDirectionsUrl(location.lat, location.lng, userLocation)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Directions
            </a>
            {onFollow && (
              <button
                onClick={onFollow}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: vendor.primaryColor }}
              >
                <Bell className="h-4 w-4" />
                Notify Me
              </button>
            )}
          </div>

          {/* Distance line (if user location available) */}
          {userLocation && (
            <p className="mt-3 text-center text-xs text-gray-400">
              {calculateDistance(userLocation[1], userLocation[0], location.lat, location.lng).toFixed(1)} miles away
            </p>
          )}
        </div>
      </div>
    </>
  )
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
