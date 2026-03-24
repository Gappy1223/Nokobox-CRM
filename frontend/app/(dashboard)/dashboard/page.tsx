import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardAdmin from '@/components/dashboard/DashboardAdmin'
import DashboardVendedor from '@/components/dashboard/DashboardVendedor'
import DashboardProduccion from '@/components/dashboard/DashboadProduccion'
import DashboardLectura from '@/components/dashboard/DashboardLectura'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 🔐 Mejor que getSession()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const usuario = await prisma.usuario.findUnique({
    where: { supabaseId: user.id }
  })

  if (!usuario) {
    redirect('/login')
  }

  if (!usuario.activo) {
    redirect('/login')
  }

  if (usuario.estado !== 'APROBADO') {
    redirect('/pendiente')
  }

  switch (usuario.rol) {
    case 'ADMIN':
      return <DashboardAdmin />
    
    case 'VENDEDOR':
      return <DashboardVendedor usuario={usuario} />
    
    case 'PRODUCCION':
      return <DashboardProduccion />
    
    case 'LECTURA':
      return <DashboardLectura />
    
    default:
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600">Bienvenido, {usuario.nombre}</p>
        </div>
      )
  }
}