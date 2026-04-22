import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function DetalleClientePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 1. Verificación de Seguridad y Roles
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const usuarioApp = await prisma.usuario.findUnique({
    where: { supabaseId: user.id }
  })

  const esAdmin = usuarioApp?.rol === 'ADMIN'
  const esVendedor = usuarioApp?.rol === 'VENDEDOR'
  const puedeEditar = esAdmin || esVendedor
  const puedeEliminar = esAdmin

  // 2. Obtener datos del cliente con sus relaciones
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      pedidos: { orderBy: { createdAt: 'desc' }, take: 5 },
      cotizaciones: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  })

  if (!cliente) notFound()

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-screen text-black">
      {/* Encabezado de Navegación y Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <Link 
          href="/clientes"
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-bold"
        >
          <ArrowLeft size={20} /> Volver a Clientes
        </Link>

        <div className="flex gap-3">
          {puedeEditar && (
            <Link
              href={`/clientes/${id}/editar`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Edit size={18} /> Editar Datos
            </Link>
          )}

          {puedeEliminar && (
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border-2 border-red-100 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-all">
              <Trash2 size={18} /> Eliminar Cliente
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Perfil y Contacto */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-4xl font-black shadow-inner">
              {cliente.nombre.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{cliente.nombre}</h1>
            <span className="inline-block mt-3 px-4 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full uppercase tracking-wider">
              {cliente.tipoCliente}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Información de Contacto</h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Correo Electrónico</p>
                  <p className="text-sm font-bold text-slate-900">{cliente.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Phone size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Teléfono de Contacto</p>
                  <p className="text-sm font-bold text-slate-900">{cliente.telefono || 'No disponible'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Dirección Fiscal/Entrega</p>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">{cliente.direccion || 'Sin dirección registrada'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Historial de Actividad */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECCIÓN PEDIDOS */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <Briefcase size={24} className="text-blue-600" /> Pedidos Recientes
              </h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Pedido</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estatus</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Monto Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cliente.pedidos.length > 0 ? cliente.pedidos.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/pedidos/${p.id}`} className="text-sm font-black text-blue-600 hover:underline">
                          #{p.numeroPedido}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 rounded-md uppercase">{p.estatus.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                        ${Number(p.montoTotal).toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                        No hay pedidos registrados para este cliente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN COTIZACIONES */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3">
              <Calendar size={24} className="text-blue-600" /> Historial de Cotizaciones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cliente.cotizaciones.length > 0 ? cliente.cotizaciones.map(c => (
                <Link 
                  key={c.id} 
                  href={`/cotizaciones/${c.id}`} 
                  className="p-5 border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">#{c.numeroCotizacion}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                      c.estado === 'APROBADA' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {c.estado}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-2 group-hover:text-blue-700 line-clamp-1">
                    {c.descripcion || 'Cotización de Cajas'}
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    Vence: {new Date(c.fechaValidez).toLocaleDateString('es-MX')}
                  </p>
                </Link>
              )) : (
                <div className="col-span-full p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400 font-medium italic">
                  Sin cotizaciones previas.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}