import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pitchup.local-connect.uk'

  const vendors = await prisma.vendor.findMany({
    select: { slug: true, updatedAt: true },
  })

  const vendorPages = vendors.flatMap((v) => [
    { url: `${baseUrl}/vendor/${v.slug}`, lastModified: v.updatedAt, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/vendor/${v.slug}/menu`, lastModified: v.updatedAt, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/vendor/${v.slug}/schedule`, lastModified: v.updatedAt, changeFrequency: 'daily' as const, priority: 0.6 },
    { url: `${baseUrl}/vendor/${v.slug}/contact`, lastModified: v.updatedAt, changeFrequency: 'monthly' as const, priority: 0.4 },
  ])

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/discover`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/vendors`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...vendorPages,
  ]
}
