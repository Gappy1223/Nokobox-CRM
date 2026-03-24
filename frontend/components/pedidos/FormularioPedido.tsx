'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NivelPersonalizacion } from '@prisma/client'

type Cliente = {
  id: string
  nombre: string
  tipoCliente: string
}

type FormData = {
  clienteId: string
  tipoCaja: string
  nivelPersonalizacion: NivelPersonalizacion
  cantidad: number | ''
  fechaEntregaEstimada: string
  montoTotal: number | ''
  descripcion: string
}

export default function FormularioPedido() {
  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    clienteId: '',
    tipoCaja: '',
    nivelPersonalizacion: 'BASICO',
    cantidad: '',
    fechaEntregaEstimada: '',
    montoTotal: '',
    descripcion: '',
  })

  useEffect(() => {
    cargarClientes()
  }, [])

  async function cargarClientes() {
    try {
      const res = await fetch('/api/clientes')
      const data = await res.json()
      setClientes(data.data || [])
    } catch {
      setError('Error al cargar clientes')
    }
  }

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear pedido')
      }

      router.push('/pedidos')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-black mb-6">Nuevo Pedido</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* CLIENTE */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Cliente *
          </label>

          <select
            required
            value={formData.clienteId}
            onChange={(e) => updateField('clienteId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md"
          >
            <option value="">Seleccionar cliente...</option>

            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} ({cliente.tipoCliente})
              </option>
            ))}
          </select>
        </div>

        {/* TIPO CAJA */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Tipo de Caja *
          </label>

          <input
            type="text"
            required
            value={formData.tipoCaja}
            onChange={(e) => updateField('tipoCaja', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md"
            placeholder="Ej: Caja mediana kraft"
          />
        </div>

        {/* PERSONALIZACIÓN */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Nivel de Personalización
          </label>

          <select
            value={formData.nivelPersonalizacion}
            onChange={(e) =>
              updateField(
                'nivelPersonalizacion',
                e.target.value as NivelPersonalizacion
              )
            }
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md"
          >
            <option value="BASICO">Básico</option>
            <option value="MEDIO">Medio</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </div>

        {/* CANTIDAD Y MONTO */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Cantidad *
            </label>

            <input
              type="number"
              required
              min={1}
              value={formData.cantidad}
              onChange={(e) =>
                updateField('cantidad', e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 text-black rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Monto Total *
            </label>

            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={formData.montoTotal}
              onChange={(e) =>
                updateField('montoTotal', e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 text-black rounded-md"
            />
          </div>

        </div>

        {/* FECHA ENTREGA */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Fecha de Entrega Estimada *
          </label>

          <input
            type="date"
            required
            value={formData.fechaEntregaEstimada}
            onChange={(e) =>
              updateField('fechaEntregaEstimada', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md"
          />
        </div>

        {/* DESCRIPCIÓN */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Descripción / Notas
          </label>

          <textarea
            rows={4}
            value={formData.descripcion}
            onChange={(e) =>
              updateField('descripcion', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 text-black rounded-md"
          />
        </div>

        {/* BOTONES */}
        <div className="flex gap-4">

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Pedido'}
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