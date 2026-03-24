import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/registro') || 
    request.nextUrl.pathname.startsWith('/pendiente') ||
    request.nextUrl.pathname.startsWith('/recuperar-contraseña') ||
    request.nextUrl.pathname.startsWith('/restablecer-contraseña') ||
    request.nextUrl.pathname.startsWith('/api/') // IMPORTANTE: permitir APIs

  // 1. Si no hay sesión y no es ruta pública -> Login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Si hay sesión, verificar estado usando API interna
  if (user && !isPublicRoute) {
    try {
      const verifyUrl = new URL('/api/usuarios/verificar-estado', request.url)
      
      const verifyResponse = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabaseId: user.id })
      })
      
      const { estado } = await verifyResponse.json()
      
      if (estado !== 'APROBADO') {
        return NextResponse.redirect(new URL('/pendiente', request.url))
      }
    } catch (error) {
      console.error('Error verificando estado:', error)
      return NextResponse.redirect(new URL('/pendiente', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}