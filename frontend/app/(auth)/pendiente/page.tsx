'use client'

import { createClient } from '@/lib/supabase/client'

export default function PendientePage() {
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold mb-4">Solicitud Pendiente</h1>
        <p className="text-gray-600 mb-6">
          Tu solicitud de acceso está siendo revisada por un administrador.
          Recibirás una notificación cuando sea aprobada.
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}