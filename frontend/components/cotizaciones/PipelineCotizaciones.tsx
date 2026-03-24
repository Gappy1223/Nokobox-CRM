'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EstadoCotizacion } from '@prisma/client'

interface Cliente {
  id: string
  nombre: string
  tipoCliente: string
}

interface Cotizacion {
  id: string
  numeroCotizacion: string
  estado: EstadoCotizacion
  montoTotal: number
  fechaValidez: string
  cliente: Cliente
}

interface Stats {
  total: number
  tasaConversion: number
  aprobadas: number
  porVencer: number
}

const ESTADOS: EstadoCotizacion[] = [
  'PENDIENTE',
  'ENVIADA',
  'APROBADA',
  'RECHAZADA',
  'EXPIRADA',
]

const NOMBRES_ESTADOS = {
  PENDIENTE: 'Pendiente',
  ENVIADA: 'Enviada',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  EXPIRADA: 'Expirada',
}

export default function PipelineCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const [resCotizaciones, resStats] = await Promise.all([
        fetch('/api/cotizaciones'),
        fetch('/api/cotizaciones/stats'),
      ])

      const jsonCotizaciones = await resCotizaciones.json()
      const jsonStats = await resStats.json()

      if (!resCotizaciones.ok) throw new Error(jsonCotizaciones.error)
      if (!resStats.ok) throw new Error(jsonStats.error)

      setCotizaciones(jsonCotizaciones.data || [])
      setStats(jsonStats.data || null)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Pipeline de Cotizaciones
        </h1>

        <Link
          href="/cotizaciones/nueva"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Nueva Cotización
        </Link>
      </div>

      {/* Métricas */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card title="Total" value={stats.total} />
          <Card title="Conversión" value={`${stats.tasaConversion}%`} />
          <Card title="Aprobadas" value={stats.aprobadas} color="text-green-600" />
          <Card title="Por vencer" value={stats.porVencer} color="text-orange-600" />
        </div>
      )}

      {/* Pipeline */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {ESTADOS.map((estado) => {
          const items = cotizaciones.filter(
            (c) => c.estado === estado
          )

          return (
            <div key={estado} className="flex-shrink-0 w-80">
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {NOMBRES_ESTADOS[estado]}
                  <span className="ml-2 text-sm text-gray-900">
                    ({items.length})
                  </span>
                </h3>

                <div className="space-y-2">
                  {items.map((cotizacion) => (
                    <Link
                      key={cotizacion.id}
                      href={`/cotizaciones/${cotizacion.id}`}
                      className="block bg-white p-4 rounded shadow hover:shadow-md transition"
                    >
                      <div className="font-medium">
                        #{cotizacion.numeroCotizacion}
                      </div>

                      <div className="text-sm text-gray-900 mt-1">
                        {cotizacion.cliente.nombre}
                      </div>

                      <div className="text-lg font-bold text-blue-900 mt-2">
                        ${Number(cotizacion.montoTotal).toFixed(2)}
                      </div>

                      <div className="text-xs text-gray-900 mt-2">
                        Válida hasta:{' '}
                        {new Date(
                          cotizacion.fechaValidez
                        ).toLocaleDateString('es-MX')}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* Componente reutilizable */
function Card({
  title,
  value,
  color = 'text-gray-900',
}: {
  title: string
  value: string | number
  color?: string
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="text-sm text-gray-900">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
      </div>
    </div>
  )
}