import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'vendor' || user.vendorSlug !== params.slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { slug: params.slug },
    })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    const body = await request.json()

    // Handle password change
    if (body.currentPassword && body.newPassword) {
      const valid = await bcrypt.compare(body.currentPassword, vendor.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
      }

      const passwordHash = await bcrypt.hash(body.newPassword, 12)
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: { passwordHash },
      })

      return NextResponse.json({ success: true, message: 'Password updated' })
    }

    // Handle settings update
    const allowedFields = [
      'name',
      'description',
      'cuisineType',
      'phone',
      'email',
      'website',
      'facebook',
      'instagram',
      'tiktok',
      'twitter',
      'primaryColor',
      'secondaryColor',
      'preOrderingEnabled',
    ] as const

    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // Validate required fields if provided
    if (updateData.name !== undefined && !updateData.name?.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
    }
    if (updateData.email !== undefined && !updateData.email?.trim()) {
      return NextResponse.json({ error: 'Email cannot be empty' }, { status: 400 })
    }

    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: updateData,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        cuisineType: true,
        phone: true,
        email: true,
        website: true,
        facebook: true,
        instagram: true,
        tiktok: true,
        twitter: true,
        primaryColor: true,
        secondaryColor: true,
        preOrderingEnabled: true,
        stripeAccountId: true,
        stripeOnboarded: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating vendor settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
