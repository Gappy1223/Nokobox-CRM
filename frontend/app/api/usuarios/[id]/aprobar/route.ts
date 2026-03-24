import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // <- params es Promise
) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Verificar que quien aprueba sea ADMIN
    const adminUser = await prisma.usuario.findUnique({
      where: { supabaseId: session.user.id }
    })

    if (adminUser?.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden aprobar usuarios' },
        { status: 403 }
      )
    }

    // IMPORTANTE: Await params antes de usarlo
    const { id } = await params
    const body = await req.json()
    const { accion, rolFinal } = body

    const usuario = await prisma.usuario.update({
      where: { id }, // Ahora usa el id unwrapped
      data: {
        estado: accion === 'APROBAR' ? 'APROBADO' : 'RECHAZADO',
        activo: accion === 'APROBAR' ? true : false,
        rol: accion === 'APROBAR' && rolFinal ? rolFinal : undefined,
      },
    })

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al aprobar/rechazar usuario' },
      { status: 500 }
    )
  }
}