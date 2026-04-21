'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Recordatorio {
  id: string
  clienteId: string
  asunto: string
  recordatorioFecha: string 
  cliente: {
    nombre: string
  }
}

export default function Recordatorios() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarRecordatorios()
  }, [])

  async function cargarRecordatorios() {
    try {
      const res = await fetch('/api/interacciones/recordatorios?fecha=semana')
      const data = await res.json()
      setRecordatorios(data.data || [])
    } catch (error) {
      console.error('Error cargando recordatorios:', error)
    } finally {
      setLoading(false)
    }
  }

  async function marcarCompletado(id: string) {
    try {
      const res = await fetch('/api/interacciones/recordatorios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completado: true }),
      })

      if (!res.ok) throw new Error('Error al actualizar')

      // Optimistic update 🔥
      setRecordatorios(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error(error)
      alert('Error al marcar como completado')
    }
  }

  if (loading) {
    return <div className="p-4">Cargando...</div>
  }

  return (
    <div className="bg-white border border-gray-500 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-6">
      <h3 className="text-lg font-semibold text-black mb-4">
        🔔 Recordatorios Próximos
      </h3>

      {recordatorios.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No hay recordatorios pendientes
        </p>
      ) : (
        <div className="space-y-3">
          {recordatorios.map(recordatorio => {
            const fecha = new Date(recordatorio.recordatorioFecha)

            return (
              <div
                key={recordatorio.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <input
                  type="checkbox"
                  onChange={() => marcarCompletado(recordatorio.id)}
                  className="mt-1 w-4 h-4"
                />
                
                <div className="flex-1">
                  <Link
                    href={`/clientes/${recordatorio.clienteId}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {recordatorio.cliente.nombre}
                  </Link>

                  <p className="text-sm text-gray-600 mt-1">
                    {recordatorio.asunto}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {fecha.toLocaleDateString('es-MX', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}