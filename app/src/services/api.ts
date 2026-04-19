// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000/api';

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'USUARIO' | 'ADMIN';
  status: 'ATIVO' | 'INATIVO';
  tipoDiabetes?: string;
  idade?: number;
  peso?: number;
  altura?: number;
  glicoseAlvoMin?: number;
  glicoseAlvoMax?: number;
  nomeMedico?: string;
  ultimaConsulta?: string;
  criadoEm: string;
}

export interface ApiDica {
  id: string;
  titulo: string;
  sumario: string;
  conteudo: string;
  categoria: 'EXERCICIO' | 'ALIMENTACAO' | 'EMERGENCIA' | 'BEM_ESTAR';
  tempoLeitura: number;
  destaque: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ApiPaginado<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ─── Category mapping ─────────────────────────────────────────────────────────

export const CATEGORIA_LABEL: Record<string, string> = {
  EXERCICIO: 'Exercício',
  ALIMENTACAO: 'Alimentação',
  EMERGENCIA: 'Emergência',
  BEM_ESTAR: 'Bem-estar',
};

export function dicaParaTip(dica: ApiDica) {
  return {
    id: dica.id,
    title: dica.titulo,
    summary: dica.sumario,
    content: dica.conteudo,
    category: CATEGORIA_LABEL[dica.categoria] ?? dica.categoria,
    readTime: dica.tempoLeitura,
    featured: dica.destaque,
    date: dica.criadoEm.split('T')[0],
  };
}

// ─── Token ────────────────────────────────────────────────────────────────────

let _token: string | null = null;

export function setApiToken(token: string | null) {
  _token = token;
}

// ─── Core ─────────────────────────────────────────────────────────────────────

async function apiReq<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (_token) {
    headers['Authorization'] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message ?? `Erro ${res.status}`);
  }
  return json as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, senha: string) {
  const res = await apiReq<{ success: boolean; data: { token: string; usuario: ApiUsuario } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, senha }) }
  );
  return res.data;
}

export async function apiRegistrar(nome: string, email: string, senha: string) {
  const res = await apiReq<{ success: boolean; data: { token: string; usuario: ApiUsuario } }>(
    '/auth/registrar',
    { method: 'POST', body: JSON.stringify({ nome, email, senha }) }
  );
  return res.data;
}

// ─── Dicas ────────────────────────────────────────────────────────────────────

export async function apiListarDicas(pagina = 1, limite = 50) {
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiDica> }>(
    `/dicas?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export type CategoriaFAQ =
  | 'DIABETES'
  | 'SINTOMAS'
  | 'ALIMENTACAO'
  | 'EXERCICIOS'
  | 'MEDICACAO'
  | 'MONITORAMENTO';

export interface ApiFAQ {
  id: string;
  pergunta: string;
  resposta: string;
  categoria: CategoriaFAQ;
  ordem: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export const CATEGORIA_FAQ_LABEL: Record<CategoriaFAQ, string> = {
  DIABETES:      'O que é Diabetes?',
  SINTOMAS:      'Sintomas',
  ALIMENTACAO:   'Alimentação',
  EXERCICIOS:    'Exercícios',
  MEDICACAO:     'Medicação e Tratamento',
  MONITORAMENTO: 'Monitoramento',
};

export const CATEGORIA_FAQ_COLOR: Record<CategoriaFAQ, string> = {
  DIABETES:      '#4CAF82',
  SINTOMAS:      '#3B8ED0',
  ALIMENTACAO:   '#F97316',
  EXERCICIOS:    '#8B5CF6',
  MEDICACAO:     '#EC4899',
  MONITORAMENTO: '#14B8A6',
};

export async function apiListarFaq() {
  const res = await apiReq<{ success: boolean; data: ApiFAQ[] }>('/faq');
  return res.data;
}

// ─── Sono ─────────────────────────────────────────────────────────────────────

export type QualidadeSono = 'PESSIMA' | 'RUIM' | 'BOA' | 'EXCELENTE';
export type QualidadeApp = 'poor' | 'fair' | 'good' | 'excellent';

export interface ApiSono {
  id: string;
  usuarioId: string;
  data: string;
  horaDeitar: string;
  horaAcordar: string;
  duracao: number;
  qualidade: QualidadeSono;
  notas?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

const QUALIDADE_PARA_APP: Record<QualidadeSono, QualidadeApp> = {
  EXCELENTE: 'excellent',
  BOA: 'good',
  RUIM: 'fair',
  PESSIMA: 'poor',
};

const QUALIDADE_PARA_API: Record<QualidadeApp, QualidadeSono> = {
  excellent: 'EXCELENTE',
  good: 'BOA',
  fair: 'RUIM',
  poor: 'PESSIMA',
};

export function sonoParaEntry(sono: ApiSono) {
  return {
    id: sono.id,
    date: sono.data,
    bedtime: sono.horaDeitar,
    wakeTime: sono.horaAcordar,
    duration: sono.duracao,
    quality: QUALIDADE_PARA_APP[sono.qualidade],
    notes: sono.notas ?? undefined,
  };
}

export async function apiListarSono(pagina = 1, limite = 100) {
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiSono> }>(
    `/sono?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

export async function apiCriarSono(params: {
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: QualidadeApp;
  notes?: string;
}) {
  const res = await apiReq<{ success: boolean; data: ApiSono }>(
    '/sono',
    {
      method: 'POST',
      body: JSON.stringify({
        data: params.date,
        horaDeitar: params.bedtime,
        horaAcordar: params.wakeTime,
        duracao: params.duration,
        qualidade: QUALIDADE_PARA_API[params.quality],
        notas: params.notes,
      }),
    }
  );
  return res.data;
}

export async function apiAtualizarSono(id: string, params: {
  date?: string;
  bedtime?: string;
  wakeTime?: string;
  duration?: number;
  quality?: QualidadeApp;
  notes?: string;
}) {
  const body: Record<string, unknown> = {};
  if (params.date !== undefined) body['data'] = params.date;
  if (params.bedtime !== undefined) body['horaDeitar'] = params.bedtime;
  if (params.wakeTime !== undefined) body['horaAcordar'] = params.wakeTime;
  if (params.duration !== undefined) body['duracao'] = params.duration;
  if (params.quality !== undefined) body['qualidade'] = QUALIDADE_PARA_API[params.quality];
  if (params.notes !== undefined) body['notas'] = params.notes;
  const res = await apiReq<{ success: boolean; data: ApiSono }>(
    `/sono/${id}`,
    { method: 'PUT', body: JSON.stringify(body) }
  );
  return res.data;
}

export async function apiDeletarSono(id: string) {
  await apiReq<{ success: boolean }>(`/sono/${id}`, { method: 'DELETE' });
}
