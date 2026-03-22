import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PickupScreenClient } from './pickup-client'

export default async function PickupPage({
  params,
}: {
  params: { slug: string }
}) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      primaryColor: true,
      secondaryColor: true,
      logo: true,
    },
  })

  if (!vendor) notFound()

  return (
    <PickupScreenClient
      vendorId={vendor.id}
      vendorName={vendor.name}
      vendorSlug={vendor.slug}
      primaryColor={vendor.primaryColor}
      secondaryColor={vendor.secondaryColor}
      logo={vendor.logo}
    />
  )
}
