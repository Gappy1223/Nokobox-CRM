-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('PARTICULAR', 'EMPRESA');

-- CreateEnum
CREATE TYPE "EstadoCliente" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "NivelPersonalizacion" AS ENUM ('BASICO', 'MEDIO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "EstatusPedido" AS ENUM ('SOLICITADO', 'EN_DISENO', 'EN_PRODUCCION', 'LISTO', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoCotizacion" AS ENUM ('PENDIENTE', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "TipoInteraccion" AS ENUM ('LLAMADA', 'EMAIL', 'WHATSAPP', 'REUNION', 'NOTA', 'CONSULTA_TECNICA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'VENDEDOR', 'PRODUCCION', 'LECTURA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "supabase_id" TEXT,
    "rol" "RolUsuario" NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "tipo_cliente" "TipoCliente" NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombre_empresa" TEXT,
    "email" TEXT,
    "telefono" TEXT NOT NULL,
    "whatsapp" TEXT,
    "direccion" TEXT,
    "preferencias_diseno" JSONB,
    "etiquetas" JSONB,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_contacto" TIMESTAMP(3),
    "notas" TEXT,
    "estado" "EstadoCliente" NOT NULL DEFAULT 'ACTIVO',
    "total_pedidos" INTEGER NOT NULL DEFAULT 0,
    "valor_total_compras" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "numero_pedido" SERIAL NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "tipo_caja" TEXT NOT NULL,
    "nivel_personalizacion" "NivelPersonalizacion" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "descripcion" TEXT,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega_estimada" TIMESTAMP(3) NOT NULL,
    "fecha_entrega_real" TIMESTAMP(3),
    "estatus" "EstatusPedido" NOT NULL DEFAULT 'SOLICITADO',
    "monto_total" DECIMAL(12,2) NOT NULL,
    "monto_pagado" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "archivos_diseno" JSONB,
    "notas_especiales" TEXT,
    "notas_produccion" TEXT,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" TEXT NOT NULL,
    "numero_cotizacion" SERIAL NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "descripcion" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "monto_subtotal" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "monto_total" DECIMAL(12,2) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_enviada" TIMESTAMP(3),
    "fecha_validez" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCotizacion" NOT NULL DEFAULT 'PENDIENTE',
    "convertida_pedido" BOOLEAN NOT NULL DEFAULT false,
    "pedido_id" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interacciones" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "tipo" "TipoInteraccion" NOT NULL,
    "asunto" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordatorio_fecha" TIMESTAMP(3),
    "recordatorio_completado" BOOLEAN NOT NULL DEFAULT false,
    "pedido_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interacciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_supabase_id_key" ON "usuarios"("supabase_id");

-- CreateIndex
CREATE INDEX "clientes_tipo_cliente_idx" ON "clientes"("tipo_cliente");

-- CreateIndex
CREATE INDEX "clientes_estado_idx" ON "clientes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_pedido_key" ON "pedidos"("numero_pedido");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_idx" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "pedidos_estatus_idx" ON "pedidos"("estatus");

-- CreateIndex
CREATE INDEX "pedidos_fecha_entrega_estimada_idx" ON "pedidos"("fecha_entrega_estimada");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_numero_cotizacion_key" ON "cotizaciones"("numero_cotizacion");

-- CreateIndex
CREATE INDEX "cotizaciones_cliente_id_idx" ON "cotizaciones"("cliente_id");

-- CreateIndex
CREATE INDEX "cotizaciones_estado_idx" ON "cotizaciones"("estado");

-- CreateIndex
CREATE INDEX "interacciones_cliente_id_idx" ON "interacciones"("cliente_id");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interacciones" ADD CONSTRAINT "interacciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
