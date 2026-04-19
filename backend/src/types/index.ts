export type TipoDiabetes = 'NENHUM' | 'TIPO1' | 'TIPO2' | 'GESTACIONAL' | 'PRE_DIABETES';
export type StatusUsuario = 'ATIVO' | 'INATIVO';
export type Perfil = 'USUARIO' | 'ADMIN';
export type Humor = 'OTIMO' | 'BOM' | 'OK' | 'MAL' | 'PESSIMO';
export type Categoria = 'EXERCICIO' | 'ALIMENTACAO' | 'EMERGENCIA' | 'BEM_ESTAR';
export type QualidadeSono = 'PESSIMA' | 'RUIM' | 'BOA' | 'EXCELENTE';

export interface JwtPayload {
  id: string;
  email: string;
  perfil: Perfil;
}

export interface PaginacaoQuery {
  pagina?: number;
  limite?: number;
}

export interface RespostaPaginada<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}
