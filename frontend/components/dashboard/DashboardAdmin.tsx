import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Recordatorios from '@/components/interacciones/Recordatorios'

export default async function DashboardAdmin() {
  // Fechas correctas (inicio y fin del día)
  const hoyInicio = new Date()
  hoyInicio.setHours(0, 0, 0, 0)

  const hoyFin = new Date()
  hoyFin.setHours(23, 59, 59, 999)

  // Obtener métricas
  const [
    totalClientes,
    totalPedidos,
    pedidosActivos,
    cotizacionesActivas,
    pedidosHoy,
  ] = await Promise.all([
    prisma.cliente.count({ where: { estado: 'ACTIVO' } }),
    prisma.pedido.count(),
    prisma.pedido.count({
      where: {
        estatus: { in: ['SOLICITADO', 'EN_DISENO', 'EN_PRODUCCION', 'LISTO'] }
      }
    }),
    prisma.cotizacion.count({
      where: { estado: { in: ['PENDIENTE', 'ENVIADA', 'APROBADA'] } }
    }),
    prisma.pedido.count({
      where: {
        fechaEntregaEstimada: {
          gte: hoyInicio,
          lte: hoyFin,
        },
      },
    }),
  ])

  // Pedidos urgentes (próximos 3 días)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const tresDias = new Date(hoy)
  tresDias.setDate(hoy.getDate() + 3)
  tresDias.setHours(23, 59, 59, 999)

  const pedidosUrgentes = await prisma.pedido.findMany({
    where: {
      fechaEntregaEstimada: {
        gte: hoy,
        lte: tresDias,
      },
      estatus: { not: 'ENTREGADO' }
    },
    include: {
      cliente: {
        select: { nombre: true }
      }
    },
    orderBy: { fechaEntregaEstimada: 'asc' },
    take: 5,
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-black mb-6">Dashboard Administrador</h1>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-blue-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Clientes Activos</h3>
          <p className="text-4xl font-bold text-blue-600">{totalClientes}</p>
        </div>

        <div className="bg-white border border-green-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Pedidos Activos</h3>
          <p className="text-4xl font-bold text-green-600">{pedidosActivos}</p>
        </div>

        <div className="bg-white border border-purple-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Cotizaciones Activas</h3>
          <p className="text-4xl font-bold text-purple-600">{cotizacionesActivas}</p>
        </div>

        <div className="bg-white border border-gray-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="ttext-sm font-semibold text-gray-700 mb-2">Entregas Hoy</h3>
          <p className="text-4xl font-bold text-orange-600">{pedidosHoy}</p>
        </div>
      </div>

      {/* Alertas Urgentes */}
      {pedidosUrgentes.length > 0 && (
        <div className="bg-white border border-gray-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6 my-4">
          <h3 className="text-lg font-bold text-red-900 mb-4">
            🚨 Pedidos Urgentes (Próximos 3 días)
          </h3>
          <div className="space-y-2">
            {pedidosUrgentes.map(pedido => (
              <div key={pedido.id} className="flex justify-between items-center bg-white p-3 rounded">
                <div>
                  <span className="ffont-bold text-gray-900">#{pedido.numeroPedido}</span>
                  <span className="text-gray-700 ml-3">{pedido.cliente.nombre}</span>
                </div>
                <span className="text-sm font-semibold text-red-700">
                  {new Date(pedido.fechaEntregaEstimada).toLocaleDateString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Accesos Rápidos y Recordatorios */}
      <div className="grid grid-cols-2 gap-6">
        {/* Accesos Rápidos */}
        <div className="bg-white border border-gray-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/pedidos/nuevo"
              className="shadow-[0_0_3px_rgba(0,0,0,0.1)] p-4 border-2 border-blue-400 rounded-lg bg-blue-50 hover:bg-blue-50 hover:border-blue-200 text-center transition"
            >
              <div className="text-3xl mb-2">📦</div>
              <div className="text-sm font-semibold text-gray-800">Nuevo Pedido</div>
            </Link>
            <Link
              href="/cotizaciones/nueva"
              className="shadow-[0_0_3px_rgba(0,0,0,0.1) p-4 border-2 border-green-400 rounded-lg bg-green-50 hover:bg-green-50 hover:border-green-200 text-center transition"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="text-sm font-semibold text-gray-800">Nueva Cotización</div>
            </Link>
            <Link
              href="/clientes/nuevo"
              className="shadow-[0_0_3px_rgba(0,0,0,0.1) p-4 border-2 border-purple-400 rounded-lg bg-purple-50 hover:bg-purple-50 hover:border-purple-200 text-center transition"
            >
              <div className="text-3xl mb-2">👤</div>
              <div className="text-sm font-semibold text-gray-800">Nuevo Cliente</div>
            </Link>
            <Link
              href="/pedidos"
              className="shadow-[0_0_3px_rgba(0,0,0,0.1) p-4 border-2 border-gray-400 rounded-lg bg-gray-50 hover:bg-gray-50 hover:border-gray-200 text-center transition"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-semibold text-gray-800">Ver Kanban</div>
            </Link>
          </div>
        </div>

        {/* Recordatorios */}
        <Recordatorios />
      </div>
    </div>
  )
}