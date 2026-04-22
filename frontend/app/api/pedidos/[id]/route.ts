import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // [1] Definimos params como Promise
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // [2] AGREGAMOS EL AWAIT AQUÍ para obtener el id
    const { id } = await params 
    
    const body = await req.json()
    const { estatus } = body

    // Ahora id ya no es undefined y Prisma funcionará correctamente
    const pedidoActualizado = await prisma.pedido.update({
      where: { id },
      data: { estatus },
    })

    return NextResponse.json({ data: pedidoActualizado })
  } catch (error) {
    console.error('Error al actualizar pedido:', error)
    return NextResponse.json(
      { error: 'Error interno al actualizar el pedido' },
      { status: 500 }
    )
  }
}