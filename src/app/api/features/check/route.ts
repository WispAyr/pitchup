import { NextRequest, NextResponse } from 'next/server'
import { vendorHasFeature } from '@/lib/features'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const vendorId = searchParams.get('vendorId')
  const featureSlug = searchParams.get('feature')

  if (!vendorId || !featureSlug) {
    return NextResponse.json({ error: 'vendorId and feature required' }, { status: 400 })
  }

  const hasAccess = await vendorHasFeature(vendorId, featureSlug)

  let feature = null
  if (!hasAccess) {
    const planFeature = await prisma.planFeature.findUnique({
      where: { slug: featureSlug },
    })
    if (planFeature) {
      feature = {
        name: planFeature.name,
        description: planFeature.description,
        monthlyPrice: planFeature.monthlyPrice,
        isAddon: planFeature.isAddon,
      }
    }
  }

  return NextResponse.json({ hasAccess, feature })
}
