'use client'

import { useState } from 'react'
import { Search, MapPin, Utensils, Radio, CalendarDays, X } from 'lucide-react'

export interface DiscoverFilters {
  liveOnly: boolean
  openToday: boolean
  cuisineType: string | null
  searchQuery: string
}

interface DiscoverFilterBarProps {
  filters: DiscoverFilters
  onChange: (filters: DiscoverFilters) => void
  cuisineTypes: string[]
  onNearMe: () => void
  locating: boolean
}

export function DiscoverFilterBar({
  filters,
  onChange,
  cuisineTypes,
  onNearMe,
  locating,
}: DiscoverFilterBarProps) {
  const [showCuisine, setShowCuisine] = useState(false)

  const update = (partial: Partial<DiscoverFilters>) => {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search location or vendor..."
          value={filters.searchQuery}
          onChange={(e) => update({ searchQuery: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        />
        {filters.searchQuery && (
          <button
            onClick={() => update({ searchQuery: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {/* Near Me */}
        <button
          onClick={onNearMe}
          disabled={locating}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gray-200 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <MapPin className="h-3.5 w-3.5" />
          {locating ? 'Locating...' : 'Near Me'}
        </button>

        {/* Live Now */}
        <button
          onClick={() => update({ liveOnly: !filters.liveOnly })}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-md transition-colors ${
            filters.liveOnly
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-gray-200 bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          Live Now
          {filters.liveOnly && (
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          )}
        </button>

        {/* Open Today */}
        <button
          onClick={() => update({ openToday: !filters.openToday })}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-md transition-colors ${
            filters.openToday
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-gray-200 bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-gray-50'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Open Today
        </button>

        {/* Cuisine dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setShowCuisine(!showCuisine)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-md transition-colors ${
              filters.cuisineType
                ? 'border-purple-300 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            {filters.cuisineType || 'Cuisine'}
            {filters.cuisineType && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  update({ cuisineType: null })
                  setShowCuisine(false)
                }}
                className="ml-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </button>
          {showCuisine && (
            <div className="absolute top-full mt-1 left-0 w-48 rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50">
              {cuisineTypes.map((ct) => (
                <button
                  key={ct}
                  onClick={() => {
                    update({ cuisineType: ct === filters.cuisineType ? null : ct })
                    setShowCuisine(false)
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    ct === filters.cuisineType ? 'text-amber-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {ct}
                </button>
              ))}
              {cuisineTypes.length === 0 && (
                <p className="px-4 py-2 text-sm text-gray-400">No cuisines found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
