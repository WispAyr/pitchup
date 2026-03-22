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
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="${vendor.primaryColor}"/>
            <circle cx="16" cy="15" r="7" fill="white" opacity="0.95"/>
            ${isLive 
              ? '<circle cx="16" cy="15" r="4" fill="#22c55e"/>' 
              : `<circle cx="16" cy="15" r="3.5" fill="${vendor.primaryColor}"/>`
            }
          </svg>
        </div>
        ${vendor.logo 
          ? '' // Could add logo overlay later
          : ''
        }
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
