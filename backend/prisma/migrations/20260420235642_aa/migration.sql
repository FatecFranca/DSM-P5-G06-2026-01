-- CreateTable
CREATE TABLE "hidratacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hidratacoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hidratacoes" ADD CONSTRAINT "hidratacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
