import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.role !== 'admin') redirect('/dashboard?error=no_access')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
