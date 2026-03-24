import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const fecha = searchParams.get('fecha') // 'hoy', 'semana', 'todos'

    let where: Prisma.InteraccionWhereInput = {
      recordatorioFecha: { not: null },
      recordatorioCompletado: false,
    }

    if (fecha === 'hoy') {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const manana = new Date(hoy)
      manana.setDate(manana.getDate() + 1)

      where.recordatorioFecha = {
        gte: hoy,
        lt: manana,
      }
    } else if (fecha === 'semana') {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const proximaSemana = new Date(hoy)
      proximaSemana.setDate(proximaSemana.getDate() + 7)

      where.recordatorioFecha = {
        gte: hoy,
        lte: proximaSemana,
      }
    }

    const recordatorios = await prisma.interaccion.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { recordatorioFecha: 'asc' },
    })

    return NextResponse.json({ data: recordatorios })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener recordatorios' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await req.json()
    const { id, completado } = body

    if (!id || typeof completado !== 'boolean') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    const interaccion = await prisma.interaccion.update({
      where: { id },
      data: { recordatorioCompletado: completado },
    })

    return NextResponse.json(interaccion)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar recordatorio' },
      { status: 500 }
    )
  }
}