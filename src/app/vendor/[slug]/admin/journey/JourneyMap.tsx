'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

type Location = { id: string; name: string; lat: number; lng: number }

export default function JourneyMap({ locations }: { locations: Location[] }) {
  if (locations.length === 0) return <div className="flex h-full items-center justify-center bg-gray-50 text-gray-400">No locations</div>

  const center: [number, number] = [
    locations.reduce((s, l) => s + l.lat, 0) / locations.length,
    locations.reduce((s, l) => s + l.lng, 0) / locations.length,
  ]

  const positions: [number, number][] = locations.map(l => [l.lat, l.lng])

  return (
    <MapContainer center={center} zoom={10} className="h-full w-full" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, i) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]}>
          <Popup><strong>{i + 1}. {loc.name}</strong></Popup>
        </Marker>
      ))}
      {positions.length > 1 && (
        <Polyline positions={positions} color="#1f2937" weight={3} dashArray="8 4" />
      )}
    </MapContainer>
  )
}
