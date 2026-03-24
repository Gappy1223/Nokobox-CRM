import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { supabaseId } = await req.json()
    
    if (!supabaseId) {
      return NextResponse.json({ estado: 'PENDIENTE' })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { supabaseId },
      select: { estado: true }
    })

    return NextResponse.json({ 
      estado: usuario?.estado || 'PENDIENTE' 
    })
  } catch (error) {
    console.error('Error en verificar-estado:', error)
    return NextResponse.json({ estado: 'PENDIENTE' })
  }
}
