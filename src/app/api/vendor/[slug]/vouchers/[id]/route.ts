import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const voucher = await prisma.voucher.update({
    where: { id: params.id },
    data: {
      ...(body.description !== undefined && { description: body.description }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.maxUses !== undefined && { maxUses: body.maxUses ? parseInt(body.maxUses) : null }),
      ...(body.maxUsesPerCustomer !== undefined && { maxUsesPerCustomer: body.maxUsesPerCustomer ? parseInt(body.maxUsesPerCustomer) : null }),
      ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
      ...(body.minOrder !== undefined && { minOrder: body.minOrder ? parseFloat(body.minOrder) : null }),
      ...(body.value !== undefined && { value: body.value ? parseFloat(body.value) : null }),
    },
  })
  return NextResponse.json(voucher)
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.voucher.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
