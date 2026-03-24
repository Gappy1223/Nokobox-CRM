'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  cotizacionId: string
  estado: string
  convertida: boolean
}

export default function BotonConvertir({ cotizacionId, estado, convertida }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [loading, setLoading] = useState(false)

  // Solo mostrar si está APROBADA y no convertida
  if (estado !== 'APROBADA' || convertida) {
    return null
  }

  async function handleConvertir() {
    if (!fechaEntrega) {
      alert('Debes especificar una fecha de entrega')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}/convertir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaEntregaEstimada: fechaEntrega }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al convertir')
      }

      const data = await res.json()
      
      // Redirigir al pedido creado
      router.push(`/pedidos/${data.pedido.id}`)
      router.refresh()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
      >
        ✓ Convertir a Pedido
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Convertir a Pedido</h3>
            
            <p className="text-gray-600 mb-4">
              Esta cotización se convertirá en un pedido. Especifica la fecha de entrega estimada.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Fecha de Entrega Estimada *
              </label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConvertir}
                disabled={loading || !fechaEntrega}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Convirtiendo...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}