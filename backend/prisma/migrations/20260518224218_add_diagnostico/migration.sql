-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "diagnosticoFeito" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "diagnosticos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "respostas" JSONB NOT NULL,
    "pontuacao" INTEGER NOT NULL,
    "nivelRisco" TEXT NOT NULL,
    "percentual" INTEGER NOT NULL,
    "predicao" INTEGER NOT NULL,
    "probabilidade" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnosticos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "diagnosticos" ADD CONSTRAINT "diagnosticos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
