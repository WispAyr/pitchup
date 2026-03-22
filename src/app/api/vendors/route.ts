import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { cuisineType: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const vendors = await prisma.vendor.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        cuisineType: true,
        primaryColor: true,
        logo: true,
        banner: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, slug, cuisineType, description } = body

    if (!name || !email || !password || !slug) {
      return NextResponse.json(
        { error: 'Name, email, password, and slug are required' },
        { status: 400 }
      )
    }

    const existingSlug = await prisma.vendor.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'Slug is already taken' }, { status: 409 })
    }

    const existingEmail = await prisma.vendor.findFirst({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        slug,
        cuisineType,
        description,
        passwordHash,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        email: true,
        cuisineType: true,
        description: true,
        createdAt: true,
      },
    })

    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}
