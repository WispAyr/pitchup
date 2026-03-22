import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface VendorCardProps {
  name: string
  slug: string
  cuisineType: string | null
  description: string | null
  primaryColor: string
}

export default function VendorCard({
  name,
  slug,
  cuisineType,
  description,
  primaryColor,
}: VendorCardProps) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
  const vendorUrl = `${protocol}://${slug}.${rootDomain}`

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
      {/* Color stripe */}
      <div className="h-2" style={{ backgroundColor: primaryColor }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
            {name}
          </h3>
          {cuisineType && (
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${primaryColor}20`,
                color: primaryColor,
              }}
            >
              {cuisineType}
            </span>
          )}
        </div>

        {description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
            {description}
          </p>
        )}

        <Link
          href={vendorUrl}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          Visit Site
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
