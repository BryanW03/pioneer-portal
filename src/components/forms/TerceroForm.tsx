'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader, Save, RotateCcw } from 'lucide-react'

interface Props {
  userName: string
  userEmail: string
  userId: string
}

interface FormData {
  rncCedula: string
  nombreRazon: string
  telefono: string
  correo: string
  direccion: string
  porcImpuesto: string
  observaciones: string
}

const initialForm: FormData = {
  rncCedula: '',
  nombreRazon: '',
  telefono: '',
  correo: '',
  direccion: '',
  porcImpuesto: '',
  observaciones: '',
}

export function TerceroForm({ userName, userEmail, userId }: Props) {
  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [successData, setSuccessData] = useState<{ id: string; nombre: string } | null>(null)
  const router = useRouter()

  const validate = () => {
    const newErrors: Partial<FormData> = {}
    if (!form.rncCedula.trim()) newErrors.rncCedula = 'El RNC/Cédula es requerido'
    else if (!/^\d{9,11}$/.test(form.rncCedula.trim()))
      newErrors.rncCedula = 'Debe contener entre 9 y 11 dígitos sin guiones'
    if (!form.nombreRazon.trim()) newErrors.nombreRazon = 'El nombre/razón social es requerido'
    if (!form.telefono.trim()) newErrors.telefono = 'El teléfono es requerido'
    if (form.correo && !/\S+@\S+\.\S+/.test(form.correo))
      newErrors.correo = 'Formato de correo inválido'
    if (form.porcImpuesto && isNaN(Number(form.porcImpuesto)))
      newErrors.porcImpuesto = 'Debe ser un número'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/terceros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId, userName, userEmail }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Error al guardar el tercero')
        setStatus('error')
        return
      }

      setSuccessData({ id: data.id, nombre: data.nombreRazon })
      setStatus('success')
      setForm(initialForm)
    } catch {
      setErrorMsg('Error de conexión. Intente de nuevo.')
      setStatus('error')
    }
  }

  const handleReset = () => {
    setForm(initialForm)
    setErrors({})
    setStatus('idle')
    setErrorMsg('')
    setSuccessData(null)
  }

  if (status === 'success' && successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="pioneer-card p-10 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Tercero creado exitosamente!</h2>
        <p className="text-gray-500 mb-1">
          <strong>{successData.nombre}</strong> fue registrado correctamente.
        </p>
        <p className="text-xs text-gray-400 mb-6">Registrado por: {userName} ({userEmail})</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={handleReset} className="pioneer-btn-primary">
            Crear otro tercero
          </button>
          <button
            onClick={() => router.push('/terceros/historial')}
            className="pioneer-btn-secondary"
          >
            Ver historial
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Error banner */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl"
        >
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{errorMsg}</p>
        </motion.div>
      )}

      {/* Form card */}
      <div className="pioneer-card overflow-hidden">
        {/* Form header — Pioneer brand */}
        <div className="bg-pioneer-purple px-6 py-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center flex-shrink-0">
            <PioneerMark className="w-9 h-9 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">FORMULARIO PARA CREAR TERCERO</h2>
            <p className="text-white/60 text-sm">Complete todos los campos requeridos</p>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-8">
          {/* ── IDENTIFICACIÓN ── */}
          <Section title="Identificación">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">RNC / Cédula (sin guiones) <Required /></label>
                <input
                  type="text"
                  name="rncCedula"
                  value={form.rncCedula}
                  onChange={handleChange}
                  placeholder="133334437"
                  maxLength={11}
                  className={`pioneer-input ${errors.rncCedula ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.rncCedula && <FieldError msg={errors.rncCedula} />}
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Nombre / Razón Social <Required /></label>
                <input
                  type="text"
                  name="nombreRazon"
                  value={form.nombreRazon}
                  onChange={handleChange}
                  placeholder="Ej. Ubaldo & GL Virtual Entertaiment, S.R.L"
                  className={`pioneer-input ${errors.nombreRazon ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.nombreRazon && <FieldError msg={errors.nombreRazon} />}
              </div>
            </div>
          </Section>

          {/* ── INFORMACIÓN DE CONTACTO ── */}
          <Section title="Información de Contacto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Teléfono <Required /></label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="+1 (849) 221-1190"
                  className={`pioneer-input ${errors.telefono ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.telefono && <FieldError msg={errors.telefono} />}
              </div>
              <div>
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="correo@empresa.com"
                  className={`pioneer-input ${errors.correo ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                {errors.correo && <FieldError msg={errors.correo} />}
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Ej. PASEO DEL SOL, RESIDENCIAL VILLAS BAVARO..."
                  className="pioneer-input"
                />
              </div>
            </div>
          </Section>

          {/* ── INFORMACIÓN FISCAL ── */}
          <Section title="Información Fiscal">
            <div className="max-w-xs">
              <label className="form-label">% de Impuesto</label>
              <input
                type="text"
                name="porcImpuesto"
                value={form.porcImpuesto}
                onChange={handleChange}
                placeholder="18"
                className={`pioneer-input ${errors.porcImpuesto ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.porcImpuesto && <FieldError msg={errors.porcImpuesto} />}
              <p className="text-xs text-gray-400 mt-1">Porcentaje de retención de impuesto aplicable</p>
            </div>
          </Section>

          {/* ── OBSERVACIONES ── */}
          <Section title="Observaciones">
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={4}
              placeholder="SOLICITUD CREAR NUEVO INQUILINO INMUEBLE DTMPC."
              className="pioneer-input resize-none"
            />
          </Section>

          {/* ── AUDIT INFO ── */}
          <div className="bg-pioneer-purple-pale rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-pioneer-purple rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-pioneer-purple">Registro de autoría</p>
              <p className="text-xs text-pioneer-purple/70">
                Este formulario quedará registrado como creado por <strong>{userName}</strong> ({userEmail})
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100 flex-wrap">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="pioneer-btn-primary flex items-center gap-2"
            >
              {status === 'loading' ? (
                <><Loader size={16} className="animate-spin" /> Guardando...</>
              ) : (
                <><Save size={16} /> Guardar Tercero</>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={status === 'loading'}
              className="pioneer-btn-secondary flex items-center gap-2"
            >
              <RotateCcw size={16} /> Limpiar
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-8 py-3 bg-gray-50 text-center">
          <p className="text-xs text-gray-400">Pioneer | Formulario de Terceros | Confidencial</p>
        </div>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-pioneer-purple font-bold text-sm uppercase tracking-wider">{title}</h3>
        <div className="flex-1 h-px bg-pioneer-purple/20" />
      </div>
      {children}
    </div>
  )
}

function Required() {
  return <span className="text-red-500 ml-0.5">*</span>
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10} />{msg}</p>
}

function PioneerMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="currentColor">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24
        const rad = (angle * Math.PI) / 180
        const outerR = 42 + (i % 3) * 8
        const x1 = 60 + 12 * Math.cos(rad), y1 = 60 + 12 * Math.sin(rad)
        const x2 = 60 + outerR * Math.cos(rad), y2 = 60 + outerR * Math.sin(rad)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          strokeWidth={Math.max(0.8, 2.5 - i * 0.05)} stroke="currentColor"
          strokeLinecap="round" opacity={0.7 + (i % 4) * 0.075} />
      })}
      <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.9" />
    </svg>
  )
}
