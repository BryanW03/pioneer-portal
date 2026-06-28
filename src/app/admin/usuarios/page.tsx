export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserManagement } from '@/components/forms/UserManagement'


export default async function AdminUsuariosPage() {
  const session = await getServerSession(authOptions)

  const users = await prisma.user.findMany({
    orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isActive: true,
      department: true,
      createdAt: true,
      createdBy: true,
      _count: { select: { terceros: true } },
    },
  })

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>Admin</span><span>/</span>
          <span className="text-pioneer-purple font-medium">Gestión de Usuarios</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Crea cuentas, asigna roles y administra el acceso al portal.
        </p>
      </div>

      <UserManagement
        users={users}
        currentUserEmail={session?.user?.email || ''}
      />
    </div>
  )
}
