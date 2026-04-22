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
            <h1 className="text-3xl  text-black font-bold">Cotización #{cotizacion.numeroCotizacion}</h1>
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
          <p className="text-lg text-black">{cotizacion.cliente.nombre}</p>
          {cotizacion.cliente.nombreEmpresa && (
            <p className=" text-black">{cotizacion.cliente.nombreEmpresa}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="font-semibold  text-black mb-2">Descripción</h2>
          <p className="text-black">{cotizacion.descripcion}</p>
        </div>

        {/* Items */}
        <div className="mb-6 pb-6 border-b">
          <h2 className="font-semibold text-gray-700 mb-4">Items</h2>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-black">Tipo de Caja</th>
                <th className="px-4 py-2 text-right text-black">Cantidad</th>
                <th className="px-4 py-2 text-right text-black">Precio Unit.</th>
                <th className="px-4 py-2 text-right text-black">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, index: number) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-3 text-black font-medium">{item.tipo_caja}</td>
                <td className="px-4 py-3 text-right text-black">{item.cantidad}</td>
                
                {/* CORRECCIÓN: Convertimos a Number antes de usar .toFixed() */}
                <td className="px-4 py-3 text-right text-black font-semibold">
                  ${Number(item.precio_unitario || 0).toFixed(2)}
                </td>
                
                <td className="px-4 py-3 text-right font-bold text-blue-700">
                  ${Number(item.subtotal || 0).toFixed(2)}
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mb-6 pb-6 border-b">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-black">
                <span className="text-black">Subtotal:</span>
                <span>${parseFloat(cotizacion.montoSubtotal.toString()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descuento:</span>
                <span className="text-red-600">-${parseFloat(cotizacion.descuento.toString()).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl text-black font-bold pt-2 border-t">
                <span>Total:</span>
                <span>${parseFloat(cotizacion.montoTotal.toString()).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm text-black">Válida Hasta:</span>
            <p className="font-medium text-black">{new Date(cotizacion.fechaValidez).toLocaleDateString('es-MX')}</p>
          </div>
          {cotizacion.convertidaPedido && (
            <div>
              <span className="text-sm text-black">Estado:</span>
              <p className="font-medium text-black">✓ Convertida a Pedido</p>
            </div>
          )}
        </div>

        {/* Notas */}
        {cotizacion.notas && (
          <div className="mb-6">
            <h2 className="font-semibold text-black mb-2">Notas</h2>
            <p className="text-black">{cotizacion.notas}</p>
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
