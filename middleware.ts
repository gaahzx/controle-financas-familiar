import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // MVP sem autenticação — apenas redireciona root para dashboard
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
