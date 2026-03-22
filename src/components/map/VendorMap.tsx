'use client'

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Supercluster from 'supercluster'
import type { MapPreset } from './mapStyle'
import type { MapLocation, MapVendorInfo, DiscoverVendor } from './types'
import { useMapSetup } from './useMapSetup'
import { LocationMarker, ClusterMarker } from './LocationMarker'
import { BottomSheet } from './BottomSheet'
import { DiscoverFilterBar, type DiscoverFilters } from './DiscoverFilters'

// ─── Marker CSS (injected once) ─────────────────────────────────

const MARKER_STYLES = `
.pitchup-marker { cursor: pointer; }
.marker-wrapper { position: relative; transition: transform 0.2s ease; }
.marker-wrapper:hover { transform: scale(1.12); }
.marker-selected .marker-pin { filter: drop-shadow(0 0 8px var(--brand)); transform: scale(1.15); }
.marker-pin { transition: transform 0.2s ease, filter 0.2s ease; }

.marker-pulse {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--brand);
  opacity: 0;
  animation: markerPulse 2s ease-out infinite;
  pointer-events: none;
}

@keyframes markerPulse {
  0% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.5); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.8); }
}

.pitchup-user-dot {
  width: 14px; height: 14px;
  background: #4285f4;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(66,133,244,0.3), 0 2px 4px rgba(0,0,0,0.2);
}

/* Route line for directions */
.route-preview-line {
  stroke: #4285f4;
  stroke-width: 2;
  stroke-dasharray: 8 6;
  fill: none;
  opacity: 0.6;
}
`

let stylesInjected = false
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.textContent = MARKER_STYLES
  document.head.appendChild(style)
  stylesInjected = true
}

// ─── VendorMap (single vendor page) ─────────────────────────────

interface VendorMapProps {
  vendor: MapVendorInfo
  locations: MapLocation[]
  preset?: MapPreset
  defaultZoom?: number
  showMap?: boolean
  className?: string
  onFollow?: () => void
}

export function VendorMap({
  vendor,
  locations,
  preset = 'light',
  defaultZoom = 12,
  showMap = true,
  className = '',
  onFollow,
}: VendorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const routeLineRef = useRef<maplibregl.Marker | null>(null)

  injectStyles()

  const { map, ready, flyTo, fitBounds } = useMapSetup({
    container: containerRef,
    preset,
    primaryColor: vendor.primaryColor,
    secondaryColor: vendor.secondaryColor,
    zoom: defaultZoom,
  })

  // Fit to all locations on load
  useEffect(() => {
    if (!ready || locations.length === 0) return
    const coords: [number, number][] = locations.map((l) => [l.lng, l.lat])
    fitBounds(coords)
  }, [ready, locations.length]) // eslint-disable-line

  const handleMarkerClick = useCallback((loc: MapLocation) => {
    setSelectedLocation(loc)
    flyTo(loc.lng, loc.lat, 15)
  }, [flyTo])

  // User location dot
  const showUserLocation = useCallback(() => {
    if (!map.current) return
    if (userLocation) return // already have it

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude]
        setUserLocation(coords)
        
        if (userMarkerRef.current) userMarkerRef.current.remove()
        const el = document.createElement('div')
        el.className = 'pitchup-user-dot'
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .addTo(map.current!)
      },
      () => {}, // silently fail
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [map, userLocation])

  // Draw route line when selected + user location
  useEffect(() => {
    if (routeLineRef.current) {
      routeLineRef.current.remove()
      routeLineRef.current = null
    }
    if (!map.current || !userLocation || !selectedLocation) return

    // Simple SVG line overlay
    const canvas = map.current.getCanvas()
    const startPx = map.current.project(new maplibregl.LngLat(userLocation[0], userLocation[1]))
    const endPx = map.current.project(new maplibregl.LngLat(selectedLocation.lng, selectedLocation.lat))

    // Use a simple canvas-based approach: add a geojson source
    const sourceId = '_route_preview'
    const layerId = '_route_preview_line'
    
    try {
      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)
    } catch {}

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [userLocation, [selectedLocation.lng, selectedLocation.lat]],
        },
      },
    })

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#4285f4',
        'line-width': 2.5,
        'line-dasharray': [3, 2],
        'line-opacity': 0.55,
      },
      layout: {
        'line-cap': 'round',
      },
    })

    return () => {
      try {
        if (map.current?.getLayer(layerId)) map.current.removeLayer(layerId)
        if (map.current?.getSource(sourceId)) map.current.removeSource(sourceId)
      } catch {}
    }
  }, [map, userLocation, selectedLocation])

  if (!showMap) return null

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ minHeight: '400px' }}>
      <div ref={containerRef} className="h-full w-full" />

      {/* Markers rendered as React components controlling imperative markers */}
      {ready && map.current && locations.map((loc) => (
        <LocationMarker
          key={loc.id}
          map={map.current!}
          location={loc}
          vendor={vendor}
          isSelected={selectedLocation?.id === loc.id}
          onClick={handleMarkerClick}
        />
      ))}

      {/* Near Me button (vendor map — simple version) */}
      <button
        onClick={showUserLocation}
        className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/95 px-3 py-2 text-xs font-medium text-gray-700 shadow-lg hover:bg-gray-50 transition-colors backdrop-blur-sm"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        Near Me
      </button>

      {/* Bottom sheet / sidebar */}
      <BottomSheet
        location={selectedLocation}
        vendor={vendor}
        onClose={() => setSelectedLocation(null)}
        onFollow={onFollow}
        userLocation={userLocation}
      />
    </div>
  )
}

// ─── DiscoverMap (all vendors) ──────────────────────────────────

interface DiscoverMapProps {
  vendors: DiscoverVendor[]
  preset?: MapPreset
  className?: string
}

interface FlatPoint {
  lng: number
  lat: number
  vendor: MapVendorInfo
  location: MapLocation
}

export function DiscoverMap({
  vendors,
  preset = 'light',
  className = '',
}: DiscoverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ location: MapLocation; vendor: MapVendorInfo } | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const userMarkerRef = useRef<maplibregl.Marker | null>(null)
  const [zoom, setZoom] = useState(6)
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null)
  const [filters, setFilters] = useState<DiscoverFilters>({
    liveOnly: false,
    openToday: false,
    cuisineType: null,
    searchQuery: '',
  })

  injectStyles()

  const { map, ready, flyTo, fitBounds } = useMapSetup({
    container: containerRef,
    preset,
    primaryColor: '#F59E0B',
    secondaryColor: '#78350F',
    center: [-4.0, 55.9], // Scotland center
    zoom: 6,
  })

  // Track zoom/bounds for clustering
  useEffect(() => {
    if (!map.current) return
    const m = map.current

    const updateView = () => {
      setZoom(m.getZoom())
      const b = m.getBounds()
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
    }

    m.on('moveend', updateView)
    m.on('zoomend', updateView)
    if (ready) updateView()

    return () => {
      m.off('moveend', updateView)
      m.off('zoomend', updateView)
    }
  }, [map, ready])

  // Flatten + filter vendors into points
  const today = new Date().getDay()
  const filteredPoints = useMemo(() => {
    const points: FlatPoint[] = []
    const query = filters.searchQuery.toLowerCase()

    for (const v of vendors) {
      if (filters.cuisineType && v.cuisineType !== filters.cuisineType) continue
      if (query && !v.name.toLowerCase().includes(query)) continue

      for (const loc of v.locations) {
        if (filters.liveOnly && !loc.liveSession) continue
        if (filters.openToday && !loc.schedules.some((s) => s.dayOfWeek === today)) continue
        if (query && !loc.name.toLowerCase().includes(query) && !v.name.toLowerCase().includes(query)) continue

        points.push({ lng: loc.lng, lat: loc.lat, vendor: v, location: loc })
      }
    }
    return points
  }, [vendors, filters, today])

  // Supercluster
  const cluster = useMemo(() => {
    const sc = new Supercluster({ radius: 60, maxZoom: 14 })
    sc.load(
      filteredPoints.map((p) => ({
        type: 'Feature' as const,
        properties: { idx: filteredPoints.indexOf(p) },
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      })),
    )
    return sc
  }, [filteredPoints])

  const clusters = useMemo(() => {
    if (!bounds) return []
    return cluster.getClusters(bounds, Math.floor(zoom))
  }, [cluster, bounds, zoom])

  // Cuisine types list
  const cuisineTypes = useMemo(() => {
    const set = new Set<string>()
    vendors.forEach((v) => v.cuisineType && set.add(v.cuisineType))
    return Array.from(set).sort()
  }, [vendors])

  // Fit bounds on load
  useEffect(() => {
    if (!ready || filteredPoints.length === 0) return
    const coords: [number, number][] = filteredPoints.map((p) => [p.lng, p.lat])
    fitBounds(coords, 80)
  }, [ready]) // eslint-disable-line — only on initial load

  const handleNearMe = useCallback(() => {
    if (locating) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude]
        setUserLocation(coords)
        setLocating(false)

        if (map.current) {
          if (userMarkerRef.current) userMarkerRef.current.remove()
          const el = document.createElement('div')
          el.className = 'pitchup-user-dot'
          userMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(map.current)

          flyTo(coords[0], coords[1], 12)
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [locating, map, flyTo])

  const handleMarkerClick = useCallback((loc: MapLocation, vendor: MapVendorInfo) => {
    setSelectedLocation({ location: loc, vendor })
    flyTo(loc.lng, loc.lat, 15)
  }, [flyTo])

  const handleClusterClick = useCallback((clusterId: number, lng: number, lat: number) => {
    const expansionZoom = Math.min(cluster.getClusterExpansionZoom(clusterId), 16)
    flyTo(lng, lat, expansionZoom)
  }, [cluster, flyTo])

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`} style={{ minHeight: '500px' }}>
      <div ref={containerRef} className="h-full w-full" />

      {/* Filters */}
      <DiscoverFilterBar
        filters={filters}
        onChange={setFilters}
        cuisineTypes={cuisineTypes}
        onNearMe={handleNearMe}
        locating={locating}
      />

      {/* Render clusters + individual markers */}
      {ready && map.current && clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates as [number, number]
        const props = feature.properties

        if (props.cluster) {
          return (
            <ClusterMarker
              key={`cluster-${props.cluster_id}`}
              map={map.current!}
              lng={lng}
              lat={lat}
              count={props.point_count}
              color="#F59E0B"
              onClick={() => handleClusterClick(props.cluster_id, lng, lat)}
            />
          )
        }

        const point = filteredPoints[props.idx]
        if (!point) return null

        return (
          <LocationMarker
            key={`${point.vendor.id}-${point.location.id}`}
            map={map.current!}
            location={point.location}
            vendor={point.vendor}
            isSelected={selectedLocation?.location.id === point.location.id}
            onClick={(loc) => handleMarkerClick(loc, point.vendor)}
          />
        )
      })}

      {/* Bottom sheet */}
      {selectedLocation && (
        <BottomSheet
          location={selectedLocation.location}
          vendor={selectedLocation.vendor}
          onClose={() => setSelectedLocation(null)}
          userLocation={userLocation}
        />
      )}
    </div>
  )
}
