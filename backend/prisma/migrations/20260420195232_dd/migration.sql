-- CreateEnum
CREATE TYPE "CategoriaMeta" AS ENUM ('GLICOSE', 'PESO', 'EXERCICIO', 'AGUA', 'SONO', 'PASSOS');

-- CreateTable
CREATE TABLE "metas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "alvo" DOUBLE PRECISION NOT NULL,
    "atual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade" TEXT NOT NULL,
    "categoria" "CategoriaMeta" NOT NULL,
    "prazo" TEXT NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "cor" TEXT NOT NULL DEFAULT '#4CAF82',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "metas" ADD CONSTRAINT "metas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
