-- CreateEnum
CREATE TYPE "Intensidade" AS ENUM ('LEVE', 'MODERADA', 'INTENSA');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('GLICOSE', 'REFEICAO', 'MEDICAMENTO', 'CONSULTA', 'DICA', 'META');

-- CreateEnum
CREATE TYPE "TipoRefeicao" AS ENUM ('CAFE_MANHA', 'ALMOCO', 'JANTAR', 'LANCHE');

-- CreateTable
CREATE TABLE "exercicios" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "duracao" INTEGER NOT NULL,
    "calorias" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "intensidade" "Intensidade" NOT NULL,
    "notas" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "data" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refeicoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoRefeicao" NOT NULL,
    "data" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "alimentos" JSONB NOT NULL,
    "totalCalorias" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalProteinas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalGorduras" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notas" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refeicoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exercicios" ADD CONSTRAINT "exercicios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refeicoes" ADD CONSTRAINT "refeicoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
