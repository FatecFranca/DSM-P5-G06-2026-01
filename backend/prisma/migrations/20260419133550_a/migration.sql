-- CreateEnum
CREATE TYPE "QualidadeSono" AS ENUM ('PESSIMA', 'RUIM', 'BOA', 'EXCELENTE');

-- CreateTable
CREATE TABLE "sonos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "horaDeitar" TEXT NOT NULL,
    "horaAcordar" TEXT NOT NULL,
    "duracao" DOUBLE PRECISION NOT NULL,
    "qualidade" "QualidadeSono" NOT NULL,
    "notas" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sonos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sonos" ADD CONSTRAINT "sonos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
