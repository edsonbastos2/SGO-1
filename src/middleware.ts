import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ROUTES = ['/login', '/api/auth/login']
const JWT_SECRET    = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret')

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Permite rotas públicas e assets
  if (
    PUBLIC_ROUTES.some(r => pathname.startsWith(r)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('sgo_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.set('sgo_token', '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
