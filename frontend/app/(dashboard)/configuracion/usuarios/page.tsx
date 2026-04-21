import { prisma } from '@/lib/prisma'
import BotonAprobar from '@/components/usuarios/BotonAprobar'

export default async function UsuariosPage() {
  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const pendientes = usuarios.filter(u => u.estado === 'PENDIENTE')
  const aprobados = usuarios.filter(u => u.estado === 'APROBADO')
  const rechazados = usuarios.filter(u => u.estado === 'RECHAZADO')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Usuarios</h1>

      {/* Solicitudes Pendientes */}
      {pendientes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">
            🔔 Solicitudes Pendientes ({pendientes.length})
          </h2>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="space-y-4">
              {pendientes.map((usuario) => (
                <div key={usuario.id} className="bg-white p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{usuario.nombre}</h3>
                    <p className="text-sm text-gray-800">{usuario.email}</p>
                    <p className="text-sm mt-1">
                      <span className="text-gray-800">Rol solicitado:</span>{' '}
                      <span className={`px-2 py-1 rounded text-xs ${
                        usuario.rol === 'VENDEDOR' ? 'bg-blue-100 text-blue-800' :
                        usuario.rol === 'PRODUCCION' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {usuario.rol}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Solicitado: {new Date(usuario.createdAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <BotonAprobar usuarioId={usuario.id} rolSolicitado={usuario.rol} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Usuarios Aprobados */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ✅ Usuarios Activos ({aprobados.length})
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b border-gray-400">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {aprobados.map((usuario) => (
                <tr key={usuario.id}>
                  <td className="px-6 py-4 text-gray-900 font-medium">{usuario.nombre}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{usuario.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      usuario.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      usuario.rol === 'VENDEDOR' ? 'bg-blue-100 text-blue-800' :
                      usuario.rol === 'PRODUCCION' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-600">✅ Activo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usuarios Rechazados */}
      {rechazados.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            ❌ Solicitudes Rechazadas ({rechazados.length})
          </h2>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-600 space-y-2">
              {rechazados.map((usuario) => (
                <div key={usuario.id}>
                  {usuario.nombre} ({usuario.email})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}