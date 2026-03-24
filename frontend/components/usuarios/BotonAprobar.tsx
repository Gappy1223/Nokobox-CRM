'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RolUsuario } from '@prisma/client'

interface Props {
  usuarioId: string
  rolSolicitado: RolUsuario
}

export default function BotonAprobar({ usuarioId, rolSolicitado }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [rolSeleccionado, setRolSeleccionado] = useState(rolSolicitado)

    async function handleAprobar() {
    if (loading) return
    setLoading(true)

    try {
        const res = await fetch(`/api/usuarios/${usuarioId}/aprobar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accion: 'APROBAR',
            rolFinal: rolSeleccionado,
        }),
        })

        const data = await res.json()

        if (!res.ok) {
        throw new Error(data.error || 'Error al aprobar')
        }

        alert('Usuario aprobado correctamente')
        setShowModal(false)
        router.refresh()
    } catch (error: any) {
        alert(error.message)
    } finally {
        setLoading(false)
    }
    }

    async function handleRechazar() {
    if (loading) return

    if (!confirm('¿Estás seguro de rechazar esta solicitud?')) return

    setLoading(true)
    try {
        const res = await fetch(`/api/usuarios/${usuarioId}/aprobar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'RECHAZAR' }),
        })

        const data = await res.json()

        if (!res.ok) {
        throw new Error(data.error || 'Error al rechazar')
        }

        alert('Usuario rechazado')
        router.refresh()
    } catch (error: any) {
        alert(error.message)
    } finally {
        setLoading(false)
    }
    }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          ✓ Aprobar
        </button>
        <button
          onClick={handleRechazar}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          ✗ Rechazar
        </button>
      </div>

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar Aprobación</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Asignar Rol Final:
              </label>
              <select
                value={rolSeleccionado}
                onChange={(e) => setRolSeleccionado(e.target.value as RolUsuario)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="LECTURA">Solo Lectura</option>
                <option value="VENDEDOR">Vendedor</option>
                <option value="PRODUCCION">Producción</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAprobar}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Aprobando...' : 'Confirmar'}
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