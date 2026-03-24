import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BotonConvertir from '@/components/cotizaciones/BotonConvertir'

export default async function DetalleCotizacionPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cotizacion = await prisma.cotizacion.findUnique({
    where: { id },
    include: {
      cliente: true,
    }
  })

  if (!cotizacion) {
    notFound()
  }

  const items = cotizacion.items as any[]

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cotización #{cotizacion.numeroCotizacion}</h1>
            <p className="text-gray-600 mt-1">
              Creada el {new Date(cotizacion.fechaCreacion).toLocaleDateString('es-MX')}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full font-medium ${
            cotizacion.estado === 'APROBADA' ? 'bg-green-100 text-green-800' :
            cotizacion.estado === 'ENVIADA' ? 'bg-blue-100 text-blue-800' :
            cotizacion.estado === 'RECHAZADA' ? 'bg-red-100 text-red-800' :
            cotizacion.estado === 'EXPIRADA' ? 'bg-orange-100 text-orange-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {cotizacion.estado}
          </span>
        </div>

        {/* Cliente */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="font-semibold text-gray-700 mb-2">Cliente</h2>
          <p className="text-lg">{cotizacion.cliente.nombre}</p>
          {cotizacion.cliente.nombreEmpresa && (
            <p className="text-gray-600">{cotizacion.cliente.nombreEmpresa}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="font-semibold text-gray-700 mb-2">Descripción</h2>
          <p className="text-gray-800">{cotizacion.descripcion}</p>
        </div>

        {/* Items */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="font-semibold text-gray-700 mb-4">Items</h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Tipo de Caja</th>
                <th className="px-4 py-2 text-right">Cantidad</th>
                <th className="px-4 py-2 text-right">Precio Unit.</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3">{item.tipo_caja}</td>
                  <td className="px-4 py-3 text-right">{item.cantidad}</td>
                  <td className="px-4 py-3 text-right">${item.precio_unitario.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mb-6 pb-6 border-b">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>${parseFloat(cotizacion.montoSubtotal.toString()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descuento:</span>
                <span className="text-red-600">-${parseFloat(cotizacion.descuento.toString()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total:</span>
                <span>${parseFloat(cotizacion.montoTotal.toString()).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm text-gray-600">Válida Hasta:</span>
            <p className="font-medium">{new Date(cotizacion.fechaValidez).toLocaleDateString('es-MX')}</p>
          </div>
          {cotizacion.convertidaPedido && (
            <div>
              <span className="text-sm text-gray-600">Estado:</span>
              <p className="font-medium text-green-600">✓ Convertida a Pedido</p>
            </div>
          )}
        </div>

        {/* Notas */}
        {cotizacion.notas && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-700 mb-2">Notas</h2>
            <p className="text-gray-600">{cotizacion.notas}</p>
          </div>
        )}

        {/* Botón Convertir */}
        <div className="flex justify-end">
          <BotonConvertir
            cotizacionId={cotizacion.id}
            estado={cotizacion.estado}
            convertida={cotizacion.convertidaPedido}
          />
        </div>
      </div>
    </div>
  )
}
