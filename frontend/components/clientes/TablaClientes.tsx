'use client'

import Link from 'next/link'
import { User, Building2, Phone, Mail, Eye, MoreVertical } from 'lucide-react'

// Definimos la interfaz según tu Schema real de Prisma
interface Cliente {
  id: string
  nombre: string
  tipoCliente: 'PARTICULAR' | 'EMPRESA'
  email: string | null
  telefono: string
  totalPedidos: number
  valorTotalCompras: any // Decimal
}

export default function TablaClientes({ clientes }: { clientes: Cliente[] }) {
  if (clientes.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-100 rounded-3xl p-20 text-center">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-slate-300" size={32} />
        </div>
        <p className="text-slate-500 font-bold">No hay clientes activos en este momento.</p>
        <Link href="/clientes/nuevo" className="text-blue-600 text-sm font-black hover:underline mt-2 inline-block">
          Crear mi primer cliente
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm shadow-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente / Empresa</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipo</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contacto rápido</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Historial</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${
                      cliente.tipoCliente === 'EMPRESA' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {cliente.tipoCliente === 'EMPRESA' ? <Building2 size={16} /> : <User size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">{cliente.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Registrado el {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    cliente.tipoCliente === 'EMPRESA' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {cliente.tipoCliente === 'EMPRESA' ? 'Corporativo' : 'Individual'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Phone size={12} className="text-slate-300" /> {cliente.telefono}
                    </div>
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Mail size={12} className="text-slate-300" /> {cliente.email}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900">{cliente.totalPedidos} Pedidos</span>
                    <span className="text-[10px] font-bold text-green-600 uppercase">Total: ${Number(cliente.valorTotalCompras).toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/clientes/${cliente.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-95"
                  >
                    <Eye size={14} /> Detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}