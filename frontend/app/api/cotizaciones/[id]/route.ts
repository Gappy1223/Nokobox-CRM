import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
      },
    })

    if (!cotizacion) {
      return NextResponse.json(
        { error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: cotizacion })
  } catch (error) {
    console.error('Error al obtener cotización:', error)

    return NextResponse.json(
      { error: 'Error al obtener cotización' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()

    let dataToUpdate: any = { ...body }

    // Recalcular totales si hay items
    if (Array.isArray(body.items)) {
      const montoSubtotal = body.items.reduce(
        (sum: number, item: any) =>
          sum + Number(item.subtotal || 0),
        0
      )

      const descuento = Number(body.descuento || 0)

      dataToUpdate.montoSubtotal = montoSubtotal
      dataToUpdate.montoTotal = montoSubtotal - descuento
    }

    const cotizacion = await prisma.cotizacion.update({
      where: { id: params.id },
      data: dataToUpdate,
      include: {
        cliente: true,
      },
    })

    return NextResponse.json({ data: cotizacion })
  } catch (error) {
    console.error('Error al actualizar cotización:', error)

    return NextResponse.json(
      { error: 'Error al actualizar cotización' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: params.id },
    })

    if (!cotizacion) {
      return NextResponse.json(
        { error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }

    if (cotizacion.convertidaPedido) {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar una cotización ya convertida a pedido',
        },
        { status: 400 }
      )
    }

    await prisma.cotizacion.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ data: true })
  } catch (error) {
    console.error('Error al eliminar cotización:', error)

    return NextResponse.json(
      { error: 'Error al eliminar cotización' },
      { status: 500 }
    )
  }
}