import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes: require admin role
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard?error=no_access', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Public routes
        if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) return true
        // Everything else requires auth
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)',
  ],
}
