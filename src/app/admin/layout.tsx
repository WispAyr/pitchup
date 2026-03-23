import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = session.user as any
  if (user.role !== 'admin') {
    redirect('/auth/signin')
  }

  return (
    <div className="flex h-screen bg-[#0F172A]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
