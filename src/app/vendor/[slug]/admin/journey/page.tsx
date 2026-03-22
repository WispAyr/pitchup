'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Clock, Truck, ChevronLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'

const JourneyMap = dynamic(() => import('./JourneyMap'), { ssr: false })

type Location = { id: string; name: string; address: string | null; lat: number; lng: number }
type Schedule = { id: string; locationId: string; dayOfWeek: number; startTime: string; endTime: string; location: Location }
type Vehicle = { id: string; name: string; registration: string | null; status: string }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function estimateTravel(lat1: number, lng1: number, lat2: number, lng2: number) {
  // Haversine distance in km, rough drive time at 40km/h avg
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const minutes = Math.round((dist / 40) * 60) // 40km/h average
  return { distKm: Math.round(dist * 10) / 10, minutes }
}

export default function JourneyPage() {
  const params = useParams()
  const slug = params.slug as string
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedDay, setSelectedDay] = useState(new Date().getDay())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/vendor/${slug}/vehicles`).then(r => r.ok ? r.json() : []),
      fetch(`/api/vendor/${slug}/schedules`).then(r => r.ok ? r.json() : []),
    ]).then(([v, s]) => {
      setVehicles(v)
      setSchedules(s)
      setLoading(false)
    })
  }, [])

  const daySchedules = useMemo(
    () => schedules.filter(s => s.dayOfWeek === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedules, selectedDay]
  )

  const journeyLegs = useMemo(() => {
    if (daySchedules.length < 2) return []
    return daySchedules.slice(1).map((s, i) => {
      const prev = daySchedules[i]
      const travel = estimateTravel(prev.location.lat, prev.location.lng, s.location.lat, s.location.lng)
      // Suggest departure: startTime of next minus travel time
      const [h, m] = s.startTime.split(':').map(Number)
      const arrivalMin = h * 60 + m
      const departMin = arrivalMin - travel.minutes - 15 // 15 min buffer
      const departH = Math.floor(departMin / 60)
      const departM = departMin % 60
      return {
        from: prev.location,
        to: s.location,
        ...travel,
        suggestedDepart: `${String(departH).padStart(2, '0')}:${String(Math.max(0, departM)).padStart(2, '0')}`,
      }
    })
  }, [daySchedules])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journey Planner</h1>
        <p className="mt-1 text-sm text-gray-500">Plan routes between your locations</p>
      </div>

      {/* Day selector */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => setSelectedDay((selectedDay + 6) % 7)} className="rounded-lg p-2 hover:bg-gray-100">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1 overflow-x-auto">
          {DAYS.map((day, i) => (
            <button key={i} onClick={() => setSelectedDay(i)} className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${selectedDay === i ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
        <button onClick={() => setSelectedDay((selectedDay + 1) % 7)} className="rounded-lg p-2 hover:bg-gray-100">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-400">Loading...</p>
      ) : daySchedules.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No locations on {DAYS[selectedDay]}</p>
          <p className="mt-1 text-sm text-gray-400">Add schedules to see journey planning</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Schedule list */}
          <div className="space-y-3">
            {daySchedules.map((s, i) => (
              <div key={s.id}>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">{i + 1}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{s.location.name}</h3>
                      <p className="text-xs text-gray-500">{s.startTime} – {s.endTime}{s.location.address ? ` · ${s.location.address}` : ''}</p>
                    </div>
                  </div>
                </div>
                {/* Travel leg */}
                {i < journeyLegs.length && (
                  <div className="my-2 ml-4 flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-2.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div className="text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{journeyLegs[i].distKm} km</span> · ~{journeyLegs[i].minutes} min drive
                      <span className="ml-2 font-medium text-blue-600">Leave by {journeyLegs[i].suggestedDepart}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {vehicles.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <h4 className="mb-2 text-xs font-semibold uppercase text-gray-400">Available Vehicles</h4>
                <div className="flex flex-wrap gap-2">
                  {vehicles.filter(v => v.status === 'active').map(v => (
                    <span key={v.id} className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      <Truck className="h-3 w-3" /> {v.name}{v.registration ? ` (${v.registration})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="h-[400px] rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <JourneyMap locations={daySchedules.map(s => s.location)} />
          </div>
        </div>
      )}
    </div>
  )
}
