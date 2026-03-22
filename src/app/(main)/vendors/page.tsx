import { prisma } from '@/lib/prisma'
import VendorDirectoryClient from './VendorDirectoryClient'

async function getVendors() {
  try {
    return await prisma.vendor.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        cuisineType: true,
        primaryColor: true,
      },
      orderBy: { name: 'asc' },
    })
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Vendors — PitchUp',
  description: 'Browse all mobile food vendors on PitchUp.',
}

export default async function VendorsPage() {
  const vendors = await getVendors()

  const cuisineTypes = Array.from(
    new Set(vendors.map((v) => v.cuisineType).filter(Boolean))
  ) as string[]

  return <VendorDirectoryClient vendors={vendors} cuisineTypes={cuisineTypes} />
}
