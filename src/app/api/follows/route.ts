import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const vendorId = searchParams.get('vendorId')

    const where: any = {}
    if (customerId) where.customerId = customerId
    if (vendorId) where.vendorId = vendorId

    const follows = await prisma.follow.findMany({
      where,
      include: {
        vendor: {
          select: { id: true, name: true, slug: true, cuisineType: true, logo: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(follows)
  } catch (error) {
    console.error('Error fetching follows:', error)
    return NextResponse.json({ error: 'Failed to fetch follows' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, vendorId } = body

    if (!customerId || !vendorId) {
      return NextResponse.json(
        { error: 'customerId and vendorId are required' },
        { status: 400 }
      )
    }

    const existing = await prisma.follow.findUnique({
      where: { customerId_vendorId: { customerId, vendorId } },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Already following this vendor' },
        { status: 409 }
      )
    }

    const follow = await prisma.follow.create({
      data: { customerId, vendorId },
      include: {
        vendor: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    return NextResponse.json(follow, { status: 201 })
  } catch (error) {
    console.error('Error creating follow:', error)
    return NextResponse.json({ error: 'Failed to follow vendor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const vendorId = searchParams.get('vendorId')

    if (!customerId || !vendorId) {
      return NextResponse.json(
        { error: 'customerId and vendorId are required' },
        { status: 400 }
      )
    }

    await prisma.follow.delete({
      where: { customerId_vendorId: { customerId, vendorId } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unfollowing vendor:', error)
    return NextResponse.json({ error: 'Failed to unfollow vendor' }, { status: 500 })
  }
}
