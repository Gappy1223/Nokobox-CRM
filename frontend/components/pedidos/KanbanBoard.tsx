'use client'

import { useState, useEffect } from 'react'
import { EstatusPedido } from '@prisma/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, GripVertical } from 'lucide-react' 

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

type Pedido = {
  id: string
  numeroPedido: string
  estatus: EstatusPedido
  tipoCaja: string
  fechaEntregaEstimada: string
  cliente: {
    nombre: string
  }
}

const COLUMNAS: EstatusPedido[] = [
  'SOLICITADO',
  'EN_DISENO',
  'EN_PRODUCCION',
  'LISTO',
  'ENTREGADO'
]

const NOMBRES_COLUMNAS: Record<EstatusPedido, string> = {
  SOLICITADO: 'Solicitado',
  EN_DISENO: 'En Diseño',
  EN_PRODUCCION: 'En Producción',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
}

export default function KanbanBoard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {
    try {
      const res = await fetch('/api/pedidos')
      const data = await res.json()
      setPedidos(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  async function actualizarEstatus(id: string, nuevo: EstatusPedido) {
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus: nuevo }),
      })
      if (!res.ok) throw new Error('Error al actualizar')
    } catch (error) {
      console.error(error)
      cargarPedidos() // Revertimos si falla la red o BD
    }
  }

  function handleDragStart(event: DragEndEvent){
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const pedidoId = active.id as string
    const destinoId = over.id as string

    const pedidoMovido = pedidos.find(p => p.id === pedidoId)
    if(!pedidoMovido) return

    let nuevoEstatus: EstatusPedido | null = null
 
    // Soltamos directamente sobre una columna (id de columna = estatus)
    if (COLUMNAS.includes(destinoId as EstatusPedido)) {
      nuevoEstatus = destinoId as EstatusPedido
    } else {
      // Soltamos sobre otra tarjeta: tomamos el estatus de esa tarjeta
      const tarjetaDestino = pedidos.find(p => p.id === destinoId)
      if (tarjetaDestino) {
        nuevoEstatus = tarjetaDestino.estatus
      }
    }
 
    if (!nuevoEstatus || pedidoMovido.estatus === nuevoEstatus) return
 
    // Actualización optimista
    setPedidos(prev =>
      prev.map(p => (p.id === pedidoId ? { ...p, estatus: nuevoEstatus! } : p))
    )
 
    actualizarEstatus(pedidoId, nuevoEstatus)
  }
 
  const pedidoActivo = activeId ? pedidos.find(p => p.id === activeId) : null
 
  if (loading) return <div className="p-8 text-black font-bold">Cargando tablero...</div>
 
  return (
    <div className="flex flex-col h-full bg-white p-6">
      {/* --- ENCABEZADO --- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tablero de Pedidos
          </h1>
          <p className="text-slate-500 text-sm">
            Arrastra desde el ícono{' '}
            <GripVertical className="inline w-3 h-3 -mt-0.5" /> para cambiar el estado
          </p>
        </div>
 
        <Link
          href="/pedidos/nuevo"
          className="px-4 py-2 text-black border-2 border-green-400 rounded-lg bg-green-200 hover:bg-green-50 hover:border-green-400 flex items-center gap-2 transition-all font-bold"
        >
          <Plus size={20} strokeWidth={3} />
          Nuevo Pedido
        </Link>
      </div>
 
      {/* --- TABLERO --- */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-6 h-full">
          {COLUMNAS.map(colId => (
            <Columna
              key={colId}
              id={colId}
              title={NOMBRES_COLUMNAS[colId]}
              pedidos={pedidos.filter(p => p.estatus === colId)}
            />
          ))}
        </div>
 
        {/* Overlay: la tarjeta "flotante" que sigue al cursor mientras arrastras.
           Es lo que hace que el drag se sienta fluido en lugar de brusco. */}
        <DragOverlay>
          {pedidoActivo ? <TarjetaVisual pedido={pedidoActivo} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
 
function Columna({
  id,
  title,
  pedidos,
}: {
  id: EstatusPedido
  title: string
  pedidos: Pedido[]
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
 
  return (
    <div
      className={`flex-shrink-0 w-80 flex flex-col rounded-2xl border p-3 transition-colors ${
        isOver ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
          {title}
        </h3>
        <span className="bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-black shadow-sm">
          {pedidos.length}
        </span>
      </div>
 
      {/* El ref del droppable va en un contenedor que SIEMPRE tiene altura,
         incluso vacío. Así se puede soltar aunque la columna no tenga tarjetas. */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 overflow-y-auto min-h-[200px] rounded-lg"
      >
        <SortableContext
          items={pedidos.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {pedidos.map(pedido => (
            <TarjetaPedido key={pedido.id} pedido={pedido} />
          ))}
        </SortableContext>
 
        {pedidos.length === 0 && (
          <div className="h-full min-h-[150px] flex items-center justify-center text-xs text-slate-400 italic border-2 border-dashed border-slate-200 rounded-xl">
            Suelta aquí
          </div>
        )}
      </div>
    </div>
  )
}
 
function TarjetaPedido({ pedido }: { pedido: Pedido }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pedido.id })
 
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
      {/* HANDLE DE ARRASTRE: sólo este botón tiene los listeners.
         El resto de la tarjeta queda libre para navegar con el Link. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Arrastrar pedido"
        className="absolute top-2 right-2 p-1.5 rounded-md text-slate-300 hover:text-slate-700 hover:bg-slate-100 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={16} />
      </button>
 
      {/* CONTENIDO CLICABLE: Link en lugar de onClick+router.push.
         Así evitamos que el click de soltar una tarjeta navegue por error. */}
      <Link href={`/pedidos/${pedido.id}`} className="block p-4">
        <div className="text-[10px] font-black text-blue-600 mb-1">
          #{pedido.numeroPedido}
        </div>
        <div className="font-bold text-slate-900 leading-tight pr-6 group-hover:text-blue-600 transition-colors">
          {pedido.cliente?.nombre || 'Cliente no asignado'}
        </div>
        <div className="text-xs text-slate-500 mt-1 font-medium">
          {pedido.tipoCaja}
        </div>
 
        <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
          <span className="text-[9px] font-bold text-slate-400">ENTREGA</span>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {new Date(pedido.fechaEntregaEstimada).toLocaleDateString('es-MX', {
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
 * Mientras arrastras, ves esta tarjeta "flotante" siguiendo al cursor
 * en lugar de que la tarjeta original se mueva torpemente.
 */
function TarjetaVisual({
  pedido,
  dragging = false,
}: {
  pedido: Pedido
  dragging?: boolean
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-blue-400 p-4 w-72 ${
        dragging ? 'shadow-2xl rotate-2 cursor-grabbing' : 'shadow-sm'
      }`}
    >
      <div className="text-[10px] font-black text-blue-600 mb-1">
        #{pedido.numeroPedido}
      </div>
      <div className="font-bold text-slate-900 leading-tight">
        {pedido.cliente?.nombre || 'Cliente no asignado'}
      </div>
      <div className="text-xs text-slate-500 mt-1 font-medium">
        {pedido.tipoCaja}
      </div>
 
      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-400">ENTREGA</span>
        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
          {new Date(pedido.fechaEntregaEstimada).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
          })}
        </span>
      </div>
    </div>
  )
}