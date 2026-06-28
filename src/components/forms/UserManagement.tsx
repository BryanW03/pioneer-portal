'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, Shield, User, Edit2, Power, X, Check,
  AlertTriangle, Mail, Building, Calendar, FileText, Loader
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface UserData {
  id: string
  email: string
  name: string
  image?: string | null
  role: string
  isActive: boolean
  department?: string | null
  createdAt: Date
  createdBy?: string | null
  _count: { terceros: number }
}

interface Props {
  users: UserData[]
  currentUserEmail: string
}

export function UserManagement({ users: initialUsers, currentUserEmail }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deactivate' | 'activate' | 'role'
    user: UserData
    newRole?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 4000)
  }

  // ── CREATE / EDIT USER ────────────────────────────────────────────────
  const handleSaveUser = async (data: Partial<UserData> & { email: string; name: string }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: editingUser ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser ? { ...data, id: editingUser.id } : data),
      })
      const result = await res.json()
      if (!res.ok) {
        showFeedback('error', result.error || 'Error al guardar usuario')
        return
      }
      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...result } : u))
        showFeedback('success', `Usuario ${result.name} actualizado`)
      } else {
        setUsers(prev => [...prev, { ...result, _count: { terceros: 0 } }])
        showFeedback('success', `Usuario ${result.name} creado exitosamente`)
      }
      setShowModal(false)
      setEditingUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ── TOGGLE ACTIVE / ROLE ──────────────────────────────────────────────
  const handleConfirmedAction = async () => {
    if (!confirmAction) return
    setLoading(true)
    try {
      const body =
        confirmAction.type === 'role'
          ? { id: confirmAction.user.id, role: confirmAction.newRole }
          : { id: confirmAction.user.id, isActive: confirmAction.type === 'activate' }

      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (!res.ok) {
        showFeedback('error', result.error || 'Error al actualizar usuario')
        return
      }
      setUsers(prev => prev.map(u => u.id === confirmAction.user.id ? { ...u, ...result } : u))
      showFeedback('success',
        confirmAction.type === 'role'
          ? `Rol de ${confirmAction.user.name} actualizado a ${confirmAction.newRole}`
          : `${confirmAction.user.name} ${confirmAction.type === 'activate' ? 'activado' : 'desactivado'}`
      )
    } finally {
      setLoading(false)
      setConfirmAction(null)
    }
  }

  const activeUsers = users.filter(u => u.isActive)
  const inactiveUsers = users.filter(u => !u.isActive)
  const adminUsers = users.filter(u => u.role === 'admin')

  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total usuarios', val: users.length, icon: <Users size={16} /> },
          { label: 'Activos', val: activeUsers.length, icon: <Check size={16} className="text-green-600" /> },
          { label: 'Administradores', val: adminUsers.length, icon: <Shield size={16} className="text-pioneer-purple" /> },
          { label: 'Inactivos', val: inactiveUsers.length, icon: <Power size={16} className="text-red-500" /> },
        ].map(({ label, val, icon }) => (
          <div key={label} className="pioneer-card p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              {icon}
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{val}</p>
          </div>
        ))}
      </div>

      {/* Feedback toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 p-4 mb-4 rounded-xl border ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-100 text-green-700'
                : 'bg-red-50 border-red-100 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span className="text-sm">{feedback.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-semibold text-gray-700 text-sm">{users.length} usuarios registrados</h2>
        <button
          onClick={() => { setEditingUser(null); setShowModal(true) }}
          className="pioneer-btn-primary flex items-center gap-2 text-sm py-2.5"
        >
          <Plus size={16} /> Crear Usuario
        </button>
      </div>

      {/* Users table */}
      <div className="pioneer-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="pioneer-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Departamento</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Terceros</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const isSelf = user.email === currentUserEmail
                const isSuperAdmin = user.email === 'b.deleon@pioneerfunds.do'
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pioneer-purple-pale flex items-center
                          justify-center text-pioneer-purple font-semibold text-sm flex-shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm flex items-center gap-1.5">
                            {user.name}
                            {isSelf && (
                              <span className="text-[9px] bg-pioneer-purple-pale text-pioneer-purple px-1.5 py-0.5 rounded-full font-bold">
                                TÚ
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-600">{user.department || '—'}</span>
                    </td>
                    <td>
                      {isSuperAdmin ? (
                        <span className="pioneer-badge-admin"><Shield size={10} /> Super Admin</span>
                      ) : (
                        <select
                          value={user.role}
                          disabled={isSelf}
                          onChange={e => setConfirmAction({ type: 'role', user, newRole: e.target.value })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5
                            focus:outline-none focus:ring-2 focus:ring-pioneer-purple
                            disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                          <option value="user">Usuario</option>
                          <option value="admin">Administrador</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <span className={user.isActive ? 'pioneer-badge-active' : 'pioneer-badge-inactive'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FileText size={12} className="text-gray-400" />
                        {user._count.terceros}
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-gray-400">
                        {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditingUser(user); setShowModal(true) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-pioneer-purple
                            hover:bg-pioneer-purple-pale transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        {!isSuperAdmin && !isSelf && (
                          <button
                            onClick={() => setConfirmAction({
                              type: user.isActive ? 'deactivate' : 'activate',
                              user,
                            })}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isActive
                                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={user.isActive ? 'Desactivar' : 'Activar'}
                          >
                            <Power size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE/EDIT MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <UserModal
            user={editingUser}
            onSave={handleSaveUser}
            onClose={() => { setShowModal(false); setEditingUser(null) }}
            loading={loading}
            currentUserEmail={currentUserEmail}
          />
        )}
      </AnimatePresence>

      {/* ── CONFIRM MODAL ── */}
      <AnimatePresence>
        {confirmAction && (
          <ConfirmModal
            action={confirmAction}
            onConfirm={handleConfirmedAction}
            onCancel={() => setConfirmAction(null)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ── USER MODAL ─────────────────────────────────────────────────────────────
function UserModal({ user, onSave, onClose, loading, currentUserEmail }: {
  user: UserData | null
  onSave: (data: any) => void
  onClose: () => void
  loading: boolean
  currentUserEmail: string
}) {
  const [form, setForm] = useState({
    email: user?.email || '',
    name: user?.name || '',
    role: user?.role || 'user',
    department: user?.department || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (!form.email.trim()) e.email = 'El correo es requerido'
    else if (!form.email.endsWith('@pioneerfunds.do'))
      e.email = 'Debe ser un correo @pioneerfunds.do'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-pioneer-purple px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold">{user ? 'Editar Usuario' : 'Crear Usuario'}</h3>
            <p className="text-white/60 text-sm">{user ? user.email : 'Nuevo acceso al portal'}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="form-label">Nombre completo *</label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ej. María García"
              className={`pioneer-input ${errors.name ? 'border-red-400' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="form-label flex items-center gap-1"><Mail size={12} /> Correo corporativo *</label>
            <input
              type="email"
              value={form.email}
              disabled={!!user}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="nombre@pioneerfunds.do"
              className={`pioneer-input ${errors.email ? 'border-red-400' : ''} ${user ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-400 mt-1">Solo correos @pioneerfunds.do</p>
          </div>

          <div>
            <label className="form-label flex items-center gap-1"><Building size={12} /> Departamento</label>
            <input
              value={form.department}
              onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
              placeholder="Ej. IT, Finanzas, Operaciones"
              className="pioneer-input"
            />
          </div>

          <div>
            <label className="form-label flex items-center gap-1"><Shield size={12} /> Rol de acceso</label>
            <select
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="pioneer-input"
            >
              <option value="user">Usuario — Acceso estándar</option>
              <option value="admin">Administrador — Acceso total</option>
            </select>
            <div className="mt-2 p-3 bg-pioneer-purple-pale rounded-lg">
              <p className="text-xs text-pioneer-purple font-medium mb-1">
                {form.role === 'admin' ? '🔐 Administrador' : '👤 Usuario estándar'}
              </p>
              <p className="text-xs text-pioneer-purple/70">
                {form.role === 'admin'
                  ? 'Puede crear usuarios, cambiar roles y ver todos los registros.'
                  : 'Puede crear y ver terceros, ver historial propio.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="submit" disabled={loading} className="pioneer-btn-primary flex items-center gap-2 flex-1 justify-center">
              {loading ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
              {loading ? 'Guardando...' : user ? 'Guardar cambios' : 'Crear usuario'}
            </button>
            <button type="button" onClick={onClose} className="pioneer-btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ── CONFIRM MODAL ──────────────────────────────────────────────────────────
function ConfirmModal({ action, onConfirm, onCancel, loading }: {
  action: { type: string; user: UserData; newRole?: string }
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  const isDeactivate = action.type === 'deactivate'
  const isRole = action.type === 'role'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isDeactivate ? 'bg-red-100' : isRole ? 'bg-pioneer-purple-pale' : 'bg-green-100'
        }`}>
          {isDeactivate ? <Power className="text-red-500" size={22} /> :
           isRole ? <Shield className="text-pioneer-purple" size={22} /> :
           <Check className="text-green-600" size={22} />}
        </div>
        <h3 className="text-center font-bold text-gray-900 mb-2">
          {isDeactivate ? 'Desactivar usuario' :
           isRole ? 'Cambiar rol' : 'Activar usuario'}
        </h3>
        <p className="text-center text-gray-500 text-sm mb-6">
          {isDeactivate
            ? `¿Desactivar a ${action.user.name}? Ya no podrá acceder al portal.`
            : isRole
            ? `¿Cambiar el rol de ${action.user.name} a "${action.newRole === 'admin' ? 'Administrador' : 'Usuario'}"?`
            : `¿Reactivar el acceso de ${action.user.name}?`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
              ${isDeactivate ? 'bg-red-500 hover:bg-red-600 text-white' : 'pioneer-btn-primary'}`}
          >
            {loading ? <Loader size={14} className="animate-spin" /> : null}
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
          <button onClick={onCancel} className="flex-1 pioneer-btn-secondary py-2.5 text-sm">
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
