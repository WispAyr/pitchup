/**
 * PitchUp Map Style Generator
 * Simplified from LocalMaps' maplibreStyle.ts — same tile source, same layer quality,
 * but themed around vendor brand colours with 3 presets.
 */
import type { StyleSpecification } from 'maplibre-gl'

const OPENFREEMAP_SOURCE = 'https://tiles.openfreemap.org/planet'
const SOURCE_ID = 'openfreemap'
const SOURCE_MAX_ZOOM = 14

// ─── colour helpers ────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
}

function blend(hex1: string, hex2: string, factor: number): string {
  const [r1, g1, b1] = hexToRgb(hex1)
  const [r2, g2, b2] = hexToRgb(hex2)
  return rgbToHex(
    r1 + (r2 - r1) * factor,
    g1 + (g2 - g1) * factor,
    b1 + (b2 - b1) * factor,
  )
}

function lighten(hex: string, amount: number): string {
  return blend(hex, '#ffffff', amount)
}

function darken(hex: string, amount: number): string {
  return blend(hex, '#000000', amount)
}

function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0')
  return hex + alpha
}

// ─── presets ───────────────────────────────────────────────────────

export type MapPreset = 'light' | 'dark' | 'branded'

interface MapTheme {
  land: string
  water: string
  waterway: string
  parks: string
  buildings: string
  roadMajor: string
  roadMinorHigh: string
  roadMinorMid: string
  roadMinorLow: string
  roadPath: string
  roadOutline: string
  rail: string
  aeroway: string
}

function resolveTheme(
  preset: MapPreset,
  primaryColor: string,
  secondaryColor: string,
): MapTheme {
  switch (preset) {
    case 'light':
      return {
        land: '#f8f9fa',
        water: '#c9daf8',
        waterway: '#a4c2f4',
        parks: '#d5e8d4',
        buildings: blend('#f8f9fa', '#333333', 0.1),
        roadMajor: '#ffffff',
        roadMinorHigh: '#ffffff',
        roadMinorMid: '#f0f0f0',
        roadMinorLow: '#ebebeb',
        roadPath: '#e0e0e0',
        roadOutline: '#d0d0d0',
        rail: '#999999',
        aeroway: '#e8e8e8',
      }
    case 'dark':
      return {
        land: '#1a1a2e',
        water: '#16213e',
        waterway: '#0f3460',
        parks: '#1e3a2f',
        buildings: blend('#1a1a2e', '#ffffff', 0.08),
        roadMajor: '#3a3a5c',
        roadMinorHigh: '#2d2d4a',
        roadMinorMid: '#252540',
        roadMinorLow: '#202038',
        roadPath: '#1e1e34',
        roadOutline: '#0e0e1e',
        rail: '#3a3a5c',
        aeroway: '#252540',
      }
    case 'branded':
      return {
        land: lighten(primaryColor, 0.92),
        water: blend(lighten(primaryColor, 0.7), '#c9daf8', 0.5),
        waterway: blend(lighten(primaryColor, 0.55), '#a4c2f4', 0.5),
        parks: blend(lighten(primaryColor, 0.8), '#d5e8d4', 0.4),
        buildings: blend(lighten(primaryColor, 0.92), darken(primaryColor, 0.3), 0.12),
        roadMajor: lighten(primaryColor, 0.82),
        roadMinorHigh: lighten(primaryColor, 0.85),
        roadMinorMid: lighten(primaryColor, 0.88),
        roadMinorLow: lighten(primaryColor, 0.9),
        roadPath: lighten(primaryColor, 0.88),
        roadOutline: lighten(secondaryColor, 0.7),
        rail: blend(secondaryColor, '#999999', 0.5),
        aeroway: lighten(primaryColor, 0.88),
      }
  }
}

// ─── MapLibre expressions ─────────────────────────────────────────

function widthExpr(stops: [number, number][]): any {
  return ['interpolate', ['linear'], ['zoom'], ...stops.flatMap(([z, w]) => [z, w])]
}

function opacityExpr(stops: [number, number][]): any {
  return ['interpolate', ['linear'], ['zoom'], ...stops.flatMap(([z, o]) => [z, o])]
}

function lineClassFilter(classes: string[]): any {
  return [
    'all',
    ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false],
    ['match', ['get', 'class'], classes, true, false],
  ]
}

// ─── road constants (from LocalMaps) ──────────────────────────────

const ROAD_MAJOR_CLASSES = ['motorway']
const ROAD_MINOR_HIGH_CLASSES = ['primary', 'primary_link', 'secondary', 'secondary_link', 'motorway_link', 'trunk', 'trunk_link']
const ROAD_MINOR_MID_CLASSES = ['tertiary', 'tertiary_link', 'minor']
const ROAD_MINOR_LOW_CLASSES = ['residential', 'living_street', 'unclassified', 'road', 'street', 'street_limited', 'service']
const ROAD_PATH_CLASSES = ['path', 'pedestrian', 'cycleway', 'track']
const RAIL_CLASSES = ['rail', 'transit']

const MAJOR_WIDTH: [number, number][] = [[0, 0.36], [3, 0.52], [9, 1.1], [14, 2.05], [18, 3.3]]
const MINOR_HIGH_WIDTH: [number, number][] = [[6, 0.46], [10, 0.8], [14, 1.48], [18, 2.7]]
const MINOR_MID_WIDTH: [number, number][] = [[6, 0.34], [10, 0.62], [14, 1.2], [18, 2.35]]
const MINOR_LOW_WIDTH: [number, number][] = [[6, 0.24], [10, 0.44], [14, 0.84], [18, 1.65]]
const PATH_WIDTH: [number, number][] = [[8, 0.2], [12, 0.42], [16, 0.85], [18, 1.3]]
const WATERWAY_WIDTH: [number, number][] = [[0, 0.2], [6, 0.34], [12, 0.8], [18, 2.4]]
const RAIL_WIDTH: [number, number][] = [[3, 0.4], [6, 0.7], [10, 1], [18, 1.5]]

function scaledStops(stops: [number, number][], scale: number): [number, number][] {
  return stops.map(([z, w]) => [z, w * scale])
}

// ─── style generator ──────────────────────────────────────────────

export function generateMapStyle(
  preset: MapPreset = 'light',
  primaryColor: string = '#F59E0B',
  secondaryColor: string = '#78350F',
): StyleSpecification {
  const t = resolveTheme(preset, primaryColor, secondaryColor)

  return {
    version: 8,
    sources: {
      [SOURCE_ID]: {
        type: 'vector',
        url: OPENFREEMAP_SOURCE,
        maxzoom: SOURCE_MAX_ZOOM,
      },
    },
    layers: [
      // Background
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': t.land },
      },

      // Parks (before water so marine areas get covered)
      {
        id: 'park',
        source: SOURCE_ID,
        'source-layer': 'park',
        type: 'fill',
        paint: { 'fill-color': t.parks },
      },

      // Water
      {
        id: 'water',
        source: SOURCE_ID,
        'source-layer': 'water',
        type: 'fill',
        paint: { 'fill-color': t.water },
      },
      {
        id: 'waterway',
        source: SOURCE_ID,
        'source-layer': 'waterway',
        type: 'line',
        filter: lineClassFilter(['river', 'canal', 'stream', 'ditch']),
        paint: {
          'line-color': t.waterway,
          'line-width': widthExpr(WATERWAY_WIDTH),
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },

      // Aeroway
      {
        id: 'aeroway',
        source: SOURCE_ID,
        'source-layer': 'aeroway',
        type: 'fill',
        filter: ['match', ['geometry-type'], ['MultiPolygon', 'Polygon'], true, false],
        paint: { 'fill-color': t.aeroway, 'fill-opacity': 0.85 },
      },

      // Buildings
      {
        id: 'building',
        source: SOURCE_ID,
        'source-layer': 'building',
        type: 'fill',
        minzoom: 8,
        paint: { 'fill-color': t.buildings, 'fill-opacity': 0.84 },
      },

      // Rail
      {
        id: 'rail',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        type: 'line',
        filter: lineClassFilter(RAIL_CLASSES),
        paint: {
          'line-color': t.rail,
          'line-width': widthExpr(RAIL_WIDTH),
          'line-opacity': opacityExpr([[0, 0.56], [12, 0.62], [18, 0.72]]),
          'line-dasharray': [2, 1.6],
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },

      // ─── Road casings (outlines drawn first) ───

      {
        id: 'road-major-casing',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        type: 'line',
        filter: lineClassFilter(ROAD_MAJOR_CLASSES),
        paint: {
          'line-color': t.roadOutline,
          'line-width': widthExpr(scaledStops(MAJOR_WIDTH, 1.38)),
          'line-opacity': 0.95,
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },
      {
        id: 'road-minor-high-casing',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        type: 'line',
        minzoom: 6,
        filter: lineClassFilter(ROAD_MINOR_HIGH_CLASSES),
        paint: {
          'line-color': t.roadOutline,
          'line-width': widthExpr(scaledStops(MINOR_HIGH_WIDTH, 1.45)),
          'line-opacity': opacityExpr([[6, 0.72], [12, 0.85], [18, 0.92]]),
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },

      // ─── Road fills ───

      {
        id: 'road-major',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        type: 'line',
        filter: lineClassFilter(ROAD_MAJOR_CLASSES),
        paint: {
          'line-color': t.roadMajor,
          'line-width': widthExpr(MAJOR_WIDTH),
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },
      {
        id: 'road-minor-high',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        type: 'line',
        minzoom: 6,
        filter: lineClassFilter(ROAD_MINOR_HIGH_CLASSES),
        paint: {
          'line-color': t.roadMinorHigh,
          'line-width': widthExpr(MINOR_HIGH_WIDTH),
          'line-opacity': opacityExpr([[6, 0.84], [10, 0.92], [18, 1]]),
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },
      {
        id: 'road-minor-mid',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        type: 'line',
        minzoom: 6,
        filter: lineClassFilter(ROAD_MINOR_MID_CLASSES),
        paint: {
          'line-color': t.roadMinorMid,
          'line-width': widthExpr(MINOR_MID_WIDTH),
          'line-opacity': opacityExpr([[6, 0.62], [10, 0.74], [18, 0.86]]),
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },
      {
        id: 'road-minor-low',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        type: 'line',
        minzoom: 6,
        filter: lineClassFilter(ROAD_MINOR_LOW_CLASSES),
        paint: {
          'line-color': t.roadMinorLow,
          'line-width': widthExpr(MINOR_LOW_WIDTH),
          'line-opacity': opacityExpr([[6, 0.34], [10, 0.46], [18, 0.58]]),
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },
      {
        id: 'road-path',
        source: SOURCE_ID,
        'source-layer': 'transportation',
        type: 'line',
        minzoom: 8,
        filter: lineClassFilter(ROAD_PATH_CLASSES),
        paint: {
          'line-color': t.roadPath,
          'line-width': widthExpr(PATH_WIDTH),
          'line-opacity': opacityExpr([[8, 0.7], [12, 0.82], [18, 0.95]]),
        },
        layout: { 'line-cap': 'round' as const, 'line-join': 'round' as const },
      },
    ],
  }
}
