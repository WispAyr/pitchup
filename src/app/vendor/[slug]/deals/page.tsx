import { prisma } from '@/lib/prisma'
import { DealsClient } from './deals-client'

export default async function DealsPage({ params }: { params: { slug: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: { id: true, name: true, slug: true, primaryColor: true },
  })
  if (!vendor) return null

  return <DealsClient vendor={vendor} />
}
