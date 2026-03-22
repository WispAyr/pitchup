import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const body = await req.json()
  const media = await prisma.vendorMedia.update({
    where: { id: params.id },
    data: {
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
      ...(body.caption !== undefined ? { caption: body.caption } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
  })
  return NextResponse.json(media)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  const media = await prisma.vendorMedia.findUnique({ where: { id: params.id } })
  if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Try to delete file
  try {
    const filePath = path.join(process.cwd(), 'public', media.url)
    await unlink(filePath)
  } catch {}

  await prisma.vendorMedia.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
