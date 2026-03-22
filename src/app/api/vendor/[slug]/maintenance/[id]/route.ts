import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.maintenanceLog.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
