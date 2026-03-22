import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const locations = await prisma.location.findMany({
      where: { vendorId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(locations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { vendorId, name, address, lat, lng, isRegular } = body

    if (!vendorId || !name || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'vendorId, name, lat, and lng are required' },
        { status: 400 }
      )
    }

    const user = session.user as any
    if (user.role !== 'vendor' || user.id !== vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const location = await prisma.location.create({
      data: {
        vendorId,
        name,
        address: address ?? null,
        lat,
        lng,
        isRegular: isRegular ?? false,
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
  }
}
