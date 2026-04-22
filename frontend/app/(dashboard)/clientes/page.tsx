// app/(dashboard)/clientes/page.tsx
import { prisma } from "@/lib/prisma";
import TablaClientes from "@/components/clientes/TablaClientes";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ClientesPage() {
  // 1. Obtenemos los clientes de la DB
  const clientesDb = await prisma.cliente.findMany({
    where: {
      estado: 'ACTIVO',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 2. SERIALIZACIÓN: Convertimos Decimales a números y Fechas a strings
  // Esto soluciona el error "Only plain objects can be passed..."
  const clientes = clientesDb.map(cliente => ({
    ...cliente,
    valorTotalCompras: cliente.valorTotalCompras.toNumber(), // Convertir Decimal a número
    fechaRegistro: cliente.fechaRegistro.toISOString(),      // Convertir Date a string
    createdAt: cliente.createdAt.toISOString(),
    updatedAt: cliente.updatedAt.toISOString(),
    ultimoContacto: cliente.ultimoContacto?.toISOString() || null,
  }));

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase">
            Directorio de Clientes
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Gestiona la información y el historial de tus clientes activos
          </p>
        </div>

        <Link
          href="/clientes/nuevo"
          className="px-4 py-2 text-black border-2 border-green-400 rounded-lg bg-green-200 hover:bg-green-50 hover:border-green-400 flex items-center gap-2 transition-all font-bold"
        >
          <Plus size={20} strokeWidth={3} />
          Nuevo Cliente
        </Link>
      </div>

      <TablaClientes clientes={clientes as any} />
    </div>
  );
}