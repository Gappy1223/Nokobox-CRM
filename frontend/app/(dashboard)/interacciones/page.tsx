import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import TimelineInteracciones from '@/components/interacciones/TimelineInteracciones'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function InteraccionesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

 if (!session) {
    redirect('/login')
  }

  const interacciones = await prisma.interaccion.findMany({
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
        },
      },
    },
    orderBy: { fecha: 'desc' },
    take: 50,
  })


  const interaccionesSerializadas = interacciones.map(i => ({
    ...i,
    fecha: i.fecha.toISOString(),
    recordatorioFecha: i.recordatorioFecha
      ? i.recordatorioFecha.toISOString()
      : null,
  }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Interacciones</h1>
        <Link
          href="/interacciones/nueva"
          className="px-4 py-2 text-black border-2 border-green-400 rounded-lg bg-green-200 hover:bg-green-50 hover:border-green-400"
        >
          + Nueva Interacción
        </Link>
      </div>

      <TimelineInteracciones interacciones={interaccionesSerializadas} />
    </div>
  )
}