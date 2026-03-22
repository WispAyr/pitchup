import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const tag = req.nextUrl.searchParams.get('tag')
  const media = await prisma.vendorMedia.findMany({
    where: {
      vendorId: vendor.id,
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json(media)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const vendor = await prisma.vendor.findUnique({ where: { slug: params.slug } })
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const tags = formData.get('tags') as string | null
  const caption = formData.get('caption') as string | null

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'vendors', params.slug)
  await mkdir(uploadDir, { recursive: true })

  const ext = path.extname(file.name) || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)

  const url = `/uploads/vendors/${params.slug}/${filename}`

  const count = await prisma.vendorMedia.count({ where: { vendorId: vendor.id } })

  const media = await prisma.vendorMedia.create({
    data: {
      vendorId: vendor.id,
      url,
      filename: file.name,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      caption: caption || null,
      sortOrder: count,
    },
  })

  return NextResponse.json(media)
}
