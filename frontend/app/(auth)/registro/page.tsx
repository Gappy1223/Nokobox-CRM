'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RolUsuario } from '@prisma/client'

export default function RegistroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
    rolSolicitado: 'LECTURA' as RolUsuario,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validaciones
    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

      const user = authData.user
      if (!user){
        throw new Error('Usuario creado pero sin datos (verifica confirmacion por email)')
      }
      
      if (!authData.user) {
        throw new Error('No se pudo crear el usuario')
      }

      // 2. Crear registro en tabla usuarios (estado PENDIENTE)
      const res = await fetch('/api/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          supabaseId: authData.user.id,
          rolSolicitado: formData.rolSolicitado,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Error al registrar usuario')
      }

      // Éxito
      alert('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta. Después, un administrador aprobará tu acceso.')
      router.push('/login')
    } catch (error: any) {
      setError(error.message || 'Ocurrio un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Solicita acceso a NokoBox CRM
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-800 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-800 rounded-md text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contraseña *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-800 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                required
                value={formData.confirmarPassword}
                onChange={(e) => setFormData({ ...formData, confirmarPassword: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-800 rounded-md text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Solicitar Rol *
              </label>
              <select
                value={formData.rolSolicitado}
                onChange={(e) => setFormData({ ...formData, rolSolicitado: e.target.value as RolUsuario })}
                className="w-full px-3 py-2 border border-gray-800 rounded-md text-black"
              >
                <option value="LECTURA">Solo Lectura - Ver información</option>
                <option value="VENDEDOR">Vendedor - Gestionar clientes y ventas</option>
                <option value="PRODUCCION">Producción - Gestionar pedidos</option>
              </select>
              <p className="mt-1 text-xs text-gray-800">
                El administrador revisará tu solicitud
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursos-not-allowed"
          >
            {loading ? 'Enviando solicitud...' : 'Solicitar Acceso'}
          </button>

          <div className="text-center">
            <a href="/login" className="text-sm text-blue-600 hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}