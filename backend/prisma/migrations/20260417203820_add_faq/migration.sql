-- CreateEnum
CREATE TYPE "CategoriaFAQ" AS ENUM ('DIABETES', 'SINTOMAS', 'ALIMENTACAO', 'EXERCICIOS', 'MEDICACAO', 'MONITORAMENTO');

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "pergunta" TEXT NOT NULL,
    "resposta" TEXT NOT NULL,
    "categoria" "CategoriaFAQ" NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);
