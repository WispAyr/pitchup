import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain')
  if (!domain) {
    return NextResponse.json({ error: 'Missing domain' }, { status: 400 })
  }

  const vendor = await prisma.vendor.findFirst({
    where: {
      customDomain: domain,
      domainStatus: { in: ['verified', 'active'] },
    },
    select: { slug: true },
  })

  if (!vendor) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ slug: vendor.slug })
}
