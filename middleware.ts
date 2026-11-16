import { NextRequest, NextResponse } from 'next/server'

const COOKIE = 'hr2_access_token'

function isPublicExternalApi(pathname: string) {
  return /^\/api\/(evaluation|candidate|offer)\/[^/]+\/?$/.test(pathname) || /^\/api\/forms\/public\/[^/]+\/?$/.test(pathname) || /^\/api\/financial-clearances\/public\/[^/]+\/?$/.test(pathname) || /^\/api\/hr\/employee-documents-dashboard\/share\/[0-9a-f-]{36}\/?$/i.test(pathname)
}

function isPublicDashboardShare(request: NextRequest) {
  return request.nextUrl.pathname === '/hr/employee-documents' && /^[0-9a-f-]{36}$/i.test(request.nextUrl.searchParams.get('share') || '')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // All website pages are accessible without signing in.
  // Keep authentication enforcement for API endpoints.
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    isPublicExternalApi(pathname) ||
    isPublicDashboardShare(request)
  ) return NextResponse.next()

  const token = request.cookies.get(COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'] }
