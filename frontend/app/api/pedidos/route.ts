import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { EstatusPedido } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const estatusParam = searchParams.get('estatus')

    let where = {}

    if (estatusParam && estatusParam in EstatusPedido) {
      where = {
        estatus: estatusParam as EstatusPedido,
      }
    }

    const pedidos = await prisma.pedido.findMany({
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
        fechaEntregaEstimada: 'asc',
      },
    })

    return NextResponse.json({ data: pedidos })
  } catch (error) {
    console.error('Error al obtener pedidos:', error)

    return NextResponse.json(
      { error: 'Error al obtener pedidos' },
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
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()

    if (!body) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    // 👇 VALIDACIÓN BÁSICA
    if (!body.fechaEntregaEstimada) {
      return NextResponse.json(
        { error: 'Fecha de entrega requerida' },
        { status: 400 }
      )
    }

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: body.clienteId,
        tipoCaja: body.tipoCaja,
        nivelPersonalizacion: body.nivelPersonalizacion,
        cantidad: Number(body.cantidad),
        montoTotal: Number(body.montoTotal),
        descripcion: body.descripcion || null,

        // 👇 FIX CLAVE
        fechaEntregaEstimada: new Date(
          body.fechaEntregaEstimada + 'T00:00:00'
        ),
      },
      include: {
        cliente: true,
      },
    })

    return NextResponse.json({ data: pedido }, { status: 201 })
  } catch (error) {
    console.error('Error al crear pedido:', error)

    return NextResponse.json(
      { error: 'Error al crear pedido' },
      { status: 500 }
    )
  }
}