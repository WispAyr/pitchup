import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { featureSlug } = await request.json()

    const feature = await prisma.planFeature.findUnique({ where: { slug: featureSlug } })
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    const addon = await prisma.vendorAddon.upsert({
      where: {
        vendorId_featureId: { vendorId: params.id, featureId: feature.id },
      },
      create: {
        vendorId: params.id,
        featureId: feature.id,
        status: 'active',
      },
      update: {
        status: 'active',
        cancelledAt: null,
      },
    })

    return NextResponse.json({ addon })
  } catch (error) {
    console.error('Addon error:', error)
    return NextResponse.json({ error: 'Failed to add addon' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { featureSlug } = await request.json()

    const feature = await prisma.planFeature.findUnique({ where: { slug: featureSlug } })
    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    await prisma.vendorAddon.updateMany({
      where: { vendorId: params.id, featureId: feature.id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Addon removal error:', error)
    return NextResponse.json({ error: 'Failed to remove addon' }, { status: 500 })
  }
}
