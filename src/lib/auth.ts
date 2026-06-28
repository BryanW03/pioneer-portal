import { NextAuthOptions } from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'b.deleon@pioneerfunds.do'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only allow users from pioneerfunds.do domain
      const email = user.email || ''
      const domain = email.split('@')[1]

      if (domain !== 'pioneerfunds.do') {
        return false
      }

      // Auto-create/update user in our DB
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (!existingUser) {
        // Only admin can create users OR it's the super admin
        if (email === ADMIN_EMAIL) {
          await prisma.user.upsert({
            where: { email },
            update: { name: user.name || email, image: user.image },
            create: {
              email,
              name: user.name || email,
              image: user.image,
              role: 'admin',
              isActive: true,
            },
          })
        } else {
          // New user not pre-created by admin — deny access
          return '/login?error=not_authorized'
        }
      } else if (!existingUser.isActive) {
        return '/login?error=account_disabled'
      }

      // Log login event
      if (existingUser) {
        await prisma.auditLog.create({
          data: {
            userId: existingUser.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: existingUser.id,
            details: JSON.stringify({ provider: account?.provider }),
          },
        })
      }

      return true
    },

    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
          select: { id: true, role: true, isActive: true, department: true },
        })

        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.isActive = dbUser.isActive
          session.user.department = dbUser.department
        }
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'database',
    maxAge: 8 * 60 * 60, // 8 hours (work day)
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      isActive: boolean
      department?: string | null
    }
  }
}
