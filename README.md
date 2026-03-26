# NokoBox CRM

Sistema de gestión de clientes (CRM) para PyME de cajas personalizadas.

## Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 20.x o superior ([Descargar](https://nodejs.org/))
- **npm** 10.x o superior (viene con Node.js)
- **Git** ([Descargar](https://git-scm.com/downloads))

Verifica las versiones instaladas:
```bash
node --version  # Debe mostrar v20.x.x
npm --version   # Debe mostrar 10.x.x
git --version   # Debe mostrar git version 2.x.x
```

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/Gappy1223/Nokobox-CRM.git
cd Nokobox-CRM/frontend
```

### 2. Instalar dependencias
```bash
npm install
```

Este comando instalará todas las dependencias necesarias (puede tardar 2-3 minutos).

### 3. Configurar variables de entorno

#### a) Crear archivo de configuración

Copia el archivo de ejemplo y renómbralo:
```bash
cp .env.example .env.local
```

#### b) Obtener credenciales de Supabase

1. Ve a [Supabase](https://supabase.com) e inicia sesión
2. Busca tu proyecto **nokobox-crm-production** (o el nombre que le hayas dado)
3. Ve a **Settings** → **API**
4. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Ve a **Settings** → **Database**
6. Copia la **Connection string** (URI mode) → `DATABASE_URL`
   - Reemplaza `[YOUR-PASSWORD]` con tu contraseña de base de datos

#### c) Obtener credenciales de Cloudinary

1. Ve a [Cloudinary](https://cloudinary.com) e inicia sesión
2. En el **Dashboard** encontrarás:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

#### d) Configurar archivo .env.local

Edita el archivo `frontend/.env.local` y pega tus credenciales:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.xxxxxxxxxx.supabase.co:5432/postgres

# Cloudinary
CLOUDINARY_CLOUD_NAME=nokobox-crm
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configurar la base de datos

#### a) Generar el cliente de Prisma
```bash
npx prisma generate
```

#### b) Ejecutar migraciones
```bash
npx prisma migrate deploy
```

O si es la primera vez:
```bash
npx prisma migrate dev --name init
```

### 5. Verificar la base de datos (Opcional)

Puedes abrir Prisma Studio para ver tus datos:
```bash
npx prisma studio
```

Se abrirá en http://localhost:5555

### 6. Iniciar la aplicación
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

## Usuario Administrador Inicial

Para acceder por primera vez, necesitas crear un usuario administrador:

### Opción A: Desde Supabase Dashboard

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. **Authentication** → **Users** → **Add user**
3. Ingresa:
   - Email: `admin@nokobox.com` (o el que prefieras)
   - Password: (genera una contraseña segura)
   - **Auto Confirm User**: ✅ Activar
4. Copia el **User UID** que se generó

5. Ve a **SQL Editor** y ejecuta:
```sql
INSERT INTO usuarios (nombre, email, supabase_id, rol, estado, activo)
VALUES (
  'Administrador',
  'admin@nokobox.com',
  'EL_USER_UID_QUE_COPIASTE',
  'ADMIN',
  'APROBADO',
  true
);
```

### Opción B: Registrarse desde la aplicación

1. Abre http://localhost:3000/registro
2. Completa el formulario
3. Ve a Supabase → **Table Editor** → **usuarios**
4. Encuentra tu registro y actualiza:
   - `estado`: PENDIENTE → **APROBADO**
   - `rol`: LECTURA → **ADMIN**
   - `activo`: false → **true**

## Estructura del Proyecto
```
frontend/
├── app/                    # Rutas de Next.js 14
│   ├── (auth)/            # Páginas de autenticación
│   ├── (dashboard)/       # Páginas del dashboard
│   └── api/               # API Routes
├── components/            # Componentes React
├── lib/                   # Utilidades y configuración
├── prisma/               # Schema y migraciones
├── public/               # Archivos estáticos
└── types/                # Definiciones TypeScript
```

## Comandos Útiles
```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Construir para producción
npm run start            # Iniciar servidor de producción
npm run lint             # Ejecutar linter

# Base de datos
npx prisma studio        # Abrir Prisma Studio
npx prisma generate      # Generar cliente de Prisma
npx prisma migrate dev   # Crear nueva migración
npx prisma migrate deploy # Aplicar migraciones en producción
```

## Roles de Usuario

El sistema maneja 4 roles:

- **ADMIN**: Acceso completo + gestión de usuarios
- **VENDEDOR**: Gestión de clientes, pedidos y cotizaciones
- **PRODUCCION**: Gestión de estados de pedidos
- **LECTURA**: Solo visualización

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: "connect ECONNREFUSED" al conectar a base de datos

Verifica que:
1. Tu `DATABASE_URL` en `.env.local` sea correcta
2. Hayas reemplazado `[YOUR-PASSWORD]` con tu contraseña real
3. No haya espacios extra al copiar las credenciales

### La página muestra "No autenticado"

1. Verifica que hayas creado el usuario administrador
2. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctos
3. Intenta hacer logout y volver a iniciar sesión

### Error: "Row Level Security" o "permission denied"

Ejecuta en Supabase SQL Editor:
```sql
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE interacciones DISABLE ROW LEVEL SECURITY;
```

### No puedo ver mis cambios

1. Detén el servidor (Ctrl+C)
2. Ejecuta `npm run dev` nuevamente
3. Limpia el caché del navegador (Ctrl+Shift+R)


## Funcionalidades Principales

- ✅ Gestión de clientes B2B/B2C
- ✅ Sistema de pedidos con tablero Kanban
- ✅ Cotizaciones con conversión a pedido
- ✅ Historial de interacciones
- ✅ Sistema de recordatorios
- ✅ Dashboards por rol
- ✅ Sistema de aprobación de usuarios

## Seguridad

- **NO** subas archivos `.env` o `.env.local` a GitHub
- Las credenciales deben mantenerse privadas
- Cambia las contraseñas periódicamente
- Usa contraseñas fuertes para usuarios administradores

