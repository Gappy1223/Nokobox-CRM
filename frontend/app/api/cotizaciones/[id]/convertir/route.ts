import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { EstatusPedido } from '@prisma/client'

export async function POST(
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
    const { fechaEntregaEstimada } = body

    if (!fechaEntregaEstimada) {
      return NextResponse.json(
        { error: 'Fecha de entrega es requerida' },
        { status: 400 }
      )
    }

    // Obtener cotización
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: params.id },
      include: { cliente: true },
    })

    if (!cotizacion) {
      return NextResponse.json(
        { error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }

    if (cotizacion.estado !== 'APROBADA') {
      return NextResponse.json(
        {
          error:
            'Solo se pueden convertir cotizaciones aprobadas',
        },
        { status: 400 }
      )
    }

    if (cotizacion.convertidaPedido) {
      return NextResponse.json(
        {
          error:
            'Esta cotización ya fue convertida a pedido',
        },
        { status: 400 }
      )
    }

    // Obtener usuario interno
    const usuario = await prisma.usuario.findUnique({
      where: {
        supabaseId: user.id,
      },
    })

    // Transacción
    const pedido = await prisma.$transaction(async (tx) => {
      const items = Array.isArray(cotizacion.items)
        ? (cotizacion.items as any[])
        : []

      const primerItem = items[0] || {}

      const nuevoPedido = await tx.pedido.create({
        data: {
          clienteId: cotizacion.clienteId,
          usuarioId: usuario?.id,
          tipoCaja:
            primerItem.tipo_caja ||
            'Según cotización',
          nivelPersonalizacion: 'MEDIO',
          cantidad: Number(primerItem.cantidad || 1),
          descripcion: cotizacion.descripcion,
          fechaEntregaEstimada: new Date(
            fechaEntregaEstimada
          ),
          montoTotal: Number(cotizacion.montoTotal || 0),
          estatus: 'SOLICITADO' as EstatusPedido,
        },
      })

      await tx.cotizacion.update({
        where: { id: params.id },
        data: {
          convertidaPedido: true,
          pedidoId: nuevoPedido.id,
        },
      })

      return nuevoPedido
    })

    return NextResponse.json({
      data: pedido,
    })
  } catch (error) {
    console.error('Error al convertir cotización:', error)

    return NextResponse.json(
      { error: 'Error al convertir cotización' },
      { status: 500 }
    )
  }
}