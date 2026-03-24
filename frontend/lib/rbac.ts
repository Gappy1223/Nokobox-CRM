import { RolUsuario } from "@prisma/client";
type Permiso = string
const permisosPorRol: Record<RolUsuario, Permiso[]> = {
    ADMIN: ['*'],
  
  VENDEDOR: [
    'clientes:read',
    'clientes:create',
    'clientes:update',
    'pedidos:read',
    'pedidos:create',
    'pedidos:update',
    'pedidos:read:costos',
    'cotizaciones:*',
    'interacciones:*',
    'reportes:read',
  ],
  
  PRODUCCION: [
    'clientes:read:nombre',
    'pedidos:read',
    'pedidos:update:estado',
    'pedidos:read:costos',
    'interacciones:read',
    'interacciones:create',
    'reportes:read:produccion',
  ],
  
  LECTURA: [
    'clientes:read',
    'pedidos:read',
    'pedidos:read:costos',
    'cotizaciones:read',
  ],
}

export function puedeEditarEstadoPedido(rol: RolUsuario): boolean {
    return rol == 'ADMIN' || rol == 'PRODUCCION'
}