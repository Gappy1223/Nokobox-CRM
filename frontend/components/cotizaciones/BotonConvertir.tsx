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
    if (!fechaEntrega || loading) {
      alert('Debes especificar una fecha de entrega')
      return
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/cotizaciones/${cotizacionId}/convertir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fechaEntregaEstimada: fechaEntrega }),
      });

      const responseData = await res.json()

      if (!res.ok) {
        if(responseData.error?.includes('ya ha sido convertida')){
          router.push('/pedidos');
          router.refresh();
          return;
        }
        throw new Error(responseData.error || 'Error al convertir')
      }
      setShowModal(false);
      router.push('/pedidos');
      router.refresh();

      // [CORRECCIÓN CRÍTICA]: La API devuelve { data: { id: ... } }
      // Accedemos a responseData.data.id
      if (responseData && responseData.data && responseData.data.id) {
        setShowModal(false)
        router.push(`/pedidos`) // Redirigimos al tablero de pedidos
        router.refresh()
      } else {
        throw new Error('No se recibió el ID del pedido creado')
      }
      
    } catch (err: any) {
      console.error('Error al convertir:', err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95"
      >
        Convertir a Pedido
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl text-black font-bold mb-4">Convertir a Pedido</h3>
            
            <p className="text-gray-600 mb-4">
              Esta cotización se convertirá en un pedido de producción. Especifica la fecha de entrega estimada.
            </p>

            <div className="mb-6">
              <label className="block text-sm text-black font-bold mb-2">
                Fecha de Entrega Estimada *
              </label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className="w-full px-3 py-2 border text-black border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConvertir}
                disabled={loading || !fechaEntrega}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Convirtiendo...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-black font-bold rounded-md hover:bg-gray-50 transition-colors"
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