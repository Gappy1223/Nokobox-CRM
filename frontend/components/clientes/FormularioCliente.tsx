'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TipoCliente } from '@prisma/client'

type FormData = {
  tipoCliente: TipoCliente
  nombre: string
  nombreEmpresa: string
  email: string
  telefono: string
  whatsapp: string
  direccion: string
  notas: string
}

export default function FormularioCliente() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    tipoCliente: 'PARTICULAR',
    nombre: '',
    nombreEmpresa: '',
    email: '',
    telefono: '',
    whatsapp: '',
    direccion: '',
    notas: '',
  })

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
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear cliente')
      }

      router.push('/clientes')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl text-black font-bold mb-6">Nuevo Cliente</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* TIPO CLIENTE */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Tipo de Cliente *
          </label>

          <select
            value={formData.tipoCliente}
            onChange={(e) =>
              updateField('tipoCliente', e.target.value as TipoCliente)
            }
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
          >
            <option value="PARTICULAR">B2C - Particular</option>
            <option value="EMPRESA">B2B - Empresa</option>
          </select>
        </div>

        {/* NOMBRE */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Nombre Completo *
          </label>

          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => updateField('nombre', e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
            placeholder="Nombre de la persona de contacto"
          />
        </div>

        {/* EMPRESA */}
        {formData.tipoCliente === 'EMPRESA' && (
          <div>
            <label className="block text-sm text-black font-medium mb-2">
              Nombre de la Empresa
            </label>

            <input
              type="text"
              value={formData.nombreEmpresa}
              onChange={(e) => updateField('nombreEmpresa', e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
            />
          </div>
        )}

        {/* TELEFONO / WHATSAPP */}
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm text-black font-medium mb-2">
              Teléfono *
            </label>

            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => updateField('telefono', e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm text-black font-medium mb-2">
              WhatsApp
            </label>

            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => updateField('whatsapp', e.target.value)}
              className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
            />
          </div>

        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Email
          </label>

          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
          />
        </div>

        {/* DIRECCION */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Dirección
          </label>

          <textarea
            rows={3}
            value={formData.direccion}
            onChange={(e) => updateField('direccion', e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
          />
        </div>

        {/* NOTAS */}
        <div>
          <label className="block text-sm text-black font-medium mb-2">
            Notas
          </label>

          <textarea
            rows={3}
            value={formData.notas}
            onChange={(e) => updateField('notas', e.target.value)}
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
            placeholder="Información adicional, preferencias, etc."
          />
        </div>

        {/* BOTONES */}
        <div className="flex gap-4">

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Cliente'}
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