import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface VendorCardProps {
  name: string
  slug: string
  cuisineType: string | null
  description: string | null
  primaryColor: string
  banner?: string | null
  locationCount?: number
  vehicleCount?: number
}

export default function VendorCard({
  name,
  slug,
  cuisineType,
  description,
  primaryColor,
  banner,
  locationCount,
  vehicleCount,
}: VendorCardProps) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
  const vendorUrl = `${protocol}://${slug}.${rootDomain}`

  return (
    <div className="card-hover group relative overflow-hidden rounded-2xl border border-warm-700/50 bg-warm-800 shadow-lg shadow-black/10 transition-all">
      {/* Gradient header */}
      <div
        className="h-28 relative"
        style={{
          background: banner
            ? `url(${banner}) center/cover`
            : `linear-gradient(135deg, ${primaryColor}50, ${primaryColor}15, transparent)`,
        }}
      >
        {banner && <div className="absolute inset-0 bg-black/20" />}
        <div className="absolute bottom-3 left-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white ring-2 ring-warm-800 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            {name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="p-5 pt-3">
        <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
          {name}
        </h3>

        {cuisineType && (
          <span
            className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${primaryColor}20`,
              color: primaryColor,
            }}
          >
            {cuisineType}
          </span>
        )}

        {description && (
          <p className="mt-2 text-sm text-warm-400 leading-relaxed line-clamp-2">
            {description}
          </p>
        )}

        {(locationCount || vehicleCount) && (
          <div className="mt-3 flex items-center gap-3 text-xs text-warm-500">
            {locationCount && locationCount > 0 && (
              <span>📍 {locationCount} location{locationCount !== 1 ? 's' : ''}</span>
            )}
            {vehicleCount && vehicleCount > 0 && (
              <span>🚐 {vehicleCount} van{vehicleCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        )}

        <Link
          href={vendorUrl}
          target="_blank"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ backgroundColor: primaryColor }}
        >
          Visit Site
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
