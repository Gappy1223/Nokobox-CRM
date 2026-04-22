import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET: Obtener una cotización por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id },
      include: { cliente: true },
    })

    if (!cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ data: cotizacion })
  } catch (error) {
    console.error('Error al obtener cotización:', error)
    return NextResponse.json({ error: 'Error al obtener cotización' }, { status: 500 })
  }
}

// PATCH: Actualización parcial (Usado por el Drag and Drop)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { estado } = body

    if (!estado) {
      return NextResponse.json({ error: 'Estado no proporcionado' }, { status: 400 })
    }

    const cotizacion = await prisma.cotizacion.update({
      where: { id },
      data: { estado },
      include: { cliente: true },
    })

    return NextResponse.json({ data: cotizacion })
  } catch (error) {
    console.error('Error al actualizar estado de cotización:', error)
    return NextResponse.json({ error: 'Error al actualizar cotización' }, { status: 500 })
  }
}

// PUT: Actualización completa
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const cotizacion = await prisma.cotizacion.update({
      where: { id },
      data: {
        descripcion: body.descripcion,
        montoTotal: body.montoTotal,
        fechaValidez: body.fechaValidez ? new Date(body.fechaValidez) : undefined,
        estado: body.estado,
        notas: body.notas,
        descuento: body.descuento,
        items: body.items,
      },
      include: { cliente: true },
    })

    return NextResponse.json({ data: cotizacion })
  } catch (error) {
    console.error('Error al actualizar cotización:', error)
    return NextResponse.json({ error: 'Error al actualizar cotización' }, { status: 500 })
  }
}

// DELETE: Eliminar cotización
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const cotizacion = await prisma.cotizacion.findUnique({ where: { id } })

    if (!cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    if (cotizacion.convertidaPedido) {
      return NextResponse.json(
        { error: 'No se puede eliminar una cotización ya convertida a pedido' },
        { status: 400 }
      )
    }

    await prisma.cotizacion.delete({ where: { id } })

    return NextResponse.json({ message: 'Cotización eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar cotización:', error)
    return NextResponse.json({ error: 'Error al eliminar cotización' }, { status: 500 })
  }
}