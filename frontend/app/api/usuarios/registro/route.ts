import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, email, supabaseId, rolSolicitado } = body

    // Validación básica
    if (!nombre || !email || !supabaseId || !rolSolicitado) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Validar rol permitido
    const rolesPermitidos = ['LECTURA', 'VENDEDOR', 'PRODUCCION']
    if (!rolesPermitidos.includes(rolSolicitado)) {
      return NextResponse.json(
        { error: 'Rol no válido' },
        { status: 400 }
      )
    }

    // Verificar duplicados
    const existente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email },
          { supabaseId }
        ]
      }
    })

    if (existente) {
      return NextResponse.json(
        { error: 'Este usuario ya está registrado' },
        { status: 400 }
      )
    }

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        supabaseId,
        rol: rolSolicitado,
        estado: 'PENDIENTE',
        activo: false,
      },
    })

    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}