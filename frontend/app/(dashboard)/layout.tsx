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
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              NokoBox CRM
            </h1>
            <p className="text-sm text-gray-600 mt-1 truncate">
              {session.user.email}
            </p>
          </div>

          <nav className="px-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition font-medium"
            >
              <span>📊</span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/clientes"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition font-medium"
            >
              <span>👥</span>
              <span>Clientes</span>
            </Link>

            <Link
              href="/pedidos"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition font-medium"
            >
              <span>📦</span>
              <span>Pedidos</span>
            </Link>

            <Link
              href="/cotizaciones"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition font-medium"
            >
              <span>💰</span>
              <span>Cotizaciones</span>
            </Link>

            <Link
              href="/interacciones"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition font-medium"
            >
              <span>💬</span>
              <span>Interacciones</span>
            </Link>

            {/* Config */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="px-4 text-xs font-bold text-gray-700 uppercase mb-2">
                Configuración
              </p>

              <Link
                href="/configuracion/usuarios"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition font-medium"
              >
                <span>🔐</span>
                <span>Usuarios</span>
              </Link>

              <Link
                href="/configuracion/perfil"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition font-medium"
              >
                <span>⚙️</span>
                <span>Mi Perfil</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 hover:text-gray-900 rounded-lg transition"
            >
              <span>🚪</span>
              <span>Cerrar Sesión</span>
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