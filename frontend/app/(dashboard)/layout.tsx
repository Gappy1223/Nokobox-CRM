import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Usar getUser() para validación persistente en servidor
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Obtener el usuario de la DB
  const usuarioDB = await prisma.usuario.findUnique({
    where: { supabaseId: user.id }
  })

  // Si no existe o no está aprobado/activo, fuera.
  if (!usuarioDB || !usuarioDB.activo || usuarioDB.estado !== 'APROBADO') {
    redirect('/login')
  }

  const rol = usuarioDB.rol

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  // 3. Definición de items con href robustos
  const menuItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', // Esto apunta a app/(dashboard)/page.tsx
      icon: '📊', 
      ver: true 
    },
    { 
      label: 'Clientes', 
      href: '/clientes', 
      icon: '👥', 
      ver: rol === 'ADMIN' || rol === 'VENDEDOR' 
    },
    { 
      label: 'Cotizaciones', 
      href: '/cotizaciones', 
      icon: '📄', 
      ver: rol === 'ADMIN' || rol === 'VENDEDOR' 
    },
    { 
      label: 'Pedidos', 
      href: '/pedidos', 
      icon: '📦', 
      ver: rol === 'ADMIN' || rol === 'PRODUCCION' 
    },
    { 
      label: 'Interacciones', 
      href: '/interacciones', 
      icon: '💬', 
      ver: rol === 'ADMIN' || rol === 'VENDEDOR' 
    },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Mantenemos tu diseño Rojo */}
      <aside className="w-64 bg-red-800 text-white border-r border-red-900 shadow-sm flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-red-700/50">
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              NokoBox CRM
            </h1>
            <p className="text-[10px] text-red-200 mt-1 truncate">
              {user.email}
            </p>
            <div className="mt-2">
              <span className="px-2 py-0.5 bg-red-900/50 text-[9px] font-black rounded uppercase border border-red-700">
                {rol}
              </span>
            </div>
          </div>

          <nav className="px-3 py-4 space-y-1">
            {menuItems.map((item) => (
              item.ver && (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true} // Forzamos la precarga para evitar saltos al login
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-100 hover:bg-red-700 hover:text-white transition-all duration-200 font-bold text-sm"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              )
            ))}

            {rol === 'ADMIN' && (
              <div className="pt-6 mt-4 border-t border-red-700/30">
                <p className="px-4 text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">
                  Admin
                </p>
                <Link
                  href="/configuracion/usuarios"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200 font-bold text-sm"
                >
                  <span>🔐</span> Usuarios
                </Link>
              </div>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-red-700/50">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-200 hover:text-white hover:bg-red-700 rounded-xl transition-all duration-200 font-bold text-sm"
            >
              <span>🚪</span> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 bg-slate-50 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}