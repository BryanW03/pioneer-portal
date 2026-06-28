'use client'

import { useState, useEffect, useCallback } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronRight, AlertCircle, Building2 } from 'lucide-react'

// Pioneer brand gradient slides (since we don't have actual photos,
// we use professional CSS gradient scenes — replace with real images later)
const slides = [
  {
    id: 0,
    gradient: 'linear-gradient(135deg, #392B6F 0%, #1a1535 40%, #0a0820 100%)',
    overlay: 'rgba(57, 43, 111, 0.3)',
    title: 'Gestión de Inversiones',
    subtitle: 'Soluciones financieras de alto desempeño',
    // If you have real images, add: image: '/images/slide1.jpg'
  },
  {
    id: 1,
    gradient: 'linear-gradient(135deg, #010101 0%, #2A1E55 50%, #392B6F 100%)',
    overlay: 'rgba(1, 1, 1, 0.4)',
    title: 'Excelencia Operativa',
    subtitle: 'Tecnología e innovación al servicio de Pioneer',
  },
  {
    id: 2,
    gradient: 'linear-gradient(135deg, #5A4B9A 0%, #392B6F 30%, #010101 100%)',
    overlay: 'rgba(90, 75, 154, 0.25)',
    title: 'Fondos de Inversión',
    subtitle: 'Confianza y transparencia en cada decisión',
  },
  {
    id: 3,
    gradient: 'linear-gradient(160deg, #1a1535 0%, #392B6F 60%, #7B6AAD 100%)',
    overlay: 'rgba(57, 43, 111, 0.2)',
    title: 'Portal Corporativo',
    subtitle: 'Acceso seguro para el equipo Pioneer',
  },
]

// Decorative geometric elements inspired by the Pioneer isotipo
function PioneerIsotipo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="currentColor">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24
        const rad = (angle * Math.PI) / 180
        const innerR = 12
        const outerR = 42 + (i % 3) * 8
        const x1 = 60 + innerR * Math.cos(rad)
        const y1 = 60 + innerR * Math.sin(rad)
        const x2 = 60 + outerR * Math.cos(rad)
        const y2 = 60 + outerR * Math.sin(rad)
        const w = 2.5 - i * 0.05
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            strokeWidth={Math.max(0.8, w)}
            stroke="currentColor"
            strokeLinecap="round"
            opacity={0.7 + (i % 4) * 0.075}
          />
        )
      })}
      <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

export default function LoginPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  // Auto-advance slideshow every 5s
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  const handleMicrosoftLogin = async () => {
    setIsLoading(true)
    try {
      await signIn('azure-ad', { callbackUrl: '/dashboard' })
    } catch {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (err: string | null) => {
    switch (err) {
      case 'not_authorized':
        return 'Tu cuenta no está autorizada. Contacta al administrador.'
      case 'account_disabled':
        return 'Tu cuenta está desactivada. Contacta al administrador.'
      case 'OAuthSignin':
      case 'OAuthCallback':
        return 'Error al conectar con Microsoft. Intenta de nuevo.'
      case 'AccessDenied':
        return 'Acceso denegado. Solo cuentas @pioneerfunds.do están autorizadas.'
      default:
        return null
    }
  }

  const errorMessage = getErrorMessage(error)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#392B6F' }}>
        <div className="flex flex-col items-center gap-4">
          <PioneerIsotipo className="w-16 h-16 text-white animate-spin" />
          <p className="text-white/70 text-sm">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── LEFT: Slideshow ────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        {/* Slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ background: slides[currentSlide].gradient }}
          />
        </AnimatePresence>

        {/* Geometric overlay pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Large decorative isotipo */}
        <div className="absolute -right-16 -top-16 opacity-5">
          <PioneerIsotipo className="w-96 h-96 text-white" />
        </div>
        <div className="absolute -left-8 -bottom-8 opacity-5">
          <PioneerIsotipo className="w-72 h-72 text-white" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <PioneerIsotipo className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg leading-tight">Pioneer</p>
              <p className="text-white/60 text-xs">Investment Funds</p>
            </div>
          </div>

          {/* Slide text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <h2 className="text-white text-4xl font-bold leading-tight mb-3">
                {slides[currentSlide].title}
              </h2>
              <p className="text-white/70 text-lg">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form ───────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-pioneer-purple flex items-center justify-center">
              <PioneerIsotipo className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-pioneer-purple">Pioneer Investment Funds</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pioneer-purple-pale text-pioneer-purple text-xs font-semibold mb-4">
              <Shield size={12} />
              Portal Seguro
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido
            </h1>
            <p className="text-gray-500 text-sm">
              Inicia sesión con tu cuenta corporativa de Microsoft para acceder al portal.
            </p>
          </div>

          {/* Error message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl"
            >
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </motion.div>
          )}

          {/* Microsoft Login Button */}
          <button
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
                       border-2 border-pioneer-purple bg-pioneer-purple text-white
                       font-semibold text-sm hover:bg-pioneer-purple-light
                       transition-all duration-200 focus:outline-none focus:ring-4
                       focus:ring-pioneer-purple/20 disabled:opacity-60
                       disabled:cursor-not-allowed shadow-lg shadow-pioneer-purple/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <MicrosoftLogo />
            )}
            {isLoading ? 'Conectando...' : 'Continuar con Microsoft'}
            {!isLoading && <ChevronRight size={16} className="ml-auto opacity-70" />}
          </button>

          {/* Domain hint */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-pioneer-purple-pale rounded-lg">
            <Building2 size={14} className="text-pioneer-purple flex-shrink-0" />
            <p className="text-pioneer-purple text-xs">
              Solo cuentas <strong>@pioneerfunds.do</strong> están autorizadas
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-gray-100" />

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              ¿Problemas de acceso?{' '}
              <a
                href="mailto:b.deleon@pioneerfunds.do"
                className="text-pioneer-purple hover:underline font-medium"
              >
                Contacta al administrador
              </a>
            </p>
          </div>
        </motion.div>

        {/* Bottom brand */}
        <div className="mt-auto pt-8">
          <p className="text-gray-300 text-xs text-center">
            © {new Date().getFullYear()} Pioneer Investment Funds · Uso Interno
          </p>
        </div>
      </div>
    </div>
  )
}

function MicrosoftLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  )
}
