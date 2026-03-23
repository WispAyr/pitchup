import { prisma } from '@/lib/prisma'
import { Phone, Mail, Globe, Star } from 'lucide-react'
import { AboutPageClient } from './page-client'

export default async function AboutPage({
  params,
}: {
  params: { slug: string }
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          customer: {
            select: { name: true },
          },
        },
      },
    },
  })

  if (!vendor) return null

  const avgRating =
    vendor.reviews.length > 0
      ? vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / vendor.reviews.length
      : null

  const reviews = vendor.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    text: r.text,
    customerName: r.customer.name,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 animate-fade-in-up">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900 sm:text-3xl">About {vendor.name}</h1>

      {/* Description */}
      {vendor.description && (
        <section className="mb-8">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {vendor.description}
          </p>
        </section>
      )}

      {/* Contact Info */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Contact</h2>
        <div className="space-y-3">
          {vendor.phone && (
            <a
              href={`tel:${vendor.phone}`}
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900"
            >
              <Phone className="h-4 w-4" style={{ color: vendor.primaryColor }} />
              {vendor.phone}
            </a>
          )}
          <a
            href={`mailto:${vendor.email}`}
            className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900"
          >
            <Mail className="h-4 w-4" style={{ color: vendor.primaryColor }} />
            {vendor.email}
          </a>
          {vendor.website && (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-700 hover:text-gray-900"
            >
              <Globe className="h-4 w-4" style={{ color: vendor.primaryColor }} />
              {vendor.website}
            </a>
          )}
        </div>
      </section>

      {/* Social Links */}
      {(vendor.facebook || vendor.instagram || vendor.tiktok) && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Follow Us</h2>
          <div className="flex flex-wrap gap-3">
            {vendor.facebook && (
              <a
                href={vendor.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
              >
                Facebook
              </a>
            )}
            {vendor.instagram && (
              <a
                href={vendor.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
              >
                Instagram
              </a>
            )}
            {vendor.tiktok && (
              <a
                href={vendor.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
              >
                TikTok
              </a>
            )}
          </div>
        </section>
      )}

      {/* Follow + Reviews + QR — client component */}
      <AboutPageClient
        vendorId={vendor.id}
        vendorSlug={vendor.slug}
        primaryColor={vendor.primaryColor}
        avgRating={avgRating}
        reviewCount={vendor.reviews.length}
        reviews={reviews}
      />
    </div>
  )
}
