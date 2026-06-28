import { prisma } from './prisma'

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE_TERCERO'
  | 'EDIT_TERCERO'
  | 'DELETE_TERCERO'
  | 'CREATE_USER'
  | 'EDIT_USER'
  | 'DEACTIVATE_USER'
  | 'ACTIVATE_USER'
  | 'CHANGE_ROLE'

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  details,
  ip,
}: {
  userId: string
  action: AuditAction
  entity?: string
  entityId?: string
  details?: Record<string, unknown>
  ip?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ip,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
