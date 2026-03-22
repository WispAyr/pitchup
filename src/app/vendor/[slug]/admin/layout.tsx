import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = session.user as any
  if (user.role !== 'vendor' || user.vendorSlug !== params.slug) {
    redirect('/auth/signin')
  }

  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      primaryColor: true,
    },
  })

  if (!vendor) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        vendorSlug={vendor.slug}
        vendorName={vendor.name}
        primaryColor={vendor.primaryColor}
      />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
