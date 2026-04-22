import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
// [NUEVO] Importamos el Enum oficial de Prisma
import { TipoCliente } from '@prisma/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    // ACTUALIZAR EN PRISMA
    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: {
        nombre: body.nombre,
        email: body.email,
        telefono: body.telefono,
        direccion: body.direccion,
        // [CORRECCIÓN] Casteamos el string al tipo Enum TipoCliente
        tipoCliente: body.tipoCliente as TipoCliente,
      },
    })

    return NextResponse.json({ data: clienteActualizado })
  } catch (error: any) {
    console.error("Error API Clientes:", error)
    return NextResponse.json(
      { error: 'Error interno al actualizar el cliente: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cliente = await prisma.cliente.findUnique({
      where: { id }
    })
    
    if (!cliente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    
    return NextResponse.json({ data: cliente })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Verificar rol de administrador
    const usuarioApp = await prisma.usuario.findUnique({
      where: { supabaseId: user?.id }
    })

    if (usuarioApp?.rol !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo los administradores pueden realizar esta acción' }, 
        { status: 403 }
      )
    }

    const { id } = await params

    // 2. ELIMINACIÓN LÓGICA: Cambiamos el estado a INACTIVO o ELIMINADO
    // Revisa tu Enum EstadoCliente, si no existe ELIMINADO, usa INACTIVO
    await prisma.cliente.update({
      where: { id },
      data: { estado: 'INACTIVO' } 
    })

    return NextResponse.json({ message: 'Cliente desactivado exitosamente' })
  } catch (error: any) {
    console.error("Error al eliminar cliente:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}