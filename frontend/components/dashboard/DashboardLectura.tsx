import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardLectura() {
  const [
    totalClientes,
    totalPedidos,
    pedidosActivos,
    totalCotizaciones,
  ] = await Promise.all([
    prisma.cliente.count({ where: { estado: 'ACTIVO' } }),
    prisma.pedido.count(),
    prisma.pedido.count({
      where: {
        estatus: {
          in: ['SOLICITADO', 'EN_DISENO', 'EN_PRODUCCION', 'LISTO'],
        },
      },
    }),
    prisma.cotizacion.count(),
  ])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Vista General del Sistema</h1>

      {/* Aviso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800 text-sm">
          ℹ️ Tienes acceso de <strong>solo lectura</strong>. Puedes consultar
          información pero no realizar cambios.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Clientes</h3>
          <p className="text-3xl font-bold text-blue-600">{totalClientes}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Pedidos</h3>
          <p className="text-3xl font-bold text-green-600">{totalPedidos}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Pedidos Activos</h3>
          <p className="text-3xl font-bold text-orange-600">{pedidosActivos}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Cotizaciones</h3>
          <p className="text-3xl font-bold text-purple-600">
            {totalCotizaciones}
          </p>
        </div>
      </div>

      {/* Navegación */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Consultar Información
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/clientes"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="text-sm font-medium">Ver Clientes</div>
          </Link>

          <Link
            href="/pedidos"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-medium">Ver Pedidos</div>
          </Link>

          <Link
            href="/cotizaciones"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="text-sm font-medium">Ver Cotizaciones</div>
          </Link>
        </div>
      </div>
    </div>
  )
}