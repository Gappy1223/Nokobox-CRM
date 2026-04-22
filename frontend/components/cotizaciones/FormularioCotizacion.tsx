'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Cliente {
  id: string
  nombre: string
  tipoCliente: string
}

interface ItemCotizacion {
  tipo_caja: string
  cantidad: number | ''
  precio_unitario: number | ''
  subtotal: number
}

export default function FormularioCotizacion() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    clienteId: '',
    descripcion: '',
    descuento: '' as number | '',
    fechaValidez: '',
    notas: '',
  })

  const [items, setItems] = useState<ItemCotizacion[]>([
    { tipo_caja: '', cantidad: 1, precio_unitario: 0, subtotal: 0 },
  ])

  useEffect(() => {
    cargarClientes()

    const treintaDias = new Date()
    treintaDias.setDate(treintaDias.getDate() + 30)

    setFormData((prev) => ({
      ...prev,
      fechaValidez: treintaDias.toISOString().split('T')[0],
    }))
  }, [])

  async function cargarClientes() {
    try {
      const res = await fetch('/api/clientes')
      const json = await res.json()

      if (!res.ok) throw new Error(json.error)

      setClientes(json.data || [])
    } catch (err) {
      console.error(err)
      setError('Error al cargar clientes')
    }
  }

  function agregarItem() {
    setItems((prev) => [
      ...prev,
      { tipo_caja: '', cantidad: 1, precio_unitario: 0, subtotal: 0 },
    ])
  }

  function eliminarItem(index: number) {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function actualizarItem(
    index: number,
    campo: keyof ItemCotizacion,
    valor: any
  ) {
    const nuevosItems = [...items]

    nuevosItems[index] = {
      ...nuevosItems[index],
      [campo]: valor,
    }

    const cantidad = Number(nuevosItems[index].cantidad || 0)
    const precio = Number(nuevosItems[index].precio_unitario || 0)

    nuevosItems[index].subtotal = cantidad * precio

    setItems(nuevosItems)
  }

  function calcularSubtotal() {
    return items.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    )
  }

  function calcularTotal() {
    return calcularSubtotal() - Number(formData.descuento || 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.clienteId) {
        throw new Error('Selecciona un cliente')
      }

      if (items.some((i) => !i.tipo_caja)) {
        throw new Error('Todos los items deben tener tipo de caja')
      }

      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
        }),
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json.error)

      router.push('/cotizaciones')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear cotización')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8 text-black">
      <h1 className="text-2xl font-bold text-black mb-6">Nueva Cotización</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Cliente *
          </label>
          <select
            required
            value={formData.clienteId}
            onChange={(e) =>
              setFormData({ ...formData, clienteId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Seleccionar cliente...</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre} ({cliente.tipoCliente})
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Descripción General *
          </label>
          <textarea
            required
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={3}
          />
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-black">
              Items de la Cotización
            </h3>
            <button
              type="button"
              onClick={agregarItem}
              className="px-4 py-2 bg-green-600 text-black rounded-md"
            >
              + Agregar Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Item #{index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarItem(index)}
                      className="text-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <input
                    type="text"
                    required
                    value={item.tipo_caja}
                    onChange={(e) =>
                      actualizarItem(index, 'tipo_caja', e.target.value)
                    }
                    className="col-span-2 px-3 py-2 border rounded-md"
                    placeholder="Tipo de caja"
                  />

                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) =>
                      actualizarItem(
                        index,
                        'cantidad',
                        Number(e.target.value)
                      )
                    }
                    className="px-3 py-2 border rounded-md"
                  />

                  <input
                  type="number"
                  step="0.01"
                  placeholder="Precio Unit."
                  value={item.precio_unitario}
                  onChange={(e) => actualizarItem(index, 'precio_unitario', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-400 bg-white text-black font-semibold rounded-md"
                  />
                </div>

                <div className="text-right mt-2 text-sm font-medium">
                  Subtotal: ${item.subtotal.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totales */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${calcularSubtotal().toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span>Descuento:</span>
            <input
              type="number"
              value={formData.descuento}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  descuento: e.target.value === '' ? '' : Number(e.target.value)
                })
              }
              className="w-32 px-2 py-1 border rounded-md"
            />
          </div>

          <div className="flex justify-between font-bold mt-3 border-t pt-2">
            <span>Total:</span>
            <span>${calcularTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Fecha */}
        <input
          type="date"
          required
          value={formData.fechaValidez}
          onChange={(e) =>
            setFormData({
              ...formData,
              fechaValidez: e.target.value,
            })
          }
          className="w-full px-3 py-2 border rounded-md"
        />

        {/* Notas */}
        <textarea
          value={formData.notas}
          onChange={(e) =>
            setFormData({ ...formData, notas: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Notas..."
        />

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-black rounded-md"
          >
            {loading ? 'Creando...' : 'Crear Cotización'}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-md"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}