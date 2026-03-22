import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import dns from 'dns'
import { promisify } from 'util'

const resolveCname = promisify(dns.resolveCname)

export async function POST(
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
    if (!vendor || !vendor.customDomain) {
      return NextResponse.json({ error: 'No custom domain set' }, { status: 400 })
    }

    const targetDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'pitchup.local-connect.uk'
    const targetBase = targetDomain.split(':')[0]

    try {
      const records = await resolveCname(vendor.customDomain)
      const matches = records.some(
        (r: string) => r === targetBase || r.endsWith(`.${targetBase}`)
      )

      if (matches) {
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: { domainStatus: 'verified' },
        })
        return NextResponse.json({ status: 'verified', message: 'DNS verified! Your domain is pointing correctly.' })
      } else {
        return NextResponse.json({
          status: 'pending',
          message: `CNAME records found but not pointing to ${targetBase}. Found: ${records.join(', ')}`,
        })
      }
    } catch (dnsErr: any) {
      return NextResponse.json({
        status: 'pending',
        message: `Could not resolve CNAME for ${vendor.customDomain}. Please ensure you've added the CNAME record and allow up to 48 hours for DNS propagation.`,
      })
    }
  } catch (error) {
    console.error('Error verifying domain:', error)
    return NextResponse.json({ error: 'Failed to verify domain' }, { status: 500 })
  }
}
