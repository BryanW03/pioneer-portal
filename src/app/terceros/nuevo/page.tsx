import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TerceroForm } from '@/components/forms/TerceroForm'

export const dynamic = 'force-dynamic'

export default async function NuevoTerceroPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>Portal</span>
          <span>/</span>
          <span className="text-pioneer-purple font-medium">Crear Tercero</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Formulario para Crear Tercero</h1>
        <p className="text-gray-500 mt-1 text-sm">Complete todos los campos requeridos. Pioneer | Formulario de Terceros | Confidencial</p>
      </div>

      <TerceroForm
        userName={session?.user?.name || ''}
        userEmail={session?.user?.email || ''}
        userId={session?.user?.id || ''}
      />
    </div>
  )
}
