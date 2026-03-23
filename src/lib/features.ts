import { prisma } from '@/lib/prisma'

export async function vendorHasFeature(vendorId: string, featureSlug: string): Promise<boolean> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      plan: true,
      addons: {
        where: { status: 'active' },
        include: { feature: true },
      },
    },
  })

  if (!vendor) return false

  // Check plan features
  if (vendor.plan) {
    const planFeatures: string[] = JSON.parse(vendor.plan.features || '[]')
    if (planFeatures.includes(featureSlug)) return true
  }

  // Check active addons
  if (vendor.addons.some((addon) => addon.feature.slug === featureSlug)) return true

  return false
}

export async function vendorCanAddVehicle(vendorId: string): Promise<boolean> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      plan: true,
      _count: { select: { vehicles: true } },
    },
  })

  if (!vendor) return false
  if (!vendor.plan) return true // no plan = no restriction (free tier default)

  return vendor._count.vehicles < vendor.plan.maxVehicles
}

export async function getVendorPlan(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { plan: true },
  })

  if (!vendor?.plan) return null

  return {
    ...vendor.plan,
    featureList: JSON.parse(vendor.plan.features || '[]') as string[],
  }
}

export async function getVendorAddons(vendorId: string): Promise<string[]> {
  const addons = await prisma.vendorAddon.findMany({
    where: { vendorId, status: 'active' },
    include: { feature: true },
  })

  return addons.map((a) => a.feature.slug)
}

export async function getVendorFeatures(vendorId: string): Promise<string[]> {
  const [plan, addons] = await Promise.all([
    getVendorPlan(vendorId),
    getVendorAddons(vendorId),
  ])

  const planFeatures = plan?.featureList || []
  return [...new Set([...planFeatures, ...addons])]
}
