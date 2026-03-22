import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = session.user as any

  if (user.role === 'admin') {
    redirect('/admin')
  } else if (user.role === 'vendor' && user.vendorSlug) {
    redirect(`/vendor/${user.vendorSlug}/admin`)
  } else {
    redirect('/discover')
  }
}
