import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Recordatorios from '@/components/interacciones/Recordatorios'

interface Props {
  usuario: any
}

export default async function DashboardVendedor({ usuario }: Props) {
  // Fechas correctas
  const hoyInicio = new Date()
  hoyInicio.setHours(0, 0, 0, 0)

  const hoyFin = new Date()
  hoyFin.setHours(23, 59, 59, 999)

  // Métricas del vendedor
  const [
    misCotizaciones,
    misPedidos,
    misClientesB2B,
    misClientesB2C,
    recordatoriosHoy,
  ] = await Promise.all([
    prisma.cotizacion.count({
      where: {
        usuarioId: usuario.id,
        estado: { in: ['PENDIENTE', 'ENVIADA', 'APROBADA'] }
      }
    }),
    prisma.pedido.count({
      where: {
        usuarioId: usuario.id,
        estatus: { not: 'ENTREGADO' }
      }
    }),
    prisma.cliente.count({
      where: {
        tipoCliente: 'EMPRESA',
        // ⚠️ SOLO si tienes relación con vendedor
        // usuarioId: usuario.id,
      }
    }),
    prisma.cliente.count({
      where: {
        tipoCliente: 'PARTICULAR',
        // usuarioId: usuario.id,
      }
    }),
    prisma.interaccion.count({
      where: {
        recordatorioFecha: {
          gte: hoyInicio,
          lte: hoyFin,
        },
        recordatorioCompletado: false,
        // 🔥 opcional pero recomendado:
        // usuarioId: usuario.id,
      }
    }),
  ])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">
        Bienvenido, {usuario.nombre}
      </h1>

      {/* Mis Métricas */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-blue-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-sm text-gray-900 mb-2">Mis Cotizaciones</h3>
          <p className="text-3xl font-bold text-purple-600">{misCotizaciones}</p>
        </div>

        <div className="bg-white border border-green-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-sm text-gray-900 mb-2">Mis Pedidos Activos</h3>
          <p className="text-3xl font-bold text-blue-600">{misPedidos}</p>
        </div>

        <div className="bg-white border border-purple-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-sm text-gray-900 mb-2">Clientes B2B</h3>
          <p className="text-3xl font-bold text-green-600">{misClientesB2B}</p>
        </div>

        <div className="bg-white border border-gray-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-sm text-gray-900 mb-2">Clientes B2C</h3>
          <p className="text-3xl font-bold text-orange-600">{misClientesB2C}</p>
        </div>
      </div>

      {/* Tareas de Hoy */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          📋 Tareas de Hoy
        </h3>
        <p className="text-yellow-800">
          Tienes <strong>{recordatoriosHoy}</strong> recordatorios pendientes para hoy
        </p>
      </div>

      {/* Grid de Acciones y Recordatorios */}
      <div className="grid grid-cols-2 gap-6">
        {/* Acciones Rápidas */}
        <div className="bg-white border border-gray-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/cotizaciones/nueva"
              className="shadow-[0_0_3px_rgba(0,0,0,0.1)] p-4 border-2 border-blue-400 rounded-lg bg-blue-50 hover:bg-blue-50 hover:border-blue-200 text-center"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm font-medium text-black">Nueva Cotización</div>
            </Link>
            <Link
              href="/pedidos/nuevo"
              className="shadow-[0_0_3px_rgba(0,0,0,0.1)] p-4 border-2 border-green-400 rounded-lg bg-green-50 hover:bg-green-50 hover:border-green-200 text-center"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-medium text-black">Nuevo Pedido</div>
            </Link>
            <Link
              href="/clientes/nuevo"
              className="shadow-[0_0_3px_rgba(0,0,0,0.1)] p-4 border-2 border-purple-400 rounded-lg bg-purple-50 hover:bg-purple-50 hover:border-purple-200 text-center"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="text-sm font-medium text-black">Nuevo Cliente</div>
            </Link>
            <Link
              href="/cotizaciones"
              className="shadow-[0_0_3px_rgba(0,0,0,0.1)] p-4 border-2 border-gray-400 rounded-lg bg-gray-50 hover:bg-gray-50 hover:border-gray-200 text-center"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-black">Ver Pipeline</div>
            </Link>
          </div>
        </div>

        {/* Recordatorios */}
        <Recordatorios />
      </div>
    </div>
  )
}