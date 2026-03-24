import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

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
    const clienteId = searchParams.get('cliente_id')
    const tipo = searchParams.get('tipo')
    const soloRecordatorios =
      searchParams.get('recordatorios') === 'true'

    const where: any = {
      ...(clienteId && { clienteId }),
      ...(tipo && { tipo }),
      ...(soloRecordatorios && {
        recordatorioFecha: { not: null },
        recordatorioCompletado: false,
      }),
    }

    const interacciones = await prisma.interaccion.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    })

    return NextResponse.json({ data: interacciones })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener interacciones' },
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


    if (!body.clienteId || !body.tipo || !body.asunto) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }


    const usuario = await prisma.usuario.findUnique({
      where: { supabaseId: user.id },
    })

    const interaccion = await prisma.interaccion.create({
      data: {
        clienteId: body.clienteId,
        usuarioId: usuario?.id ?? null,
        tipo: body.tipo,
        asunto: body.asunto,
        descripcion: body.descripcion || '',
        fecha: body.fecha
          ? new Date(body.fecha)
          : new Date(),
        recordatorioFecha: body.recordatorioFecha
          ? new Date(body.recordatorioFecha)
          : null,
        pedidoId: body.pedidoId || null,
      },
      include: {
        cliente: true,
      },
    })

  
    try {
      await prisma.cliente.update({
        where: { id: body.clienteId },
        data: { ultimoContacto: new Date() },
      })
    } catch (e) {
      console.warn('No se pudo actualizar ultimoContacto')
    }

    return NextResponse.json(
      { data: interaccion },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al crear interacción' },
      { status: 500 }
    )
  }
}