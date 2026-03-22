'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const liveIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -40],
  className: 'hue-rotate-[120deg]',
})

type Props = {
  locations: { id: string; name: string; lat: number; lng: number }[]
  activeSession: { locationName: string; lat: number; lng: number } | null
}

export function ScheduleMap({ locations, activeSession }: Props) {
  const allPoints = [
    ...locations.map((l) => [l.lat, l.lng] as [number, number]),
    ...(activeSession ? [[activeSession.lat, activeSession.lng] as [number, number]] : []),
  ]

  const center: [number, number] = allPoints.length > 0
    ? [
        allPoints.reduce((s, p) => s + p[0], 0) / allPoints.length,
        allPoints.reduce((s, p) => s + p[1], 0) / allPoints.length,
      ]
    : [51.5, -0.1]

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-64 w-full sm:h-80"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={defaultIcon}>
          <Popup>{loc.name}</Popup>
        </Marker>
      ))}

      {activeSession && (
        <Marker
          position={[activeSession.lat, activeSession.lng]}
          icon={liveIcon}
        >
          <Popup>
            <strong>LIVE NOW</strong>
            <br />
            {activeSession.locationName}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
