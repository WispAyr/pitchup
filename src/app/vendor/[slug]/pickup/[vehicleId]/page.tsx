import { prisma } from '@/lib/prisma'
import { PickupScreenClient } from './pickup-client'

export default async function VanPickupPage({ params }: { params: { slug: string; vehicleId: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, slug: true, primaryColor: true, secondaryColor: true, logo: true },
  })
  if (!vendor) return null

  const vehicle = params.vehicleId === 'all'
    ? null
    : await prisma.vehicle.findUnique({ where: { id: params.vehicleId }, select: { id: true, name: true } })

  return (
    <PickupScreenClient
      vendorId={vendor.id}
      vendorName={vendor.name}
      vendorSlug={vendor.slug}
      primaryColor={vendor.primaryColor}
      secondaryColor={vendor.secondaryColor}
      logo={vendor.logo}
      vehicleId={params.vehicleId}
      vehicleName={vehicle?.name || 'All Vans'}
    />
  )
}
