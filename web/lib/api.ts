// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'USUARIO' | 'ADMIN';
  status: 'ATIVO' | 'INATIVO';
  tipoDiabetes: 'NENHUM' | 'TIPO1' | 'TIPO2' | 'GESTACIONAL' | 'PRE_DIABETES';
  idade?: number;
  peso?: number;
  altura?: number;
  glicoseAlvoMin?: number;
  glicoseAlvoMax?: number;
  nomeMedico?: string;
  ultimaConsulta?: string;
  criadoEm: string;
  atualizadoEm: string;
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

export interface ApiDiario {
  id: string;
  usuarioId: string;
  titulo: string;
  conteudo: string;
  humor: 'OTIMO' | 'BOM' | 'OK' | 'MAL' | 'PESSIMO';
  sintomas: string[];
  tags: string[];
  criadoEm: string;
  atualizadoEm: string;
  usuario?: { nome: string; email: string };
}

export interface ApiPaginado<T> {
  dados: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ─── Category / humor mappings ─────────────────────────────────────────────────

export const CATEGORIA_LABEL: Record<string, string> = {
  EXERCICIO: 'Exercício',
  ALIMENTACAO: 'Alimentação',
  EMERGENCIA: 'Emergência',
  BEM_ESTAR: 'Bem-estar',
};

export const LABEL_CATEGORIA: Record<string, string> = {
  'Exercício': 'EXERCICIO',
  'Alimentação': 'ALIMENTACAO',
  'Emergência': 'EMERGENCIA',
  'Bem-estar': 'BEM_ESTAR',
};

export const HUMOR_LABEL: Record<string, string> = {
  OTIMO: 'great',
  BOM: 'good',
  OK: 'okay',
  MAL: 'bad',
  PESSIMO: 'terrible',
};

export const TIPO_DIABETES_LABEL: Record<string, string> = {
  NENHUM: 'none',
  TIPO1: 'type1',
  TIPO2: 'type2',
  GESTACIONAL: 'gestational',
  PRE_DIABETES: 'prediabetes',
};

// ─── Token helpers ────────────────────────────────────────────────────────────

export const TOKEN_KEY = 'diabecontrol_admin_token';
export const USER_KEY = 'diabecontrol_admin_user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(token: string, usuario: ApiUsuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getSavedUser(): ApiUsuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function apiReq<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const t = token ?? getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (t) headers['Authorization'] = `Bearer ${t}`;

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

export async function webLogin(email: string, senha: string) {
  const res = await apiReq<{ success: boolean; data: { token: string; usuario: ApiUsuario } }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, senha }) }
  );
  return res.data;
}

// ─── Admin: Usuários ──────────────────────────────────────────────────────────

export async function webListarUsuarios(pagina = 1, limite = 100) {
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiUsuario> }>(
    `/admin/usuarios?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

// ─── Admin: Diários ───────────────────────────────────────────────────────────

export async function webListarDiarios(pagina = 1, limite = 100, humor?: string) {
  const q = humor ? `&humor=${humor}` : '';
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiDiario> }>(
    `/admin/diarios?pagina=${pagina}&limite=${limite}${q}`
  );
  return res.data;
}

// ─── Dicas ────────────────────────────────────────────────────────────────────

export async function webListarDicas(pagina = 1, limite = 100) {
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiDica> }>(
    `/dicas?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

export async function webCriarDica(payload: {
  titulo: string;
  sumario: string;
  conteudo: string;
  categoria: string;
  tempoLeitura: number;
  destaque: boolean;
}) {
  const res = await apiReq<{ success: boolean; data: ApiDica }>(
    '/dicas',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function webAtualizarDica(id: string, payload: Partial<{
  titulo: string;
  sumario: string;
  conteudo: string;
  categoria: string;
  tempoLeitura: number;
  destaque: boolean;
}>) {
  const res = await apiReq<{ success: boolean; data: ApiDica }>(
    `/dicas/${id}`,
    { method: 'PUT', body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function webDeletarDica(id: string) {
  await apiReq<{ success: boolean }>(
    `/dicas/${id}`,
    { method: 'DELETE' }
  );
}

// ─── Admin: Sono ─────────────────────────────────────────────────────────────

export type QualidadeSono = 'PESSIMA' | 'RUIM' | 'BOA' | 'EXCELENTE';

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
  usuario?: { id: string; nome: string; email: string };
}

export const QUALIDADE_SONO_MAP: Record<QualidadeSono, 'excellent' | 'good' | 'fair' | 'poor'> = {
  EXCELENTE: 'excellent',
  BOA: 'good',
  RUIM: 'fair',
  PESSIMA: 'poor',
};

export async function webListarSono(pagina = 1, limite = 100, qualidade?: QualidadeSono) {
  const q = qualidade ? `&qualidade=${qualidade}` : '';
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiSono> }>(
    `/admin/sono?pagina=${pagina}&limite=${limite}${q}`
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

export async function webListarFaq(todos = true) {
  const res = await apiReq<{ success: boolean; data: ApiFAQ[] }>(
    `/faq?todos=${todos}`
  );
  return res.data;
}

export async function webCriarFaq(payload: {
  pergunta: string;
  resposta: string;
  categoria: CategoriaFAQ;
  ordem?: number;
  ativo?: boolean;
}) {
  const res = await apiReq<{ success: boolean; data: ApiFAQ }>(
    '/faq',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function webAtualizarFaq(id: string, payload: Partial<{
  pergunta: string;
  resposta: string;
  categoria: CategoriaFAQ;
  ordem: number;
  ativo: boolean;
}>) {
  const res = await apiReq<{ success: boolean; data: ApiFAQ }>(
    `/faq/${id}`,
    { method: 'PUT', body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function webDeletarFaq(id: string) {
  await apiReq<{ success: boolean }>(
    `/faq/${id}`,
    { method: 'DELETE' }
  );
}

// ─── Metas ────────────────────────────────────────────────────────────────────

export type CategoriaMeta = 'GLICOSE' | 'PESO' | 'EXERCICIO' | 'AGUA' | 'SONO' | 'PASSOS';

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
  usuario?: { id: string; nome: string; email: string };
}

export const CATEGORIA_META_LABEL: Record<CategoriaMeta, string> = {
  GLICOSE:  'Glicose',
  PESO:     'Peso',
  EXERCICIO:'Exercício',
  AGUA:     'Água',
  SONO:     'Sono',
  PASSOS:   'Passos',
};

export async function webListarMetas(pagina = 1, limite = 100, categoria?: CategoriaMeta, concluida?: boolean) {
  const params = new URLSearchParams({ pagina: String(pagina), limite: String(limite) });
  if (categoria) params.set('categoria', categoria);
  if (concluida !== undefined) params.set('concluida', String(concluida));
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiMeta> }>(
    `/admin/metas?${params}`
  );
  return res.data;
}

export async function webCriarMeta(payload: {
  titulo: string;
  descricao?: string;
  alvo: number;
  atual?: number;
  unidade: string;
  categoria: CategoriaMeta;
  prazo: string;
  concluida?: boolean;
  cor?: string;
}) {
  const res = await apiReq<{ success: boolean; data: ApiMeta }>(
    '/metas',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function webAtualizarMeta(id: string, payload: Partial<{
  titulo: string;
  descricao: string;
  alvo: number;
  atual: number;
  unidade: string;
  categoria: CategoriaMeta;
  prazo: string;
  concluida: boolean;
  cor: string;
}>) {
  const res = await apiReq<{ success: boolean; data: ApiMeta }>(
    `/metas/${id}`,
    { method: 'PUT', body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function webDeletarMeta(id: string) {
  await apiReq<{ success: boolean }>(
    `/metas/${id}`,
    { method: 'DELETE' }
  );
}

// ─── Hidratação ────────────────────────────────────────────────────────────────

export interface ApiHidratacao {
  id: string;
  usuarioId: string;
  data: string;
  hora: string;
  quantidade: number;
  criadoEm: string;
  usuario?: { id: string; nome: string; email: string };
}

export async function webListarHidratacao(pagina = 1, limite = 200) {
  const res = await apiReq<{ success: boolean; data: ApiPaginado<ApiHidratacao> }>(
    `/admin/hidratacao?pagina=${pagina}&limite=${limite}`
  );
  return res.data;
}

export async function webCriarHidratacao(payload: { data: string; hora: string; quantidade: number }) {
  const res = await apiReq<{ success: boolean; data: ApiHidratacao }>(
    '/hidratacao',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function webAtualizarHidratacao(id: string, payload: Partial<{ data: string; hora: string; quantidade: number }>) {
  const res = await apiReq<{ success: boolean; data: ApiHidratacao }>(
    `/hidratacao/${id}`,
    { method: 'PUT', body: JSON.stringify(payload) }
  );
  return res.data;
}

export async function webDeletarHidratacao(id: string) {
  await apiReq<{ success: boolean }>(
    `/hidratacao/${id}`,
    { method: 'DELETE' }
  );
}
