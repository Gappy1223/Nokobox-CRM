'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoCliente: 'INDIVIDUAL'
  })

  // Cargar datos actuales del cliente
  useEffect(() => {
    async function cargarCliente() {
      try {
        const res = await fetch(`/api/clientes/${id}`)
        const data = await res.json()
        if (data.data) {
          setFormData({
            nombre: data.data.nombre,
            email: data.data.email,
            telefono: data.data.telefono || '',
            direccion: data.data.direccion || '',
            tipoCliente: data.data.tipoCliente
          })
        }
      } catch (err) {
        console.error("Error cargando cliente:", err)
      } finally {
        setLoading(false)
      }
    }
    cargarCliente()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(`/api/clientes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push(`/clientes/${id}`)
        router.refresh()
      } else {
        alert("Error al guardar los cambios")
      }
    } catch (err) {
      alert("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-black font-bold">
        <Loader2 className="animate-spin mr-2" /> Cargando datos...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8 text-black">
      <Link 
        href={`/clientes/${id}`}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8 font-bold transition-colors"
      >
        <ArrowLeft size={20} /> Cancelar y Volver
      </Link>

      <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-black mb-8 border-b pb-4">Editar Perfil de Cliente</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nombre Completo / Empresa</label>
              <input
                required
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Tipo de Cliente */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Tipo de Cliente</label>
              <select
                value={formData.tipoCliente}
                onChange={(e) => setFormData({...formData, tipoCliente: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="EMPRESA">Empresa</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Correo Electrónico</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Dirección</label>
            <textarea
              rows={3}
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Guardando Cambios...' : 'Guardar Información'}
          </button>
        </form>
      </div>
    </div>
  )
}