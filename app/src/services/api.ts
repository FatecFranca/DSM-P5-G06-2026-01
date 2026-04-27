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

// ─── Diabetes type mapping ────────────────────────────────────────────────────

export type TipoDiabetesApi = 'NENHUM' | 'TIPO1' | 'TIPO2' | 'GESTACIONAL' | 'PRE_DIABETES';
export type TipoDiabetesApp = 'none' | 'type1' | 'type2' | 'gestational' | 'prediabetes';

const TIPO_PARA_APP: Record<TipoDiabetesApi, TipoDiabetesApp> = {
  NENHUM:       'none',
  TIPO1:        'type1',
  TIPO2:        'type2',
  GESTACIONAL:  'gestational',
  PRE_DIABETES: 'prediabetes',
};

const APP_PARA_TIPO_DIABETES: Record<TipoDiabetesApp, TipoDiabetesApi> = {
  none:        'NENHUM',
  type1:       'TIPO1',
  type2:       'TIPO2',
  gestational: 'GESTACIONAL',
  prediabetes: 'PRE_DIABETES',
};

export function usuarioParaUser(u: ApiUsuario) {
  return {
    id:               u.id,
    name:             u.nome,
    email:            u.email,
    age:              u.idade ?? 0,
    weight:           u.peso ?? 0,
    height:           u.altura ?? 0,
    diabetesType:     (u.tipoDiabetes ? (TIPO_PARA_APP[u.tipoDiabetes as TipoDiabetesApi] ?? 'none') : 'none') as TipoDiabetesApp,
    targetGlucoseMin: u.glicoseAlvoMin ?? 70,
    targetGlucoseMax: u.glicoseAlvoMax ?? 140,
    doctorName:       u.nomeMedico ?? undefined,
    lastCheckup:      u.ultimaConsulta ?? undefined,
  };
}

// ─── Token ────────────────────────────────────────────────────────────────────

let _token: string | null = null;
let _onUnauthorized: (() => void) | null = null;

export function setApiToken(token: string | null) {
  _token = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  _onUnauthorized = handler;
}

// ─── Core ─────────────────────────────────────────────────────────────────────

const SESSION_INVALID_MESSAGES = [
  'Sessão inválida. Faça login novamente.',
  'Token inválido ou expirado',
  'Token de autenticação não fornecido',
];

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
    const msg: string = json.message ?? `Erro ${res.status}`;
    if (res.status === 401 || SESSION_INVALID_MESSAGES.includes(msg)) {
      _onUnauthorized?.();
    }
    throw new Error(msg);
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

// ─── Perfil ───────────────────────────────────────────────────────────────────

export async function apiGetPerfil(id: string) {
  const res = await apiReq<{ success: boolean; data: ApiUsuario }>(`/usuarios/${id}`);
  return res.data;
}

export async function apiAtualizarPerfil(id: string, params: {
  nome?: string;
  idade?: number;
  peso?: number;
  altura?: number;
  diabetesType?: TipoDiabetesApp;
  targetGlucoseMin?: number;
  targetGlucoseMax?: number;
  doctorName?: string;
  lastCheckup?: string;
}) {
  const body: Record<string, unknown> = {};
  if (params.nome !== undefined)             body['nome'] = params.nome;
  if (params.idade !== undefined)            body['idade'] = params.idade;
  if (params.peso !== undefined)             body['peso'] = params.peso;
  if (params.altura !== undefined)           body['altura'] = params.altura;
  if (params.diabetesType !== undefined)     body['tipoDiabetes'] = APP_PARA_TIPO_DIABETES[params.diabetesType];
  if (params.targetGlucoseMin !== undefined) body['glicoseAlvoMin'] = params.targetGlucoseMin;
  if (params.targetGlucoseMax !== undefined) body['glicoseAlvoMax'] = params.targetGlucoseMax;
  if (params.doctorName !== undefined)       body['nomeMedico'] = params.doctorName;
  if (params.lastCheckup !== undefined)      body['ultimaConsulta'] = params.lastCheckup;
  const res = await apiReq<{ success: boolean; data: ApiUsuario }>(
    `/usuarios/${id}`,
    { method: 'PUT', body: JSON.stringify(body) }
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

// ─── Refeição ─────────────────────────────────────────────────────────────────

export type TipoRefeicaoApi   = 'CAFE_MANHA' | 'ALMOCO' | 'JANTAR' | 'LANCHE';
export type MealTypeApp       = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type CategoriaAlimento = 'bom' | 'moderado' | 'ruim';
export type FoodCategoryApp   = 'good' | 'moderate' | 'bad';

const TIPO_PARA_MEAL: Record<TipoRefeicaoApi, MealTypeApp> = {
  CAFE_MANHA: 'breakfast',
  ALMOCO:     'lunch',
  JANTAR:     'dinner',
  LANCHE:     'snack',
};

const MEAL_PARA_TIPO: Record<MealTypeApp, TipoRefeicaoApi> = {
  breakfast: 'CAFE_MANHA',
  lunch:     'ALMOCO',
  dinner:    'JANTAR',
  snack:     'LANCHE',
};

const CAT_PARA_FOOD: Record<CategoriaAlimento, FoodCategoryApp> = {
  bom:      'good',
  moderado: 'moderate',
  ruim:     'bad',
};

const FOOD_PARA_CAT: Record<FoodCategoryApp, CategoriaAlimento> = {
  good:     'bom',
  moderate: 'moderado',
  bad:      'ruim',
};

export interface ApiAlimento {
  id: string;
  nome: string;
  marca?: string;
  calorias: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
  categoria: CategoriaAlimento;
  porcao: string;
  fatsecretId?: string;
  indiceGlicemico?: number;
}

export interface ApiRefeicao {
  id: string;
  usuarioId: string;
  tipo: TipoRefeicaoApi;
  data: string;
  hora: string;
  alimentos: ApiAlimento[];
  totalCalorias: number;
  totalCarbs: number;
  totalProteinas: number;
  totalGorduras: number;
  notas?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export function refeicaoParaMeal(r: ApiRefeicao) {
  return {
    id:           r.id,
    type:         TIPO_PARA_MEAL[r.tipo],
    date:         r.data,
    time:         r.hora,
    foods: (r.alimentos as ApiAlimento[]).map(a => ({
      id:           a.id,
      name:         a.nome,
      calories:     a.calorias,
      carbs:        a.carboidratos,
      protein:      a.proteinas,
      fat:          a.gorduras,
      category:     (CAT_PARA_FOOD[a.categoria] ?? 'moderate') as FoodCategoryApp,
      portion:      a.porcao,
      glycemicIndex: a.indiceGlicemico,
    })),
    totalCalories: r.totalCalorias,
    totalCarbs:    r.totalCarbs,
    notes:         r.notas ?? undefined,
  };
}

export async function apiListarRefeicoes(pagina = 1, limite = 100, data?: string, tipo?: TipoRefeicaoApi) {
  const params = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  if (data) params.set('data', data);
  if (tipo) params.set('tipo', tipo);
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiRefeicao> }>(
    `/refeicao?${params}`,
  );
  return res.data;
}

export async function apiCriarRefeicao(params: {
  tipo: MealTypeApp;
  data: string;
  hora: string;
  alimentos: Array<{
    id: string; name: string; calories: number; carbs: number;
    protein: number; fat: number; category: FoodCategoryApp; portion: string;
    glycemicIndex?: number;
  }>;
  totalCalorias: number;
  totalCarbs: number;
  totalProteinas: number;
  totalGorduras: number;
  notas?: string;
}) {
  const body = {
    tipo:      MEAL_PARA_TIPO[params.tipo],
    data:      params.data,
    hora:      params.hora,
    alimentos: params.alimentos.map(f => ({
      id:           f.id,
      nome:         f.name,
      calorias:     f.calories,
      carboidratos: f.carbs,
      proteinas:    f.protein,
      gorduras:     f.fat,
      categoria:    FOOD_PARA_CAT[f.category],
      porcao:       f.portion,
      indiceGlicemico: f.glycemicIndex,
    })),
    totalCalorias:  params.totalCalorias,
    totalCarbs:     params.totalCarbs,
    totalProteinas: params.totalProteinas,
    totalGorduras:  params.totalGorduras,
    notas:          params.notas,
  };
  const res = await apiReq<{ success: boolean; data: ApiRefeicao }>(
    '/refeicao',
    { method: 'POST', body: JSON.stringify(body) },
  );
  return res.data;
}

export async function apiDeletarRefeicao(id: string) {
  await apiReq<{ success: boolean }>(`/refeicao/${id}`, { method: 'DELETE' });
}

// ─── Diário ───────────────────────────────────────────────────────────────────

export type HumorApi = 'OTIMO' | 'BOM' | 'OK' | 'MAL' | 'PESSIMO';
export type HumorApp = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

const HUMOR_PARA_APP: Record<HumorApi, HumorApp> = {
  OTIMO:   'great',
  BOM:     'good',
  OK:      'okay',
  MAL:     'bad',
  PESSIMO: 'terrible',
};

const APP_PARA_HUMOR: Record<HumorApp, HumorApi> = {
  great:    'OTIMO',
  good:     'BOM',
  okay:     'OK',
  bad:      'MAL',
  terrible: 'PESSIMO',
};

export interface ApiDiario {
  id: string;
  usuarioId: string;
  titulo: string;
  conteudo: string;
  humor: HumorApi;
  sintomas: string[];
  tags: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export function diarioParaEntry(d: ApiDiario) {
  const dt = new Date(d.criadoEm);
  return {
    id:       d.id,
    date:     d.criadoEm.split('T')[0],
    time:     dt.toTimeString().slice(0, 5),
    title:    d.titulo,
    content:  d.conteudo,
    mood:     HUMOR_PARA_APP[d.humor] ?? 'okay',
    symptoms: d.sintomas,
    tags:     d.tags,
  };
}

export async function apiListarDiarios(pagina = 1, limite = 100) {
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiDiario> }>(
    `/diarios?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

export async function apiCriarDiario(params: {
  titulo: string;
  conteudo: string;
  humor: HumorApp;
  sintomas?: string[];
  tags?: string[];
}) {
  const res = await apiReq<{ success: boolean; data: ApiDiario }>(
    '/diarios',
    {
      method: 'POST',
      body: JSON.stringify({
        titulo:   params.titulo,
        conteudo: params.conteudo,
        humor:    APP_PARA_HUMOR[params.humor],
        sintomas: params.sintomas,
        tags:     params.tags,
      }),
    }
  );
  return res.data;
}

export async function apiDeletarDiario(id: string) {
  await apiReq<{ success: boolean }>(`/diarios/${id}`, { method: 'DELETE' });
}

export async function apiBuscarAlimentos(query: string, pagina = 0, max = 20) {
  const params = new URLSearchParams({ q: query, pagina: String(pagina), max: String(max) });
  const res = await apiReq<{ success: boolean; data: { alimentos: ApiAlimento[]; total: number } }>(
    `/refeicao/buscar-alimento?${params}`,
  );
  return res.data;
}

// ─── Notificações ─────────────────────────────────────────────────────────────

export type TipoNotificacaoApi = 'GLICOSE' | 'REFEICAO' | 'MEDICAMENTO' | 'CONSULTA' | 'DICA' | 'META';
export type TipoNotificacaoApp = 'glucose' | 'meal' | 'medication' | 'appointment' | 'tip' | 'goal';

const TIPO_NOTIF_PARA_APP: Record<TipoNotificacaoApi, TipoNotificacaoApp> = {
  GLICOSE:     'glucose',
  REFEICAO:    'meal',
  MEDICAMENTO: 'medication',
  CONSULTA:    'appointment',
  DICA:        'tip',
  META:        'goal',
};

export interface ApiNotificacao {
  id: string;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacaoApi;
  data: string;
  hora: string;
  lida: boolean;
  criadoEm: string;
}

export function notificacaoParaNotification(n: ApiNotificacao) {
  return {
    id:      n.id,
    title:   n.titulo,
    message: n.mensagem,
    type:    TIPO_NOTIF_PARA_APP[n.tipo] ?? 'tip',
    date:    n.data,
    time:    n.hora,
    read:    n.lida,
  };
}

export async function apiListarNotificacoes(pagina = 1, limite = 100) {
  const res = await apiReq<{ success: boolean; data: { dados: ApiNotificacao[]; total: number; naoLidas: number; pagina: number; limite: number; totalPaginas: number } }>(
    `/notificacoes?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

export async function apiMarcarNotificacaoLida(id: string) {
  await apiReq<{ success: boolean }>(`/notificacoes/${id}/ler`, { method: 'PATCH' });
}

export async function apiMarcarTodasNotificacoesLidas() {
  await apiReq<{ success: boolean }>('/notificacoes/ler-todas', { method: 'PATCH' });
}
