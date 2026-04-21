'use client'

import { useState, useEffect } from 'react'
import { EstatusPedido } from '@prisma/client'

import {
  DndContext,
  closestCorners,
  DragEndEvent,
} from '@dnd-kit/core'

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
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

  useEffect(() => {
    cargarPedidos()
  }, [])

  async function cargarPedidos() {
    const res = await fetch('/api/pedidos')
    const data = await res.json()
    setPedidos(data.data || [])
    setLoading(false)
  }

  async function actualizarEstatus(id: string, nuevo: EstatusPedido) {
    await fetch(`/api/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estatus: nuevo }),
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const pedidoId = active.id as string
    const nuevoEstatus = over.id as EstatusPedido

    setPedidos(prev =>
      prev.map(p =>
        p.id === pedidoId
          ? { ...p, estatus: nuevoEstatus }
          : p
      )
    )

    actualizarEstatus(pedidoId, nuevoEstatus)
  }

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="p-8">
        <h1 className="text-3xl font-bold text-black-800 mb-6" >
          Tablero de Pedidos
        </h1>

        <div className="flex gap-4 overflow-x-auto">

          {COLUMNAS.map(col => {
            const pedidosCol = pedidos.filter(
              p => p.estatus === col
            )

            return (
              <Columna
                key={col}
                id={col}
                title={NOMBRES_COLUMNAS[col]}
                pedidos={pedidosCol}
              />
            )
          })}

        </div>
      </div>
    </DndContext>
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

  const { setNodeRef } = useDroppable({
    id,
  })

  return (
    <div className="flex-shrink-0 w-80">
      <div className="border-2 border-gray-400 bg-gray-50 rounded-2xl shadow-[0_0_5px_rgba(0,0,0,0.2)] p-4">

        <h3 className="font-semibold mb-4 text-black">
          {title}
          <span className="ml-2 text-sm text-gray-900">
            ({pedidos.length})
          </span>
        </h3>

        <div
          ref={setNodeRef}
          className="space-y-2 min-h-[200px]"
        >
          <SortableContext
            items={pedidos.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >

            {pedidos.map(pedido => (
              <TarjetaPedido
                key={pedido.id}
                pedido={pedido}
              />
            ))}

          </SortableContext>
        </div>

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
  } = useSortable({
    id: pedido.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-blue-100 p-4 rounded shadow hover:shadow-md transition cursor-grab"
    >

      <div className="font-medium">
        #{pedido.numeroPedido}
      </div>

      <div className="text-sm text-black mt-1">
        {pedido.cliente.nombre}
      </div>

      <div className="text-sm text-black mt-2">
        {pedido.tipoCaja}
      </div>

      <div className="text-xs text-black mt-2">
        Entrega:{' '}
        {new Date(
          pedido.fechaEntregaEstimada
        ).toLocaleDateString('es-MX')}
      </div>

    </div>
  )
}