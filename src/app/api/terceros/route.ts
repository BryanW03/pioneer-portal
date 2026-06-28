import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// GET - list all terceros
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { nombreRazon: { contains: search } },
          { rncCedula: { contains: search } },
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
      select: {
        id: true,
        rncCedula: true,
        nombreRazon: true,
        telefono: true,
        correo: true,
        direccion: true,
        porcImpuesto: true,
        observaciones: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdByName: true,
        createdByEmail: true,
      },
    }),
    prisma.tercero.count({ where }),
  ])

  return NextResponse.json({ terceros, total, page, limit, pages: Math.ceil(total / limit) })
}

// POST - create new tercero
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { rncCedula, nombreRazon, telefono, correo, direccion, porcImpuesto, observaciones } = body

  // Validate required
  if (!rncCedula?.trim()) return NextResponse.json({ error: 'RNC/Cédula es requerido' }, { status: 400 })
  if (!nombreRazon?.trim()) return NextResponse.json({ error: 'Nombre/Razón Social es requerido' }, { status: 400 })
  if (!telefono?.trim()) return NextResponse.json({ error: 'Teléfono es requerido' }, { status: 400 })

  // Check duplicate RNC
  const existing = await prisma.tercero.findUnique({ where: { rncCedula: rncCedula.trim() } })
  if (existing) {
    return NextResponse.json({ error: `Ya existe un tercero con RNC/Cédula ${rncCedula}` }, { status: 409 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true, name: true, email: true },
  })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const tercero = await prisma.tercero.create({
    data: {
      rncCedula: rncCedula.trim(),
      nombreRazon: nombreRazon.trim(),
      telefono: telefono.trim(),
      correo: correo?.trim() || null,
      direccion: direccion?.trim() || null,
      porcImpuesto: porcImpuesto?.trim() || null,
      observaciones: observaciones?.trim() || null,
      createdById: user.id,
      createdByName: user.name,
      createdByEmail: user.email,
    },
  })

  await createAuditLog({
    userId: user.id,
    action: 'CREATE_TERCERO',
    entity: 'Tercero',
    entityId: tercero.id,
    details: { nombre: tercero.nombreRazon, rnc: tercero.rncCedula },
    ip: req.headers.get('x-forwarded-for') || 'unknown',
  })

  return NextResponse.json(tercero, { status: 201 })
}
