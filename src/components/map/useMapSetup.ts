import { useRef, useEffect, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import type { MapPreset } from './mapStyle'
import { generateMapStyle } from './mapStyle'

interface UseMapSetupOptions {
  container: React.RefObject<HTMLDivElement>
  preset: MapPreset
  primaryColor: string
  secondaryColor: string
  center?: [number, number]
  zoom?: number
}

export function useMapSetup({
  container,
  preset,
  primaryColor,
  secondaryColor,
  center = [-4.63, 55.46], // Ayr default
  zoom = 11,
}: UseMapSetupOptions) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!container.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: container.current,
      style: generateMapStyle(preset, primaryColor, secondaryColor),
      center,
      zoom,
      attributionControl: false,
      maxZoom: 18,
      minZoom: 2,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      setReady(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      setReady(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update style when preset/colors change
  useEffect(() => {
    if (!mapRef.current || !ready) return
    mapRef.current.setStyle(generateMapStyle(preset, primaryColor, secondaryColor))
  }, [preset, primaryColor, secondaryColor, ready])

  const flyTo = useCallback((lng: number, lat: number, z?: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: z ?? 14, duration: 1200 })
  }, [])

  const fitBounds = useCallback((coords: [number, number][], padding = 60, lockBounds = true) => {
    if (!mapRef.current || coords.length === 0) return
    if (coords.length === 1) {
      mapRef.current.flyTo({ center: coords[0], zoom: 14, duration: 1200 })
      if (lockBounds) {
        const b = new maplibregl.LngLatBounds(coords[0], coords[0])
        b.extend([coords[0][0] - 0.05, coords[0][1] - 0.05])
        b.extend([coords[0][0] + 0.05, coords[0][1] + 0.05])
        mapRef.current.setMaxBounds(b)
      }
      return
    }
    const bounds = new maplibregl.LngLatBounds(coords[0], coords[0])
    coords.forEach((c) => bounds.extend(c))
    mapRef.current.fitBounds(bounds, { padding, duration: 1200, maxZoom: 15 })
    if (lockBounds) {
      // Add some padding to the max bounds so users can pan slightly but not scroll to the whole UK
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()
      const lngPad = (ne.lng - sw.lng) * 0.3
      const latPad = (ne.lat - sw.lat) * 0.3
      const maxBounds = new maplibregl.LngLatBounds(
        [sw.lng - lngPad, sw.lat - latPad],
        [ne.lng + lngPad, ne.lat + latPad]
      )
      mapRef.current.setMaxBounds(maxBounds)
    }
  }, [])

  return { map: mapRef, ready, flyTo, fitBounds }
}
