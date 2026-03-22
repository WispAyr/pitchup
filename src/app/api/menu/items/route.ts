import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const categoryId = searchParams.get('categoryId')

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const where: any = { vendorId }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const items = await prisma.menuItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: { category: { select: { name: true } } },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      vendorId,
      categoryId,
      name,
      description,
      price,
      allergens,
      dietaryTags,
      available,
      sortOrder,
    } = body

    if (!vendorId || !categoryId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'vendorId, categoryId, name, and price are required' },
        { status: 400 }
      )
    }

    const user = session.user as any
    if (user.role !== 'vendor' || user.id !== vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const item = await prisma.menuItem.create({
      data: {
        vendorId,
        categoryId,
        name,
        description: description ?? null,
        price,
        allergens: allergens ?? [],
        dietaryTags: dietaryTags ?? [],
        available: available ?? true,
        sortOrder: sortOrder ?? 0,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 })
  }
}
