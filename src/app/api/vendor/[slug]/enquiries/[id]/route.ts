import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).vendorSlug !== params.slug)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const data: any = {}
  if (body.status) data.status = body.status
  if (body.staffNotes !== undefined) data.staffNotes = body.staffNotes
  const enquiry = await prisma.enquiry.update({
    where: { id: params.id },
    data,
  })
  return NextResponse.json(enquiry)
}
