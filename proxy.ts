import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Acts as a gateway intercepting all requests before they reach pages/API routes
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Security Headers (Applied to all routes)
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // Admin Route Protection
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('sessionId')
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Cache Control for Static Assets
  if (pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // Cache Control for Public API Routes (exclude admin/auth)
  if (
    pathname.startsWith('/api/') && 
    !pathname.includes('/admin/') && 
    !pathname.includes('/auth/')
  ) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  }

  return response
}

// Matcher: Define which routes the proxy should intercept
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/image (image optimization)
     * - _next/static (static files)
     * - favicon.ico
     * - Image files (svg, png, jpg, jpeg, gif, webp, avif)
     */
    '/((?!_next/image|_next/static|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
