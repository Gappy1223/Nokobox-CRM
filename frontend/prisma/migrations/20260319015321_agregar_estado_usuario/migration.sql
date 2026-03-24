-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "estado" "EstadoUsuario" NOT NULL DEFAULT 'PENDIENTE';
