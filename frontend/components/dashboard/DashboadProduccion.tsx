import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DashboardProduccion() {
  // Fechas correctas (inicio y fin)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const tresDias = new Date(hoy)
  tresDias.setDate(hoy.getDate() + 3)
  tresDias.setHours(23, 59, 59, 999)

  // Pedidos urgentes (próximos 3 días)
  const pedidosUrgentes = await prisma.pedido.findMany({
    where: {
      fechaEntregaEstimada: {
        gte: hoy,
        lte: tresDias,
      },
      estatus: { in: ['EN_DISENO', 'EN_PRODUCCION', 'LISTO'] }
    },
    include: {
      cliente: {
        select: { nombre: true }
      }
    },
    orderBy: { fechaEntregaEstimada: 'asc' },
  })

  // Pedidos por estado
  const [enDiseno, enProduccion, listos] = await Promise.all([
    prisma.pedido.count({ where: { estatus: 'EN_DISENO' } }),
    prisma.pedido.count({ where: { estatus: 'EN_PRODUCCION' } }),
    prisma.pedido.count({ where: { estatus: 'LISTO' } }),
  ])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Producción</h1>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">En Diseño</h3>
          <p className="text-3xl font-bold text-purple-600">{enDiseno}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">En Producción</h3>
          <p className="text-3xl font-bold text-orange-600">{enProduccion}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm text-gray-600 mb-2">Listos</h3>
          <p className="text-3xl font-bold text-green-600">{listos}</p>
        </div>
      </div>

      {/* Pedidos Urgentes */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-red-900 mb-4">
          🚨 Entregas Urgentes (Próximos 3 días)
        </h3>

        {pedidosUrgentes.length === 0 ? (
          <p className="text-red-700">No hay entregas urgentes</p>
        ) : (
          <div className="space-y-2">
            {pedidosUrgentes.map(pedido => (
              <div key={pedido.id} className="flex justify-between items-center bg-white p-3 rounded">
                <div>
                  <span className="font-medium">#{pedido.numeroPedido}</span>
                  <span className="text-gray-600 ml-2">{pedido.cliente.nombre}</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    pedido.estatus === 'EN_DISENO' ? 'bg-purple-100 text-purple-800' :
                    pedido.estatus === 'EN_PRODUCCION' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {pedido.estatus}
                  </span>
                </div>
                <span className="text-sm text-red-600 font-medium">
                  {new Date(pedido.fechaEntregaEstimada).toLocaleDateString('es-MX')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acceso al Kanban */}
      <div className="text-center">
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
        >
          📊 Ir al Tablero Kanban
        </Link>
      </div>
    </div>
  )
}