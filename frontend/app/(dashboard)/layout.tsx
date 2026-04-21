import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Server Action
  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-red-800 text-white border-r border-red-900 shadow-sm flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-white tracking-tight">
              NokoBox CRM
            </h1>
            <p className="text-xs text-red-200 mt-1 truncate">
              {session.user.email}
            </p>
          </div>

          {/* Navegación */}
          <nav className="px-3 py-4 space-y-1">

            {/* ITEM */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200 font-medium">
              <span className="text-lg">📊</span>
              Dashboard
            </Link>

            <Link
              href="/clientes"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200 font-medium">
              <span className="text-lg">👥</span>
              Clientes
            </Link>

            <Link
              href="/pedidos"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200 font-medium"
            >
              <span className="text-lg">📦</span>
              Pedidos
            </Link>

            <Link
              href="/cotizaciones"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200 font-medium">
              <span className="text-lg">💰</span>
              Cotizaciones
            </Link>

            <Link
              href="/interacciones"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200 font-medium">
              <span className="text-lg">💬</span>
              Interacciones
            </Link>

            {/* Configuración */}
            <div className="pt-6 mt-4">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Configuración
              </p>

              <Link
                href="/configuracion/usuarios"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200 font-medium">
                <span className="text-lg">🔐</span>
                Usuarios
              </Link>

              <Link
                href="/configuracion/perfil"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-200 hover:bg-red-700 hover:text-white transition-all duration-200 font-medium">
                <span className="text-lg">⚙️</span>
                Mi Perfil
              </Link>
            </div>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-7 px-4 py-2.5 text-red-200 hover:text-white hover:bg-red-700 rounded-xl transition-all duration-200"
            >
              <span>🚪</span>
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>


      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}