'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons for webpack/next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LiveVendor {
  id: string
  name: string
  slug: string
  cuisineType: string | null
  lat: number
  lng: number
  primaryColor: string
  locationName: string
}

interface LiveMapProps {
  vendors: LiveVendor[]
  center?: [number, number]
  zoom?: number
}

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px;
      height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  })
}

export default function LiveMap({
  vendors,
  center = [55.46, -4.63],
  zoom = 11,
}: LiveMapProps) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-xl"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {vendors.map((vendor) => (
        <Marker
          key={vendor.id}
          position={[vendor.lat, vendor.lng]}
          icon={createColoredIcon(vendor.primaryColor)}
        >
          <Popup>
            <div className="text-center min-w-[140px]">
              <h3 className="font-bold text-gray-900 text-sm mb-1">{vendor.name}</h3>
              {vendor.cuisineType && (
                <p className="text-xs text-gray-500 mb-1">{vendor.cuisineType}</p>
              )}
              <p className="text-xs text-gray-400 mb-2">{vendor.locationName}</p>
              <a
                href={`${protocol}://${vendor.slug}.${rootDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
              >
                View Menu
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
