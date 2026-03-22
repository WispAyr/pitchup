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

  const vouchers = await prisma.voucher.findMany({
    where: { vendorId: vendor.id },
    include: { _count: { select: { redemptions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(vouchers)
}

function generateCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug }, select: { id: true } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const code = body.code?.trim().toUpperCase() || generateCode()

  // Check uniqueness
  const existing = await prisma.voucher.findUnique({ where: { code } })
  if (existing) return NextResponse.json({ error: 'Code already exists' }, { status: 409 })

  const voucher = await prisma.voucher.create({
    data: {
      vendorId: vendor.id,
      code,
      type: body.type,
      value: body.value ? parseFloat(body.value) : null,
      freeItemId: body.freeItemId || null,
      description: body.description,
      minOrder: body.minOrder ? parseFloat(body.minOrder) : null,
      maxUses: body.maxUses ? parseInt(body.maxUses) : null,
      maxUsesPerCustomer: body.maxUsesPerCustomer ? parseInt(body.maxUsesPerCustomer) : null,
      validFrom: body.validFrom ? new Date(body.validFrom) : new Date(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: body.isActive ?? true,
      applicableTo: body.applicableTo || 'all',
      giftCardBalance: body.type === 'giftCard' && body.value ? parseFloat(body.value) : null,
    },
  })
  return NextResponse.json(voucher, { status: 201 })
}
