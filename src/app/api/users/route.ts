import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// GET - list users (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true, email: true, name: true, image: true,
      role: true, isActive: true, department: true,
      createdAt: true, createdBy: true,
      _count: { select: { terceros: true } },
    },
  })

  return NextResponse.json(users)
}

// POST - create new user (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const body = await req.json()
  const { email, name, role, department } = body

  if (!email?.trim()) return NextResponse.json({ error: 'El correo es requerido' }, { status: 400 })
  if (!name?.trim()) return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
  if (!email.endsWith('@pioneerfunds.do'))
    return NextResponse.json({ error: 'Solo correos @pioneerfunds.do están permitidos' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
  if (existing) return NextResponse.json({ error: 'Ya existe un usuario con ese correo' }, { status: 409 })

  const adminUser = await prisma.user.findUnique({ where: { email: session.user.email! } })

  const newUser = await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      role: role || 'user',
      department: department?.trim() || null,
      isActive: true,
      createdBy: session.user.email,
    },
  })

  if (adminUser) {
    await createAuditLog({
      userId: adminUser.id,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role, name: newUser.name },
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    })
  }

  return NextResponse.json(newUser, { status: 201 })
}

// PUT - update user info (admin only)
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const body = await req.json()
  const { id, name, role, department } = body

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  // Cannot change super admin role
  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const SUPER_ADMIN = process.env.ADMIN_EMAIL || 'b.deleon@pioneerfunds.do'
  if (targetUser.email === SUPER_ADMIN && role && role !== 'admin')
    return NextResponse.json({ error: 'No se puede cambiar el rol del super administrador' }, { status: 403 })

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: name?.trim() || targetUser.name,
      role: role || targetUser.role,
      department: department?.trim() ?? targetUser.department,
    },
  })

  const adminUser = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (adminUser) {
    await createAuditLog({
      userId: adminUser.id,
      action: 'EDIT_USER',
      entity: 'User',
      entityId: id,
      details: { changes: { name, role, department } },
    })
  }

  return NextResponse.json(updatedUser)
}

// PATCH - toggle active / change role quickly
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (session.user.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const body = await req.json()
  const { id, isActive, role } = body

  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const SUPER_ADMIN = process.env.ADMIN_EMAIL || 'b.deleon@pioneerfunds.do'
  if (targetUser.email === SUPER_ADMIN)
    return NextResponse.json({ error: 'No se puede modificar al super administrador' }, { status: 403 })

  if (targetUser.email === session.user.email)
    return NextResponse.json({ error: 'No puedes modificar tu propio acceso' }, { status: 403 })

  const updateData: Record<string, unknown> = {}
  if (typeof isActive === 'boolean') updateData.isActive = isActive
  if (role) updateData.role = role

  const updatedUser = await prisma.user.update({ where: { id }, data: updateData })

  const adminUser = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (adminUser) {
    const action = typeof isActive === 'boolean'
      ? (isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER')
      : 'CHANGE_ROLE'
    await createAuditLog({
      userId: adminUser.id,
      action: action as any,
      entity: 'User',
      entityId: id,
      details: updateData as Record<string, unknown>,
    })
  }

  return NextResponse.json(updatedUser)
}
