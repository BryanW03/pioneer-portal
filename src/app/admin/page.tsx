export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Shield, Users, FileText, Activity, ChevronRight } from 'lucide-react'
import Link from 'next/link'


export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  const [totalUsers, activeUsers, totalTerceros, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.tercero.count(),
    prisma.auditLog.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true, role: true } } },
    }),
  ])

  const actionLabels: Record<string, { label: string; color: string }> = {
    LOGIN:            { label: 'Inicio de sesión',     color: 'bg-blue-100 text-blue-700' },
    CREATE_TERCERO:   { label: 'Tercero creado',        color: 'bg-green-100 text-green-700' },
    EDIT_TERCERO:     { label: 'Tercero editado',       color: 'bg-yellow-100 text-yellow-700' },
    DELETE_TERCERO:   { label: 'Tercero eliminado',     color: 'bg-red-100 text-red-700' },
    CREATE_USER:      { label: 'Usuario creado',        color: 'bg-purple-100 text-purple-700' },
    EDIT_USER:        { label: 'Usuario editado',       color: 'bg-orange-100 text-orange-700' },
    DEACTIVATE_USER:  { label: 'Usuario desactivado',   color: 'bg-red-100 text-red-600' },
    ACTIVATE_USER:    { label: 'Usuario activado',      color: 'bg-green-100 text-green-700' },
    CHANGE_ROLE:      { label: 'Rol modificado',        color: 'bg-pioneer-purple/10 text-pioneer-purple' },
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-pioneer-purple-pale text-pioneer-purple text-xs font-semibold mb-3">
          <Shield size={12} /> Panel de Administración
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Administración</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Vista completa del sistema — {session?.user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Usuarios totales',   val: totalUsers,    icon: <Users size={20} />,    bg: 'bg-blue-50',   color: 'text-blue-600' },
          { label: 'Usuarios activos',   val: activeUsers,   icon: <Activity size={20} />, bg: 'bg-green-50',  color: 'text-green-600' },
          { label: 'Terceros creados',   val: totalTerceros, icon: <FileText size={20} />, bg: 'bg-pioneer-purple-pale', color: 'text-pioneer-purple' },
          { label: 'Logs de actividad',  val: recentLogs.length + '+', icon: <Shield size={20} />, bg: 'bg-orange-50', color: 'text-orange-600' },
        ].map(({ label, val, icon, bg, color }) => (
          <div key={label} className="pioneer-card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <span className={color}>{icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{val}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/admin/usuarios"
          className="pioneer-card p-5 flex items-center gap-4 hover:border-pioneer-purple/30
            border border-transparent group">
          <div className="w-12 h-12 rounded-xl bg-pioneer-purple flex items-center justify-center
            group-hover:bg-pioneer-purple-light transition-colors">
            <Users size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Gestión de Usuarios</p>
            <p className="text-xs text-gray-400 mt-0.5">Crear cuentas, roles y permisos</p>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-pioneer-purple transition-colors" />
        </Link>
        <Link href="/terceros/historial"
          className="pioneer-card p-5 flex items-center gap-4 hover:border-pioneer-purple/30
            border border-transparent group">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center
            group-hover:bg-green-500 transition-colors">
            <FileText size={20} className="text-green-600 group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">Historial de Terceros</p>
            <p className="text-xs text-gray-400 mt-0.5">Ver todos los registros creados</p>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />
        </Link>
      </div>

      {/* Audit log */}
      <div className="pioneer-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Activity size={16} className="text-gray-400" />
            Registro de Actividad del Sistema
          </h2>
          <span className="text-xs text-gray-400">Últimas {recentLogs.length} acciones</span>
        </div>
        <div className="overflow-x-auto">
          <table className="pioneer-table">
            <thead>
              <tr>
                <th>Acción</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Entidad</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Sin actividad registrada
                  </td>
                </tr>
              ) : (
                recentLogs.map(log => {
                  const info = actionLabels[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={log.id}>
                      <td>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${info.color}`}>
                          {info.label}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{log.user.name}</p>
                          <p className="text-xs text-gray-400">{log.user.email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={log.user.role === 'admin' ? 'pioneer-badge-admin' : 'pioneer-badge-user'}>
                          {log.user.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-gray-500">
                          {log.entity || '—'}
                          {log.entityId && (
                            <span className="text-gray-300 ml-1 font-mono">#{log.entityId.slice(-6)}</span>
                          )}
                        </span>
                      </td>
                      <td>
                        <div>
                          <p className="text-xs text-gray-600">
                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {formatDistanceToNow(new Date(log.createdAt), { locale: es, addSuffix: true })}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
