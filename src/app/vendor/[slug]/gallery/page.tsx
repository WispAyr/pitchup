import { prisma } from '@/lib/prisma'
import GalleryClient from './gallery-client'

export default async function GalleryPage({ params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, primaryColor: true },
  })
  if (!vendor) return null

  const media = await prisma.vendorMedia.findMany({
    where: { vendorId: vendor.id },
    orderBy: { sortOrder: 'asc' },
  })

  return <GalleryClient media={media} vendorName={vendor.name} primaryColor={vendor.primaryColor} />
}
