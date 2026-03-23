import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { vendorId } = await request.json()

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } })
    if (!vendor?.stripeCustomerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
    const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
    const returnUrl = `${protocol}://${vendor.slug}.${rootDomain}/admin/billing`

    const session = await createPortalSession(vendor.stripeCustomerId, returnUrl)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
