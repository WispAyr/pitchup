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
}

interface VendorDirectoryClientProps {
  vendors: Vendor[]
  cuisineTypes: string[]
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
              <p className="text-sm text-gray-500">
                {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} on PitchUp
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <SearchBar
              placeholder="Search vendors by name or cuisine..."
              onSearch={handleSearch}
            />
          </div>

          {/* Cuisine filter chips */}
          {cuisineTypes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCuisine(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  !selectedCuisine
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCuisine === cuisine
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">No vendors found</h2>
            <p className="text-gray-500">Try adjusting your search or filter.</p>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
