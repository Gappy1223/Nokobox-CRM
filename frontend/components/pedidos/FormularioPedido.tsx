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

  const inputClassName = "w-full px-3 py-2 border border-gray-400 bg-white text-black font-semibold rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
  const labelClassName = "block text-sm font-bold text-gray-900 mb-2"

 return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-xl shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-black border-b pb-4">
        Crear Nuevo Pedido
      </h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClassName}>Cliente *</label>
          <select
            required
            value={formData.clienteId}
            onChange={(e) => updateField('clienteId', e.target.value)}
            className={inputClassName}
          >
            <option value="" className="text-gray-500">Selecciona un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id} className="text-black">
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Tipo de Caja *</label>
            <input
              type="text"
              required
              value={formData.tipoCaja}
              onChange={(e) => updateField('tipoCaja', e.target.value)}
              className={inputClassName}
              placeholder="Ej. Caja de madera"
            />
          </div>

          <div>
            <label className={labelClassName}>Nivel de Personalización</label>
            <select
              value={formData.nivelPersonalizacion}
              onChange={(e) => updateField('nivelPersonalizacion', e.target.value as NivelPersonalizacion)}
              className={inputClassName}
            >
              <option value="BASICO" className="text-black">Básico</option>
              <option value="INTERMEDIO" className="text-black">Intermedio</option>
              <option value="PREMIUM" className="text-black">Premium</option>
            </select>
          </div>

          <div>
            <label className={labelClassName}>Cantidad *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.cantidad}
              onChange={(e) => updateField('cantidad', e.target.value === '' ? '' : Number(e.target.value))}
              className={inputClassName}
            />
          </div>

          <div>
            <label className={labelClassName}>Monto Total (MXN)</label>
            <input
              type="number"
              step="0.01"
              value={formData.montoTotal}
              onChange={(e) => updateField('montoTotal', e.target.value === '' ? '' : Number(e.target.value))}
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label className={labelClassName}>Fecha de Entrega Estimada *</label>
          <input
            type="date"
            required
            value={formData.fechaEntregaEstimada}
            onChange={(e) => updateField('fechaEntregaEstimada', e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Descripción / Notas</label>
          <textarea
            rows={4}
            value={formData.descripcion}
            onChange={(e) => updateField('descripcion', e.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-2 border border-gray-400 text-black font-bold rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Pedido'}
          </button>
        </div>
      </form>
    </div>
  )
}