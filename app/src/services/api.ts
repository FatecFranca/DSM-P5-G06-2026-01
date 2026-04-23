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

// ─── Metas ────────────────────────────────────────────────────────────────────

export type CategoriaMeta = 'GLICOSE' | 'PESO' | 'EXERCICIO' | 'AGUA' | 'SONO' | 'PASSOS';
export type CategoriaGoal = 'glucose' | 'weight' | 'exercise' | 'water' | 'sleep' | 'steps';

export interface ApiMeta {
  id: string;
  usuarioId: string;
  titulo: string;
  descricao: string;
  alvo: number;
  atual: number;
  unidade: string;
  categoria: CategoriaMeta;
  prazo: string;
  concluida: boolean;
  cor: string;
  criadoEm: string;
  atualizadoEm: string;
}

const CATEGORIA_PARA_GOAL: Record<CategoriaMeta, CategoriaGoal> = {
  GLICOSE:  'glucose',
  PESO:     'weight',
  EXERCICIO:'exercise',
  AGUA:     'water',
  SONO:     'sleep',
  PASSOS:   'steps',
};

const GOAL_PARA_CATEGORIA: Record<CategoriaGoal, CategoriaMeta> = {
  glucose:  'GLICOSE',
  weight:   'PESO',
  exercise: 'EXERCICIO',
  water:    'AGUA',
  sleep:    'SONO',
  steps:    'PASSOS',
};

export function metaParaGoal(m: ApiMeta) {
  return {
    id: m.id,
    title: m.titulo,
    description: m.descricao,
    target: m.alvo,
    current: m.atual,
    unit: m.unidade,
    category: CATEGORIA_PARA_GOAL[m.categoria] ?? 'glucose',
    deadline: m.prazo,
    completed: m.concluida,
    color: m.cor,
  };
}

export async function apiListarMetas(pagina = 1, limite = 100) {
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiMeta> }>(
    `/metas?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

export async function apiCriarMeta(params: {
  title: string;
  description?: string;
  target: number;
  current?: number;
  unit: string;
  category: CategoriaGoal;
  deadline: string;
  color?: string;
}) {
  const res = await apiReq<{ success: boolean; data: ApiMeta }>(
    '/metas',
    {
      method: 'POST',
      body: JSON.stringify({
        titulo: params.title,
        descricao: params.description,
        alvo: params.target,
        atual: params.current,
        unidade: params.unit,
        categoria: GOAL_PARA_CATEGORIA[params.category],
        prazo: params.deadline,
        cor: params.color,
      }),
    }
  );
  return res.data;
}

export async function apiAtualizarMeta(id: string, params: {
  title?: string;
  description?: string;
  target?: number;
  current?: number;
  unit?: string;
  category?: CategoriaGoal;
  deadline?: string;
  completed?: boolean;
  color?: string;
}) {
  const body: Record<string, unknown> = {};
  if (params.title !== undefined) body['titulo'] = params.title;
  if (params.description !== undefined) body['descricao'] = params.description;
  if (params.target !== undefined) body['alvo'] = params.target;
  if (params.current !== undefined) body['atual'] = params.current;
  if (params.unit !== undefined) body['unidade'] = params.unit;
  if (params.category !== undefined) body['categoria'] = GOAL_PARA_CATEGORIA[params.category];
  if (params.deadline !== undefined) body['prazo'] = params.deadline;
  if (params.completed !== undefined) body['concluida'] = params.completed;
  if (params.color !== undefined) body['cor'] = params.color;

  const res = await apiReq<{ success: boolean; data: ApiMeta }>(
    `/metas/${id}`,
    { method: 'PUT', body: JSON.stringify(body) }
  );
  return res.data;
}

export async function apiDeletarMeta(id: string) {
  await apiReq<{ success: boolean }>(`/metas/${id}`, { method: 'DELETE' });
}

// ─── Hidratação ────────────────────────────────────────────────────────────────

export interface ApiHidratacao {
  id: string;
  usuarioId: string;
  data: string;
  hora: string;
  quantidade: number;
  criadoEm: string;
}

export function hidratacaoParaWaterLog(h: ApiHidratacao) {
  return {
    id: h.id,
    date: h.data,
    amount: h.quantidade,
    time: h.hora,
  };
}

export async function apiListarHidratacao(pagina = 1, limite = 100, dataInicio?: string, dataFim?: string) {
  const params = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  if (dataInicio) params.set('dataInicio', dataInicio);
  if (dataFim) params.set('dataFim', dataFim);
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiHidratacao> }>(
    `/hidratacao?${params}`
  );
  return res.data;
}

export async function apiCriarHidratacao(params: { data: string; hora: string; quantidade: number }) {
  const res = await apiReq<{ success: boolean; data: ApiHidratacao }>(
    '/hidratacao',
    { method: 'POST', body: JSON.stringify(params) }
  );
  return res.data;
}

export async function apiAtualizarHidratacao(id: string, params: { data?: string; hora?: string; quantidade?: number }) {
  const res = await apiReq<{ success: boolean; data: ApiHidratacao }>(
    `/hidratacao/${id}`,
    { method: 'PUT', body: JSON.stringify(params) }
  );
  return res.data;
}

export async function apiDeletarHidratacao(id: string) {
  await apiReq<{ success: boolean }>(`/hidratacao/${id}`, { method: 'DELETE' });
}

// ─── Glicose ──────────────────────────────────────────────────────────────────

export type ContextoGlicose = 'JEJUM' | 'PRE_REFEICAO' | 'POS_REFEICAO' | 'ANTES_DORMIR' | 'ALEATORIA';
export type StatusGlicoseApi = 'BAIXO' | 'NORMAL' | 'ALTO' | 'MUITO_ALTO';
type ContextoApp = 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'random';
type StatusApp = 'low' | 'normal' | 'high' | 'very_high';

export interface ApiGlicose {
  id: string;
  usuarioId: string;
  valor: number;
  contexto: ContextoGlicose;
  status: StatusGlicoseApi;
  data: string;
  hora: string;
  notas?: string | null;
  criadoEm: string;
}

const CONTEXTO_PARA_APP: Record<ContextoGlicose, ContextoApp> = {
  JEJUM: 'fasting',
  PRE_REFEICAO: 'before_meal',
  POS_REFEICAO: 'after_meal',
  ANTES_DORMIR: 'bedtime',
  ALEATORIA: 'random',
};

const APP_PARA_CONTEXTO: Record<ContextoApp, ContextoGlicose> = {
  fasting: 'JEJUM',
  before_meal: 'PRE_REFEICAO',
  after_meal: 'POS_REFEICAO',
  bedtime: 'ANTES_DORMIR',
  random: 'ALEATORIA',
};

const STATUS_PARA_APP: Record<StatusGlicoseApi, StatusApp> = {
  BAIXO: 'low',
  NORMAL: 'normal',
  ALTO: 'high',
  MUITO_ALTO: 'very_high',
};

export function glicoseParaReading(g: ApiGlicose) {
  return {
    id: g.id,
    value: g.valor,
    context: CONTEXTO_PARA_APP[g.contexto] ?? 'random',
    status: STATUS_PARA_APP[g.status] ?? 'normal',
    date: g.data,
    time: g.hora,
    notes: g.notas ?? undefined,
  };
}

export async function apiListarGlicose(pagina = 1, limite = 100, dataInicio?: string, dataFim?: string) {
  const params = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  if (dataInicio) params.set('dataInicio', dataInicio);
  if (dataFim) params.set('dataFim', dataFim);
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiGlicose> }>(
    `/glicose?${params}`
  );
  return res.data;
}

export async function apiCriarGlicose(params: {
  valor: number;
  contexto: ContextoApp;
  data: string;
  hora: string;
  notas?: string;
}) {
  const res = await apiReq<{ success: boolean; data: ApiGlicose }>(
    '/glicose',
    {
      method: 'POST',
      body: JSON.stringify({
        valor: params.valor,
        contexto: APP_PARA_CONTEXTO[params.contexto],
        data: params.data,
        hora: params.hora,
        notas: params.notas,
      }),
    }
  );
  return res.data;
}

export async function apiDeletarGlicose(id: string) {
  await apiReq<{ success: boolean }>(`/glicose/${id}`, { method: 'DELETE' });
}

// ─── Medicação ────────────────────────────────────────────────────────────────

export type TipoMedicacaoApi = 'INSULINA' | 'ORAL' | 'SUPLEMENTO' | 'OUTRO';
type TipoApp = 'insulin' | 'oral' | 'supplement' | 'other';

const TIPO_PARA_APP: Record<TipoMedicacaoApi, TipoApp> = {
  INSULINA: 'insulin',
  ORAL: 'oral',
  SUPLEMENTO: 'supplement',
  OUTRO: 'other',
};

const APP_PARA_TIPO: Record<TipoApp, TipoMedicacaoApi> = {
  insulin: 'INSULINA',
  oral: 'ORAL',
  supplement: 'SUPLEMENTO',
  other: 'OUTRO',
};

export interface ApiMedicacao {
  id: string;
  usuarioId: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  horarios: string[];
  tipo: TipoMedicacaoApi;
  notas?: string | null;
  cor: string;
  tomado: boolean;
  ultimaTomada?: string | null;
  criadoEm: string;
}

export function medicacaoParaApp(m: ApiMedicacao) {
  return {
    id: m.id,
    name: m.nome,
    dosage: m.dosagem,
    frequency: m.frequencia,
    times: m.horarios,
    type: TIPO_PARA_APP[m.tipo] ?? 'other',
    notes: m.notas ?? undefined,
    color: m.cor,
    taken: m.tomado,
    lastTaken: m.ultimaTomada ?? undefined,
  };
}

export async function apiListarMedicacao(pagina = 1, limite = 100) {
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiMedicacao> }>(
    `/medicacao?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

export async function apiCriarMedicacao(params: {
  nome: string; dosagem: string; frequencia: string;
  horarios: string[]; tipo: TipoApp; notas?: string; cor?: string;
}) {
  const res = await apiReq<{ success: boolean; data: ApiMedicacao }>(
    '/medicacao',
    { method: 'POST', body: JSON.stringify({ ...params, tipo: APP_PARA_TIPO[params.tipo] }) }
  );
  return res.data;
}

export async function apiAtualizarMedicacao(id: string, params: {
  nome?: string; dosagem?: string; frequencia?: string; horarios?: string[];
  tipo?: TipoApp; notas?: string; cor?: string; tomado?: boolean; ultimaTomada?: string | null;
}) {
  const body = { ...params };
  if (params.tipo) (body as any).tipo = APP_PARA_TIPO[params.tipo];
  const res = await apiReq<{ success: boolean; data: ApiMedicacao }>(
    `/medicacao/${id}`,
    { method: 'PUT', body: JSON.stringify(body) }
  );
  return res.data;
}

export async function apiDeletarMedicacao(id: string) {
  await apiReq<{ success: boolean }>(`/medicacao/${id}`, { method: 'DELETE' });
}
