import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        logo: true,
        banner: true,
        primaryColor: true,
        secondaryColor: true,
        cuisineType: true,
        phone: true,
        email: true,
        website: true,
        facebook: true,
        instagram: true,
        tiktok: true,
        preOrderingEnabled: true,
        stripeOnboarded: true,
        menuCategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        locations: true,
        schedules: {
          include: { location: true },
        },
        liveSessions: {
          where: { endedAt: null },
          include: { location: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const reviewCount = vendor.reviews.length
    const averageRating =
      reviewCount > 0
        ? vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0

    const { reviews, ...vendorData } = vendor

    return NextResponse.json({
      ...vendorData,
      reviewCount,
      averageRating: Math.round(averageRating * 10) / 10,
    })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 })
  }
}
