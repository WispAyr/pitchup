'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LiveMapProps {
  lat: number
  lng: number
  onMapClick: (lat: number, lng: number) => void
  interactive: boolean
}

export default function LiveMap({ lat, lng, onMapClick, interactive }: LiveMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Fix default icon
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current)

      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current)

      if (interactive) {
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          const { lat: clickLat, lng: clickLng } = e.latlng
          if (markerRef.current) {
            markerRef.current.setLatLng([clickLat, clickLng])
          }
          onMapClick(clickLat, clickLng)
        })
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update marker position when lat/lng changes
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.setView([lat, lng], mapRef.current.getZoom())
    }
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      className="h-[300px] w-full rounded-xl"
      style={{ zIndex: 0 }}
    />
  )
}
