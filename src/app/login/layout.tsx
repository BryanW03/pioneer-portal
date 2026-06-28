import { Suspense } from 'react'
import LoginPage from './page'

export default function LoginLayout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-pioneer-purple">
        <div className="text-white text-sm">Cargando...</div>
      </div>
    }>
      <LoginPage />
    </Suspense>
  )
}
