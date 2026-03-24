'use client'

import { TipoInteraccion } from '@prisma/client'

const ICONOS_TIPO: Record<TipoInteraccion, string> = {
  LLAMADA: '📞',
  EMAIL: '📧',
  WHATSAPP: '💬',
  REUNION: '🤝',
  NOTA: '📝',
  CONSULTA_TECNICA: '🔧'
}

interface Interaccion {
  id: string
  tipo: TipoInteraccion
  asunto: string
  descripcion: string
  fecha: string // 👈 CAMBIO IMPORTANTE
  recordatorioFecha?: string | null // 👈 CAMBIO
  recordatorioCompletado: boolean
}

interface Props {
  interacciones: Interaccion[]
}

export default function TimelineInteracciones({ interacciones }: Props) {
  if (!interacciones || interacciones.length === 0) {
    return (
      <div className="text-center py-12 text-gray-800">
        No hay interacciones registradas
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interacciones.map((interaccion, index) => {
        const fecha = new Date(interaccion.fecha)
        const recordatorio = interaccion.recordatorioFecha
          ? new Date(interaccion.recordatorioFecha)
          : null

        return (
          <div key={interaccion.id} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                {ICONOS_TIPO[interaccion.tipo]}
              </div>
              {index < interacciones.length - 1 && (
                <div className="w-0.5 h-full bg-gray-800 mt-2" />
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1 pb-8">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{interaccion.asunto}</h4>
                  <span className="text-xs text-gray-800">
                    {fecha.toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {interaccion.descripcion}
                </p>

                {recordatorio && !interaccion.recordatorioCompletado && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded">
                    ⏰ Recordatorio:{' '}
                    {recordatorio.toLocaleDateString('es-MX')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}