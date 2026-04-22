'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TipoInteraccion } from '@prisma/client'

interface Cliente {
  id: string
  nombre: string
}

interface Props {
  clienteId?: string
  pedidoId?: string
}

export default function FormularioInteraccion({ clienteId, pedidoId }: Props) {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clienteId: clienteId || '',
    pedidoId: pedidoId || '',
    tipo: 'NOTA' as TipoInteraccion,
    asunto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    recordatorioFecha: '',
  })

  useEffect(() => {
    if (!clienteId) {
      cargarClientes()
    }
  }, [clienteId])

  async function cargarClientes() {
    try {
      const res = await fetch('/api/clientes')

      if (!res.ok) throw new Error('Error al cargar clientes')

      const data = await res.json()
      setClientes(data.data || [])
    } catch (err) {
      console.error(err)
      setError('No se pudieron cargar los clientes')
    }
  }

  function handleChange(campo: string, valor: any) {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.clienteId) {
        throw new Error('Selecciona un cliente')
      }

      const res = await fetch('/api/interacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recordatorioFecha: formData.recordatorioFecha || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear interacción')
      }

      router.push('/interacciones')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-black mb-6">Nueva Interacción</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        {!clienteId && (
          <div>
            <label className="block text-sm text-black font-medium mb-2">
              Cliente *
            </label>
            <select
              required
              value={formData.clienteId}
              onChange={(e) => handleChange('clienteId', e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tipo */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Tipo de Interacción *
          </label>
          <select
            value={formData.tipo}
            onChange={(e) =>
              handleChange('tipo', e.target.value as TipoInteraccion)
            }
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
          >
            <option value="LLAMADA">📞 Llamada</option>
            <option value="EMAIL">📧 Email</option>
            <option value="WHATSAPP">💬 WhatsApp</option>
            <option value="REUNION">🤝 Reunión</option>
            <option value="NOTA">📝 Nota</option>
            <option value="CONSULTA_TECNICA">🔧 Consulta Técnica</option>
          </select>
        </div>

        {/* Asunto */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Asunto *
          </label>
          <input
            type="text"
            required
            value={formData.asunto}
            onChange={(e) => handleChange('asunto', e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Descripción *
          </label>
          <textarea
            required
            value={formData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
            rows={4}
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Fecha de la Interacción *
          </label>
          <input
            type="date"
            required
            value={formData.fecha}
            onChange={(e) => handleChange('fecha', e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
          />
        </div>

        {/* Recordatorio */}
        <div className="border-t pt-4">
          <label className="flex items-center text-black gap-2 mb-2">
            <input
              type="checkbox"
              checked={!!formData.recordatorioFecha}
              onChange={(e) => {
                if (!e.target.checked) {
                  handleChange('recordatorioFecha', '')
                } else {
                  handleChange(
                    'recordatorioFecha',
                    new Date().toISOString().slice(0, 16)
                  )
                }
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">
              Programar recordatorio
            </span>
          </label>

          {formData.recordatorioFecha && (
            <input
              type="datetime-local"
              value={formData.recordatorioFecha}
              onChange={(e) =>
                handleChange('recordatorioFecha', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              min={new Date().toISOString().slice(0, 16)}
            />
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Interacción'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-black rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}