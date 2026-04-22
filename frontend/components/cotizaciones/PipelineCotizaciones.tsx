'use client'
 
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { EstadoCotizacion } from '@prisma/client'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  pointerWithin,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRouter } from 'next/navigation'
import { Plus, GripVertical } from 'lucide-react'

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
  cliente?: Cliente
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
  const router = useRouter()
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Sensor para permitir clics en las tarjetas sin activar el arrastre inmediatamente
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  useEffect(() => {
    cargarCotizaciones()
  }, [])

  async function cargarCotizaciones() {
    try {
      const res = await fetch('/api/cotizaciones')
      const data = await res.json()
      setCotizaciones(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  async function actualizarEstado(id: string, nuevoEstado: EstadoCotizacion) {
    try {
      const res = await fetch(`/api/cotizaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
    } catch (error) {
      console.error(error)
      cargarCotizaciones() // Revertir si falla la red o DB
    }
  }

  function handleDragStart(event: DragEndEvent){
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return;

    const cotId = active.id as string;
    const overId = over.id as string;

    // 1. Encontrar la cotización que estamos moviendo
    const cotizacionMovida = cotizaciones.find(c => c.id === cotId);
    if (!cotizacionMovida) return;

    // 2. Determinar el nuevo estado
    let nuevoEstado: EstadoCotizacion | null = null;

    // ¿Soltamos directamente sobre una columna?
    if (ESTADOS.includes(overId as EstadoCotizacion)) {
      nuevoEstado = overId as EstadoCotizacion
    } else {
      // ¿Soltamos sobre otra tarjeta? Buscamos a qué columna pertenece esa tarjeta
      const tarjetaDestino = cotizaciones.find(c => c.id === overId);
        if (tarjetaDestino) {
        nuevoEstado = tarjetaDestino.estado;
      }
    }

    if(!nuevoEstado || cotizacionMovida.estado === nuevoEstado) return;

    //const cotizacionPrevia = cotizaciones.find(c=>c.id === cotId)
    //if (cotizacionPrevia?.estado === nuevoEstado) return
    // Actualización optimista del estado local
    setCotizaciones(prev =>
      prev.map(c => (c.id === cotId ? { ...c, estado: nuevoEstado! } : c))
    )

    actualizarEstado(cotId, nuevoEstado)
  }

  const cotizacionActiva = activeId
    ? cotizaciones.find(c => c.id === activeId)
    : null

  if (loading) return <div className="p-8 text-black font-bold">Cargando pipeline...</div>

  return (
    <div className="p-8 h-full bg-white">
      {/* --- ENCABEZADO --- */}
      <div className="flex justify-between items-center mb-8 border-b pb-6 border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tighter">
            Pipeline de Cotizaciones
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Arrastra desde el ícono{' '}
            <GripVertical className="inline w-3 h-3 -mt-0.5" /> para cambiar el estado
          </p>
        </div>
 
        <Link
          href="/cotizaciones/nueva"
          className="px-4 py-2 text-black border-2 border-green-400 rounded-lg bg-green-200 hover:bg-green-50 hover:border-green-400 flex items-center gap-2 transition-all font-bold"
        >
          <Plus size={20} strokeWidth={3} className="text-white" />
          Nueva Cotización
        </Link>
      </div>
 
      {/* --- TABLERO D&D --- */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-250px)]">
          {ESTADOS.map(estado => (
            <Columna
              key={estado}
              id={estado}
              title={NOMBRES_ESTADOS[estado]}
              cotizaciones={cotizaciones.filter(c => c.estado === estado)}
            />
          ))}
        </div>
 
        {/* Overlay: lo que el usuario ve "flotando" mientras arrastra.
           Mejora enormemente la sensación de fluidez. */}
        <DragOverlay>
          {cotizacionActiva ? (
            <TarjetaVisual cotizacion={cotizacionActiva} dragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
 
function Columna({
  id,
  title,
  cotizaciones,
}: {
  id: string
  title: string
  cotizaciones: Cotizacion[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
 
  return (
    <div
      className={`flex-shrink-0 w-80 flex flex-col rounded-2xl border p-3 transition-colors ${
        isOver
          ? 'bg-blue-50 border-blue-300'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
          {title}
        </h3>
        <span className="bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-black shadow-sm">
          {cotizaciones.length}
        </span>
      </div>
 
      {/* El ref del droppable va en el contenedor que SIEMPRE tiene altura,
         aunque esté vacío. Así las columnas vacías sí reciben el drop. */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-[200px] rounded-lg"
      >
        <SortableContext
          items={cotizaciones.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cotizaciones.map(cotizacion => (
            <TarjetaCotizacion key={cotizacion.id} cotizacion={cotizacion} />
          ))}
        </SortableContext>
 
        {cotizaciones.length === 0 && (
          <div className="h-full min-h-[150px] flex items-center justify-center text-xs text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
            Suelta aquí
          </div>
        )}
      </div>
    </div>
  )
}
 
function TarjetaCotizacion({ cotizacion }: { cotizacion: Cotizacion }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cotizacion.id })
 
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
 
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group relative ${
        isDragging ? 'ring-2 ring-blue-500/40' : ''
      }`}
    >
      {/* HANDLE DE ARRASTRE: sólo este ícono tiene los listeners.
         El resto de la tarjeta queda libre para ser clicable como Link. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Arrastrar cotización"
        className="absolute top-2 right-2 p-1.5 rounded-md text-slate-300 hover:text-slate-700 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={16} />
      </button>
 
      {/* CONTENIDO CLICABLE: el Link no compite con el drag porque
         los listeners están SOLO en el handle de arriba. */}
      <Link href={`/cotizaciones/${cotizacion.id}`} className="block p-4">
        <div className="text-[10px] font-black text-blue-600 mb-1">
          #{cotizacion.numeroCotizacion}
        </div>
 
        <div className="font-bold text-slate-900 leading-tight pr-6 group-hover:text-blue-600 transition-colors">
          {cotizacion.cliente?.nombre || 'Cliente no asignado'}
        </div>
 
        <div className="text-lg font-black text-slate-700 mt-2">
          $
          {Number(cotizacion.montoTotal).toLocaleString('es-MX', {
            minimumFractionDigits: 2,
          })}
        </div>
 
        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            Validez
          </span>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {new Date(cotizacion.fechaValidez).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
            })}
          </span>
        </div>
      </Link>
    </div>
  )
}
 
/**
 * Versión visual (sin lógica de sortable) para usar dentro del DragOverlay.
 * Esto hace que mientras arrastras veas una tarjeta "real" siguiendo al cursor
 * en lugar de que se quede pegada torpemente en su columna.
 */
function TarjetaVisual({
  cotizacion,
  dragging = false,
}: {
  cotizacion: Cotizacion
  dragging?: boolean
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-blue-400 p-4 w-72 ${
        dragging ? 'shadow-2xl rotate-2 cursor-grabbing' : 'shadow-sm'
      }`}
    >
      <div className="text-[10px] font-black text-blue-600 mb-1">
        #{cotizacion.numeroCotizacion}
      </div>
      <div className="font-bold text-slate-900 leading-tight">
        {cotizacion.cliente?.nombre || 'Cliente no asignado'}
      </div>
      <div className="text-lg font-black text-slate-700 mt-2">
        $
        {Number(cotizacion.montoTotal).toLocaleString('es-MX', {
          minimumFractionDigits: 2,
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
          Validez
        </span>
        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
          {new Date(cotizacion.fechaValidez).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
          })}
        </span>
      </div>
    </div>
  )
}