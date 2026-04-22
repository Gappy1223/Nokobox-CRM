import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { EstatusPedido } from '@prisma/client'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // [CORRECCIÓN] Params como Promise
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // [CORRECCIÓN] Desenrollar params con await
    const { id } = await params

    const body = await req.json()
    const { fechaEntregaEstimada } = body

    if (!fechaEntregaEstimada) {
      return NextResponse.json(
        { error: 'Fecha de entrega es requerida' },
        { status: 400 }
      )
    }

    // Obtener cotización usando el ID desenrollado
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: id },
      include: { cliente: true },
    })

    if (!cotizacion) {
      return NextResponse.json(
        { error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }

    if (cotizacion.convertidaPedido) {
      return NextResponse.json(
        { error: 'Esta cotización ya ha sido convertida a pedido' },
        { status: 400 }
      )
    }

    // Obtener usuario interno para vincularlo al pedido
    const usuario = await prisma.usuario.findUnique({
      where: {
        supabaseId: user.id,
      },
    })

    // Transacción para asegurar que ambos cambios ocurran o ninguno
    const pedido = await prisma.$transaction(async (tx) => {
      const items = Array.isArray(cotizacion.items)
        ? (cotizacion.items as any[])
        : []

      const primerItem = items[0] || {}

      // 1. Crear el nuevo pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          clienteId: cotizacion.clienteId,
          usuarioId: usuario?.id,
          tipoCaja: primerItem.tipo_caja || 'Según cotización',
          nivelPersonalizacion: 'MEDIO',
          cantidad: Number(primerItem.cantidad || 1),
          descripcion: cotizacion.descripcion || `Pedido desde cotización #${cotizacion.numeroCotizacion}`,
          fechaEntregaEstimada: new Date(fechaEntregaEstimada),
          montoTotal: Number(cotizacion.montoTotal || 0),
          estatus: 'SOLICITADO' as EstatusPedido,
        },
      })

      // 2. Actualizar la cotización para marcarla como convertida
      await tx.cotizacion.update({
        where: { id: id },
        data: {
          convertidaPedido: true,
          pedidoId: nuevoPedido.id,
          estado: 'APROBADA' // Aseguramos que el estado refleje la aprobación
        },
      })

      return nuevoPedido
    })

    return NextResponse.json({ 
        message: 'Cotización convertida con éxito',
        data: pedido 
    })

  } catch (error: any) {
    console.error('Error detallado al convertir cotización:', error)
    return NextResponse.json(
      { error: 'Error interno al convertir la cotización: ' + error.message },
      { status: 500 }
    )
  }
}