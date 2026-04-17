-- CreateEnum
CREATE TYPE "TipoDiabetes" AS ENUM ('NENHUM', 'TIPO1', 'TIPO2', 'GESTACIONAL', 'PRE_DIABETES');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('USUARIO', 'ADMIN');

-- CreateEnum
CREATE TYPE "Humor" AS ENUM ('OTIMO', 'BOM', 'OK', 'MAL', 'PESSIMO');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('EXERCICIO', 'ALIMENTACAO', 'EMERGENCIA', 'BEM_ESTAR');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "idade" INTEGER,
    "peso" DOUBLE PRECISION,
    "altura" DOUBLE PRECISION,
    "tipoDiabetes" "TipoDiabetes" NOT NULL DEFAULT 'NENHUM',
    "glicoseAlvoMin" DOUBLE PRECISION,
    "glicoseAlvoMax" DOUBLE PRECISION,
    "nomeMedico" TEXT,
    "ultimaConsulta" TIMESTAMP(3),
    "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO',
    "perfil" "Perfil" NOT NULL DEFAULT 'USUARIO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diarios" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "humor" "Humor" NOT NULL,
    "sintomas" TEXT[],
    "tags" TEXT[],
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dicas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "sumario" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "tempoLeitura" INTEGER NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dicas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "diarios" ADD CONSTRAINT "diarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
