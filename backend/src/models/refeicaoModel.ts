import prisma from '../config/database';
import { TipoRefeicao } from '../types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface AlimentoItem {
  id: string;
  nome: string;
  marca?: string;
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  categoria: 'bom' | 'moderado' | 'ruim';
  porcao: string;
  fatsecretId?: string;
  indiceGlicemico?: number;
}

export interface CriarRefeicaoDto {
  usuarioId: string;
  tipo: TipoRefeicao;
  data: string;
  hora: string;
  alimentos: AlimentoItem[];
  totalCalorias: number;
  totalCarbs: number;
  totalProteinas: number;
  totalGorduras: number;
  notas?: string;
}

export interface AtualizarRefeicaoDto {
  tipo?: TipoRefeicao;
  data?: string;
  hora?: string;
  alimentos?: AlimentoItem[];
  totalCalorias?: number;
  totalCarbs?: number;
  totalProteinas?: number;
  totalGorduras?: number;
  notas?: string | null;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const refeicaoModel = {
  async criar(dados: CriarRefeicaoDto) {
    return prisma.refeicao.create({
      data: {
        usuarioId:      dados.usuarioId,
        tipo:           dados.tipo,
        data:           dados.data,
        hora:           dados.hora,
        alimentos:      dados.alimentos as object[],
        totalCalorias:  dados.totalCalorias,
        totalCarbs:     dados.totalCarbs,
        totalProteinas: dados.totalProteinas,
        totalGorduras:  dados.totalGorduras,
        notas:          dados.notas,
      },
      include: { usuario: { select: { id: true, nome: true } } },
    });
  },

  async buscarPorId(id: string) {
    return prisma.refeicao.findUnique({
      where: { id },
      include: { usuario: { select: { id: true, nome: true } } },
    });
  },

  async listarDoUsuario(
    usuarioId: string,
    pagina = 1,
    limite = 50,
    data?: string,
    tipo?: TipoRefeicao,
  ) {
    const offset = (pagina - 1) * limite;
    const where: Record<string, unknown> = { usuarioId };
    if (data)  where['data'] = data;
    if (tipo)  where['tipo'] = tipo;

    const [registros, total] = await Promise.all([
      prisma.refeicao.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: [{ data: 'desc' }, { hora: 'desc' }],
      }),
      prisma.refeicao.count({ where }),
    ]);

    return { dados: registros, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  },

  async atualizar(id: string, dados: AtualizarRefeicaoDto) {
    const updateData: Record<string, unknown> = {};
    if (dados.tipo           !== undefined) updateData['tipo']           = dados.tipo;
    if (dados.data           !== undefined) updateData['data']           = dados.data;
    if (dados.hora           !== undefined) updateData['hora']           = dados.hora;
    if (dados.alimentos      !== undefined) updateData['alimentos']      = dados.alimentos as object[];
    if (dados.totalCalorias  !== undefined) updateData['totalCalorias']  = dados.totalCalorias;
    if (dados.totalCarbs     !== undefined) updateData['totalCarbs']     = dados.totalCarbs;
    if (dados.totalProteinas !== undefined) updateData['totalProteinas'] = dados.totalProteinas;
    if (dados.totalGorduras  !== undefined) updateData['totalGorduras']  = dados.totalGorduras;
    if (dados.notas          !== undefined) updateData['notas']          = dados.notas;

    return prisma.refeicao.update({
      where: { id },
      data: updateData,
      include: { usuario: { select: { id: true, nome: true } } },
    });
  },

  async deletar(id: string) {
    return prisma.refeicao.delete({ where: { id } });
  },

  async listarTodos(pagina = 1, limite = 50, tipo?: TipoRefeicao) {
    const offset = (pagina - 1) * limite;
    const where: Record<string, unknown> = {};
    if (tipo) where['tipo'] = tipo;

    const [registros, total] = await Promise.all([
      prisma.refeicao.findMany({
        where,
        skip: offset,
        take: limite,
        include: { usuario: { select: { id: true, nome: true, email: true } } },
        orderBy: [{ data: 'desc' }, { hora: 'desc' }],
      }),
      prisma.refeicao.count({ where }),
    ]);

    return { dados: registros, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  },
};
