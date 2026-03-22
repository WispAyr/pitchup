import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { category: { select: { name: true } } },
    })

    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json({ error: 'Failed to fetch menu item' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
    })
    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    const user = session.user as any
    if (user.role !== 'vendor' || user.id !== item.vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      categoryId,
      name,
      description,
      price,
      image,
      allergens,
      dietaryTags,
      available,
      sortOrder,
    } = body

    const updated = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        ...(categoryId !== undefined && { categoryId }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(image !== undefined && { image }),
        ...(allergens !== undefined && { allergens }),
        ...(dietaryTags !== undefined && { dietaryTags }),
        ...(available !== undefined && { available }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
    })
    if (!item) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 })
    }

    const user = session.user as any
    if (user.role !== 'vendor' || user.id !== item.vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.menuItem.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 })
  }
}
