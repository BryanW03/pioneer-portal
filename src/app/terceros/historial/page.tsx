import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, FileText, User, Calendar, Phone, Mail } from 'lucide-react'

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string }
}) {
  const session = await getServerSession(authOptions)
  const search = searchParams.search || ''
  const page = parseInt(searchParams.page || '1')
  const limit = 15
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { nombreRazon: { contains: search } },
          { rncCedula: { contains: search } },
          { createdByName: { contains: search } },
          { correo: { contains: search } },
        ],
      }
    : {}

  const [terceros, total] = await Promise.all([
    prisma.tercero.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tercero.count({ where }),
  ])

  const pages = Math.ceil(total / limit)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>Portal</span><span>/</span>
          <span className="text-pioneer-purple font-medium">Historial de Terceros</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historial de Terceros</h1>
            <p className="text-gray-500 mt-1 text-sm">{total} registros en total</p>
          </div>
          <a href="/terceros/nuevo" className="pioneer-btn-primary flex items-center gap-2 text-sm">
            <FileText size={16} /> Crear Tercero
          </a>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <form>
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre, RNC o creador..."
            className="pioneer-input pl-10"
          />
        </form>
      </div>

      {/* Table */}
      <div className="pioneer-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="pioneer-table">
            <thead>
              <tr>
                <th>RNC / Cédula</th>
                <th>Nombre / Razón Social</th>
                <th>Contacto</th>
                <th>% Imp.</th>
                <th>Estado</th>
                <th>Creado por</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {terceros.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {search ? `Sin resultados para "${search}"` : 'No hay terceros registrados aún'}
                  </td>
                </tr>
              ) : (
                terceros.map(t => (
                  <tr key={t.id}>
                    <td>
                      <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        {t.rncCedula}
                      </span>
                    </td>
                    <td>
                      <p className="font-medium text-gray-800 text-sm">{t.nombreRazon}</p>
                      {t.direccion && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{t.direccion}</p>
                      )}
                    </td>
                    <td>
                      {t.telefono && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone size={10} /> {t.telefono}
                        </div>
                      )}
                      {t.correo && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Mail size={10} /> {t.correo}
                        </div>
                      )}
                    </td>
                    <td>
                      {t.porcImpuesto ? (
                        <span className="text-sm font-medium text-pioneer-purple">{t.porcImpuesto}%</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <span className={t.status === 'activo' ? 'pioneer-badge-active' : 'pioneer-badge-inactive'}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-pioneer-purple-pale flex items-center justify-center flex-shrink-0">
                          <User size={10} className="text-pioneer-purple" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">{t.createdByName}</p>
                          <p className="text-[10px] text-gray-400">{t.createdByEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={10} />
                        <span title={format(new Date(t.createdAt), "dd/MM/yyyy HH:mm")}>
                          {formatDistanceToNow(new Date(t.createdAt), { locale: es, addSuffix: true })}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              Página {page} de {pages} ({total} registros)
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <a
                  href={`?page=${page - 1}${search ? `&search=${search}` : ''}`}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                >
                  ← Anterior
                </a>
              )}
              {page < pages && (
                <a
                  href={`?page=${page + 1}${search ? `&search=${search}` : ''}`}
                  className="px-3 py-1.5 text-xs border border-pioneer-purple rounded-lg
                    bg-pioneer-purple text-white hover:bg-pioneer-purple-light"
                >
                  Siguiente →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
