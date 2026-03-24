import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { EstadoCotizacion } from '@prisma/client'

export async function GET() {
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

    // Total de cotizaciones
    const total = await prisma.cotizacion.count()

    // Agrupadas por estado
    const porEstadoRaw = await prisma.cotizacion.groupBy({
      by: ['estado'],
      _count: {
        estado: true,
      },
    })

    // Normalizar formato
    const porEstado = porEstadoRaw.map((item) => ({
      estado: item.estado,
      total: item._count.estado,
    }))

    // Métricas
    const aprobadas = await prisma.cotizacion.count({
      where: {
        estado: EstadoCotizacion.APROBADA,
      },
    })

    const convertidas = await prisma.cotizacion.count({
      where: {
        convertidaPedido: true,
      },
    })

    const tasaConversion =
      aprobadas > 0
        ? Math.round((convertidas / aprobadas) * 100)
        : 0

    // Fechas
    const hoy = new Date()
    const sieteDias = new Date()
    sieteDias.setDate(hoy.getDate() + 7)

    const porVencer = await prisma.cotizacion.count({
      where: {
        estado: EstadoCotizacion.ENVIADA,
        fechaValidez: {
          gte: hoy,
          lte: sieteDias,
        },
      },
    })

    return NextResponse.json({
      data: {
        total,
        porEstado,
        tasaConversion,
        porVencer,
        aprobadas,
        convertidas,
      },
    })
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)

    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}