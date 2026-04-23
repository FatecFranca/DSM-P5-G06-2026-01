-- CreateEnum
CREATE TYPE "TipoMedicacao" AS ENUM ('INSULINA', 'ORAL', 'SUPLEMENTO', 'OUTRO');

-- CreateTable
CREATE TABLE "medicacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dosagem" TEXT NOT NULL,
    "frequencia" TEXT NOT NULL,
    "horarios" TEXT[],
    "tipo" "TipoMedicacao" NOT NULL DEFAULT 'ORAL',
    "notas" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#4CAF82',
    "tomado" BOOLEAN NOT NULL DEFAULT false,
    "ultimaTomada" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicacoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medicacoes" ADD CONSTRAINT "medicacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
