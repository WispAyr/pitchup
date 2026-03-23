'use client'

import { useState, useCallback } from 'react'
import { Store } from 'lucide-react'
import VendorCard from '@/components/main/VendorCard'
import SearchBar from '@/components/main/SearchBar'

interface Vendor {
  id: string
  slug: string
  name: string
  description: string | null
  cuisineType: string | null
  primaryColor: string
  banner: string | null
  _count: { locations: number; vehicles: number }
}

interface VendorDirectoryClientProps {
  vendors: Vendor[]
  cuisineTypes: string[]
}

const cuisineEmojis: Record<string, string> = {
  'Fish & Chips': '🍟',
  'Pizza': '🍕',
  'Burgers': '🍔',
  'Coffee': '☕',
  'Tacos': '🌮',
  'Ice Cream': '🍦',
  'Wraps': '🥙',
  'Noodles': '🍜',
  'Indian': '🍛',
  'Mexican': '🌮',
  'Chinese': '🥡',
  'Thai': '🍜',
  'BBQ': '🍖',
  'Desserts': '🧁',
  'Vegan': '🥗',
}

export default function VendorDirectoryClient({
  vendors,
  cuisineTypes,
}: VendorDirectoryClientProps) {
  const [search, setSearch] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null)

  const handleSearch = useCallback((query: string) => {
    setSearch(query)
  }, [])

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.cuisineType?.toLowerCase().includes(search.toLowerCase()) ||
      v.description?.toLowerCase().includes(search.toLowerCase())

    const matchesCuisine = !selectedCuisine || v.cuisineType === selectedCuisine

    return matchesSearch && matchesCuisine
  })

  return (
    <div className="min-h-screen bg-warm-900">
      {/* Hero banner */}
      <div className="relative overflow-hidden border-b border-warm-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.1),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Explore Our Vendors
          </h1>
          <p className="mt-2 text-warm-400">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} serving across PitchUp
          </p>

          <div className="mt-6 max-w-md">
            <SearchBar
              placeholder="Search vendors by name or cuisine..."
              onSearch={handleSearch}
            />
          </div>

          {/* Cuisine filter as icon buttons */}
          {cuisineTypes.length > 0 && (
            <div className="mt-5 scrollbar-hide flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCuisine(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  !selectedCuisine
                    ? 'bg-brand-500 text-white'
                    : 'bg-warm-800 text-warm-300 hover:bg-warm-700'
                }`}
              >
                All
              </button>
              {cuisineTypes.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() =>
                    setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)
                  }
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                    selectedCuisine === cuisine
                      ? 'bg-brand-500 text-white'
                      : 'bg-warm-800 text-warm-300 hover:bg-warm-700'
                  }`}
                >
                  {cuisineEmojis[cuisine] && <span>{cuisineEmojis[cuisine]}</span>}
                  {cuisine}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Store className="mx-auto h-12 w-12 text-warm-600 mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">No vendors found</h2>
            <p className="text-warm-400">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vendor) => (
              <VendorCard
                key={vendor.id}
                name={vendor.name}
                slug={vendor.slug}
                cuisineType={vendor.cuisineType}
                description={vendor.description}
                primaryColor={vendor.primaryColor}
                banner={vendor.banner}
                locationCount={vendor._count.locations}
                vehicleCount={vendor._count.vehicles}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
