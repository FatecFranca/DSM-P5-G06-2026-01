-- CreateEnum
CREATE TYPE "ContextoGlicose" AS ENUM ('JEJUM', 'PRE_REFEICAO', 'POS_REFEICAO', 'ANTES_DORMIR', 'ALEATORIA');

-- CreateEnum
CREATE TYPE "StatusGlicose" AS ENUM ('BAIXO', 'NORMAL', 'ALTO', 'MUITO_ALTO');

-- CreateTable
CREATE TABLE "glicoses" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "contexto" "ContextoGlicose" NOT NULL,
    "data" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "status" "StatusGlicose" NOT NULL,
    "notas" TEXT,

    CONSTRAINT "glicoses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "glicoses" ADD CONSTRAINT "glicoses_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
