'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { MapLocation, MapVendorInfo } from './types'

interface LocationMarkerProps {
  map: maplibregl.Map
  location: MapLocation
  vendor: MapVendorInfo
  isSelected: boolean
  onClick: (location: MapLocation) => void
}

export function LocationMarker({ map, location, vendor, isSelected, onClick }: LocationMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.className = 'pitchup-marker'
    const isLive = !!location.liveSession

    el.innerHTML = `
      <div class="marker-wrapper ${isLive ? 'marker-live' : ''} ${isSelected ? 'marker-selected' : ''}" style="--brand: ${vendor.primaryColor}">
        ${isLive ? '<div class="marker-pulse"></div>' : ''}
        <div class="marker-pin">
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
            <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.059 27.941 0 18 0z" fill="${vendor.primaryColor}" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"/>
            <circle cx="18" cy="17" r="9" fill="white" opacity="0.95"/>
            ${isLive
              ? '<text x="18" y="21" text-anchor="middle" font-size="13" fill="#22c55e">🚐</text>'
              : `<text x="18" y="21" text-anchor="middle" font-size="12">${vendor.logo ? '📍' : '🚐'}</text>`
            }
          </svg>
        </div>
      </div>
    `

    el.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick(location)
    })

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([location.lng, location.lat])
      .addTo(map)

    markerRef.current = marker
    elRef.current = el

    return () => {
      marker.remove()
    }
  }, [map, location.lat, location.lng, location.liveSession?.id]) // eslint-disable-line

  // Update selected state without re-creating
  useEffect(() => {
    const wrapper = elRef.current?.querySelector('.marker-wrapper')
    if (!wrapper) return
    if (isSelected) {
      wrapper.classList.add('marker-selected')
    } else {
      wrapper.classList.remove('marker-selected')
    }
  }, [isSelected])

  return null
}

export function ClusterMarker({
  map,
  lng,
  lat,
  count,
  color,
  onClick,
}: {
  map: maplibregl.Map
  lng: number
  lat: number
  count: number
  color: string
  onClick: () => void
}) {
  useEffect(() => {
    const el = document.createElement('div')
    el.className = 'pitchup-cluster'
    const size = Math.min(28 + count * 4, 56)
    el.innerHTML = `
      <div class="cluster-circle" style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: ${size > 40 ? 15 : 13}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        transition: transform 0.2s;
      ">${count}</div>
    `
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick()
    })
    el.addEventListener('mouseenter', () => {
      const circle = el.querySelector('.cluster-circle') as HTMLElement
      if (circle) circle.style.transform = 'scale(1.15)'
    })
    el.addEventListener('mouseleave', () => {
      const circle = el.querySelector('.cluster-circle') as HTMLElement
      if (circle) circle.style.transform = 'scale(1)'
    })

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map)

    return () => marker.remove()
  }, [map, lng, lat, count, color, onClick])

  return null
}
