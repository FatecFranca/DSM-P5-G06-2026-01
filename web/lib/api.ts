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
