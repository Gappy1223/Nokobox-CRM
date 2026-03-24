import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { EstadoCotizacion } from '@prisma/client'

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)

    const estadoParam = searchParams.get('estado')
    const clienteId = searchParams.get('cliente_id')

    const where: any = {}

    // Validar enum correctamente
    if (
      estadoParam &&
      Object.values(EstadoCotizacion).includes(
        estadoParam as EstadoCotizacion
      )
    ) {
      where.estado = estadoParam as EstadoCotizacion
    }

    if (clienteId) {
      where.clienteId = clienteId
    }

    const cotizaciones = await prisma.cotizacion.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            tipoCliente: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    })

    return NextResponse.json({ data: cotizaciones })
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error)

    return NextResponse.json(
      { error: 'Error al obtener cotizaciones' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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

    if (!body?.clienteId) {
      return NextResponse.json(
        { error: 'clienteId es obligatorio' },
        { status: 400 }
      )
    }

    // Obtener usuario interno
    const usuario = await prisma.usuario.findUnique({
      where: {
        supabaseId: user.id,
      },
    })

    // Calcular subtotal
    const montoSubtotal = Array.isArray(body.items)
      ? body.items.reduce((sum: number, item: any) => {
          return sum + Number(item.subtotal || 0)
        }, 0)
      : 0

    const descuento = Number(body.descuento || 0)
    const montoTotal = montoSubtotal - descuento

    // Fecha de validez (default 30 días)
    const fechaValidez = body.fechaValidez
      ? new Date(body.fechaValidez)
      : (() => {
          const f = new Date()
          f.setDate(f.getDate() + 30)
          return f
        })()

    const cotizacion = await prisma.cotizacion.create({
      data: {
        clienteId: body.clienteId,
        usuarioId: usuario?.id,
        descripcion: body.descripcion,
        items: body.items || [],
        montoSubtotal,
        descuento,
        montoTotal,
        fechaValidez,
        notas: body.notas,
      },
      include: {
        cliente: true,
      },
    })

    return NextResponse.json(
      { data: cotizacion },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear cotización:', error)

    return NextResponse.json(
      { error: 'Error al crear cotización' },
      { status: 500 }
    )
  }
}