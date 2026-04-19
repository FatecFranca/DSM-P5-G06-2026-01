import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] as string;

export function generateToken(payload: { id: string; email: string; perfil: 'USUARIO' | 'ADMIN' }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export const mockUser = {
  id: 'user-id-1',
  nome: 'Test User',
  email: 'test@example.com',
  senha: '$2a$12$hashedpassword',
  perfil: 'USUARIO' as const,
  status: 'ATIVO' as const,
  tipoDiabetes: null,
  idade: null,
  peso: null,
  altura: null,
  glicoseAlvoMin: null,
  glicoseAlvoMax: null,
  nomeMedico: null,
  ultimaConsulta: null,
  criadoEm: new Date('2026-01-01'),
  atualizadoEm: new Date('2026-01-01'),
};

export const mockAdmin = {
  ...mockUser,
  id: 'admin-id-1',
  email: 'admin@example.com',
  perfil: 'ADMIN' as const,
};

export const mockSono = {
  id: 'sono-id-1',
  usuarioId: 'user-id-1',
  data: '2026-04-19',
  horaDeitar: '22:30',
  horaAcordar: '06:30',
  duracao: 8,
  qualidade: 'BOA' as const,
  notas: null,
  criadoEm: new Date('2026-04-19'),
  atualizadoEm: new Date('2026-04-19'),
  usuario: { id: 'user-id-1', nome: 'Test User' },
};

export const mockDiario = {
  id: 'diario-id-1',
  usuarioId: 'user-id-1',
  titulo: 'Test Entry',
  conteudo: 'Test content',
  humor: 'BOM' as const,
  sintomas: [],
  tags: [],
  criadoEm: new Date('2026-04-19'),
  atualizadoEm: new Date('2026-04-19'),
  usuario: { id: 'user-id-1', nome: 'Test User' },
};

export const mockDica = {
  id: 'dica-id-1',
  titulo: 'Test Tip',
  sumario: 'Test summary',
  conteudo: 'Test content',
  categoria: 'EXERCICIO' as const,
  tempoLeitura: 3,
  destaque: false,
  criadoEm: new Date('2026-04-19'),
  atualizadoEm: new Date('2026-04-19'),
};

export const mockFAQ = {
  id: 'faq-id-1',
  pergunta: 'What is diabetes?',
  resposta: 'Diabetes is...',
  categoria: 'DIABETES' as const,
  ordem: 1,
  ativo: true,
  criadoEm: new Date('2026-04-19'),
  atualizadoEm: new Date('2026-04-19'),
};

export function paginated<T>(dados: T[]) {
  return {
    dados,
    total: dados.length,
    pagina: 1,
    limite: 20,
    totalPaginas: 1,
  };
}
