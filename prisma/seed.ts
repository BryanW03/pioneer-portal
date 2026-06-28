import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'b.deleon@pioneerfunds.do'

  // Upsert super admin
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      name: 'Bryan De León',
      role: 'admin',
      isActive: true,
      department: 'IT',
    },
  })

  console.log('✅ Super admin created/verified:', admin.email)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
