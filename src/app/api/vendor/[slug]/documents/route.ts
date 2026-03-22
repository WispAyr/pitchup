import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

async function getVendor(slug: string, session: any) {
  if (!session?.user || (session.user as any).vendorSlug !== slug) return null
  return prisma.vendor.findUnique({ where: { slug }, select: { id: true } })
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const vendor = await getVendor(params.slug, session)
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const documents = await prisma.document.findMany({
    where: { vendorId: vendor.id },
    include: { vehicle: { select: { name: true } } },
    orderBy: { uploadedAt: 'desc' },
  })
  return NextResponse.json(documents)
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  const vendor = await getVendor(params.slug, session)
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', vendor.id)
  await mkdir(uploadsDir, { recursive: true })

  const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const filePath = path.join(uploadsDir, uniqueName)
  const bytes = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(bytes))

  const document = await prisma.document.create({
    data: {
      vendorId: vendor.id,
      vehicleId: (formData.get('vehicleId') as string) || null,
      category: (formData.get('category') as string) || 'other',
      title: (formData.get('title') as string) || file.name,
      fileUrl: `/uploads/${vendor.id}/${uniqueName}`,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      expiresAt: formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : null,
      notes: (formData.get('notes') as string) || null,
    },
  })
  return NextResponse.json(document, { status: 201 })
}
