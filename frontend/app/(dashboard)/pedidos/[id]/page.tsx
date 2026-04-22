'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Calendar, User, Tag } from 'lucide-react'

export default function DetallePedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [pedido, setPedido] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargarPedido() {
      // Usamos el endpoint GET de pedidos filtrando por ID si tu API lo permite
      // o ajustamos para obtener el detalle individual
      const res = await fetch(`/api/pedidos`)
      const data = await res.json()
      const encontrado = data.data?.find((p: any) => p.id === id)
      setPedido(encontrado)
      setLoading(false)
    }
    cargarPedido()
  }, [id])

  if (loading) return <div className="p-8 text-black">Cargando detalles...</div>
  if (!pedido) return <div className="p-8 text-red-500">Pedido no encontrado</div>

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors font-bold"
      >
        <ArrowLeft size={20} /> Volver al tablero
      </button>

      <div className="border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <span className="text-blue-600 font-black text-sm uppercase tracking-widest">Pedido #{pedido.numeroPedido}</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{pedido.tipoCaja}</h1>
          </div>
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase">
            {pedido.estatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><User size={20} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Cliente</p>
                <p className="text-lg font-bold text-slate-900">{pedido.cliente.nombre}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Calendar size={20} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Entrega Estimada</p>
                <p className="text-lg font-bold text-slate-900">
                  {new Date(pedido.fechaEntregaEstimada).toLocaleDateString('es-MX', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Package size={20} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Cantidad</p>
                <p className="text-lg font-bold text-slate-900">{pedido.cantidad || 0} unidades</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Tag size={20} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Personalización</p>
                <p className="text-lg font-bold text-slate-900">{pedido.nivelPersonalizacion}</p>
              </div>
            </div>
          </div>
        </div>

        {pedido.descripcion && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Notas del Pedido</p>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {pedido.descripcion}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}