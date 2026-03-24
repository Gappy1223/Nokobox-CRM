import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

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

    const clientes = await prisma.cliente.findMany({
      where: {
        estado: 'ACTIVO',
      },
      orderBy: {
        nombre: 'asc',
      },
      select: {
        id: true,
        nombre: true,
        tipoCliente: true,
      },
    })

    return NextResponse.json({ data: clientes })
  } catch (error) {
    console.error('Error al obtener clientes:', error)

    return NextResponse.json(
      { error: 'Error al obtener clientes' },
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

    if (!body?.nombre) {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre: body.nombre,
        tipoCliente: body.tipoCliente,
        telefono: body.telefono,
        email: body.email,
        estado: 'ACTIVO',
      },
    })

    return NextResponse.json(
      { data: cliente },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error al crear cliente:', error)

    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}

