export const dynamic = 'force-dynamic'
export const revalidate = 0

export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FileText, Users, History, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'

  const [totalTerceros, totalUsers, recentTerceros, recentLogs] = await Promise.all([
    prisma.tercero.count(),
    isAdmin ? prisma.user.count({ where: { isActive: true } }) : Promise.resolve(null),
    prisma.tercero.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, nombreRazon: true, rncCedula: true,
        createdByName: true, createdAt: true, status: true,
      },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {session?.user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<FileText className="text-pioneer-purple" size={22} />}
          label="Total Terceros"
          value={totalTerceros}
          bg="bg-pioneer-purple-pale"
        />
        {isAdmin && totalUsers !== null && (
          <StatCard
            icon={<Users className="text-blue-600" size={22} />}
            label="Usuarios Activos"
            value={totalUsers as number}
            bg="bg-blue-50"
          />
        )}
        <StatCard
          icon={<TrendingUp className="text-green-600" size={22} />}
          label="Este mes"
          value={recentTerceros.filter(t =>
            new Date(t.createdAt).getMonth() === new Date().getMonth()
          ).length}
          bg="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 pioneer-card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800">Terceros Recientes</h2>
            <Link href="/terceros/historial" className="text-pioneer-purple text-sm hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTerceros.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">No hay terceros creados aún</div>
            ) : (
              recentTerceros.map((t: any) => (
                <div key={t.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{t.nombreRazon}</p>
                      <p className="text-xs text-gray-400 mt-0.5">RNC: {t.rncCedula}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.status === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>{t.status}</span>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(t.createdAt), { locale: es, addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Por: {t.createdByName}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 pioneer-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              Actividad Reciente
            </h2>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-80">
            {recentLogs.length === 0 ? (
              <div className="p-5 text-center text-gray-400 text-sm">Sin actividad</div>
            ) : (
              recentLogs.map((log: any) => (
                <div key={log.id} className="px-5 py-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-pioneer-purple mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700">{getActionLabel(log.action)}</p>
                      <p className="text-[11px] text-gray-400 truncate">{log.user.name}</p>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        {formatDistanceToNow(new Date(log.createdAt), { locale: es, addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/terceros/nuevo" className="pioneer-card p-5 hover:border-pioneer-purple/30
          border border-transparent flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-pioneer-purple-pale flex items-center justify-center
            group-hover:bg-pioneer-purple transition-colors">
            <FileText size={18} className="text-pioneer-purple group-hover:text-white transition-colors" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Crear Tercero</p>
            <p className="text-gray-400 text-xs">Registrar nuevo proveedor o cliente</p>
          </div>
          <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-pioneer-purple transition-colors" />
        </Link>
        {isAdmin && (
          <Link href="/admin/usuarios" className="pioneer-card p-5 hover:border-pioneer-purple/30
            border border-transparent flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center
              group-hover:bg-blue-600 transition-colors">
              <Users size={18} className="text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Gestionar Usuarios</p>
              <p className="text-gray-400 text-xs">Crear cuentas y asignar roles</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-blue-600 transition-colors" />
          </Link>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, bg }: {
  icon: React.ReactNode; label: string; value: number; bg: string
}) {
  return (
    <div className="pioneer-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    LOGIN: 'Inicio de sesión', CREATE_TERCERO: 'Tercero creado',
    EDIT_TERCERO: 'Tercero editado', CREATE_USER: 'Usuario creado',
    EDIT_USER: 'Usuario editado', DEACTIVATE_USER: 'Usuario desactivado',
    CHANGE_ROLE: 'Rol modificado',
  }
  return labels[action] || action
}
