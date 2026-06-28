'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Users, FileText, History,
  LogOut, ChevronLeft, ChevronRight, Shield, User, Menu, X
} from 'lucide-react'

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
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            strokeWidth={Math.max(0.8, w)} stroke="currentColor"
            strokeLinecap="round" opacity={0.7 + (i % 4) * 0.075} />
        )
      })}
      <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
  { href: '/terceros', icon: FileText, label: 'Crear Tercero', adminOnly: false },
  { href: '/terceros/historial', icon: History, label: 'Historial Terceros', adminOnly: false },
  { href: '/admin', icon: Shield, label: 'Administración', adminOnly: true },
  { href: '/admin/usuarios', icon: Users, label: 'Gestión de Usuarios', adminOnly: true },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const filteredNav = navItems.filter(item => !item.adminOnly || isAdmin)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <PioneerIsotipo className="w-6 h-6 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight truncate">Pioneer</p>
            <p className="text-white/50 text-xs truncate">Investment Funds</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNav.map(({ href, icon: Icon, label, adminOnly }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 group relative
                ${active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
              {!collapsed && adminOnly && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 bg-white/20 text-white rounded-full">
                  ADMIN
                </span>
              )}
              {active && !collapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User & Sign out */}
      <div className="p-3 border-t border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={14} className="text-white" />
              )}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{session?.user?.name}</p>
              <p className="text-white/50 text-[10px] truncate">{session?.user?.email}</p>
            </div>
            {isAdmin && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white text-pioneer-purple rounded-full flex-shrink-0">
                ADMIN
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-white/60
            hover:bg-white/8 hover:text-white transition-all text-sm
            ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-pioneer-purple text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-pioneer-purple transition-transform duration-300 lg:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen bg-pioneer-purple sticky top-0
          transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-pioneer-purple rounded-full
            border-2 border-white/20 flex items-center justify-center text-white
            hover:bg-pioneer-purple-light transition-colors shadow-lg"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  )
}
