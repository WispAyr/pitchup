import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const enquiries = await prisma.enquiry.findMany({
    where: { vendorId: vendor.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(enquiries)
}

// Public endpoint - no auth required
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const body = await req.json()
  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      vendorId: vendor.id,
      enquiryType: body.enquiryType || 'general',
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      eventDate: body.eventDate ? new Date(body.eventDate) : null,
      eventType: body.eventType || null,
      guestCount: body.guestCount ? parseInt(body.guestCount) : null,
      location: body.location || null,
      budget: body.budget || null,
      dietary: body.dietary || null,
      outlet: body.outlet || null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      message: body.message || null,
    },
  })
  return NextResponse.json(enquiry, { status: 201 })
}
