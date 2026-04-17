import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

console.log('🔄 Conectando ao banco de dados...')

;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // ─── Admin ──────────────────────────────────────────────────────────────────

  const senhaHash = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@diabecontrol.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@diabecontrol.com',
      senha: senhaHash,
      perfil: 'ADMIN',
      status: 'ATIVO',
    },
  });

  console.log(`✅ Admin criado: ${admin.email} | senha: admin123`);

  // ─── Dicas ──────────────────────────────────────────────────────────────────

  const dicas = [
    {
      titulo: 'Como o exercício afeta sua glicose',
      sumario: 'Entenda por que a atividade física é essencial no controle do diabetes',
      conteudo: `## Exercício e Diabetes

A atividade física é uma das ferramentas mais poderosas no controle do diabetes.

## Por que o exercício ajuda?

Durante o exercício, os músculos consomem glicose como combustível, o que naturalmente reduz os níveis de açúcar no sangue.

### Benefícios comprovados

• Redução da resistência à insulina
• Melhora da sensibilidade das células à glicose
• Controle do peso corporal
• Redução do risco cardiovascular

## Tipos de exercício recomendados

### Aeróbico (cardio)
1. Caminhada (30 min, 5x por semana)
2. Natação
3. Ciclismo
4. Dança

### Resistência (musculação)
• 2 a 3 vezes por semana
• Fortalece músculos que consomem mais glicose

**Importante:** sempre meça a glicose antes e após o exercício. Se estiver abaixo de 100 mg/dL, faça um lanche antes de começar.`,
      categoria: 'EXERCICIO' as const,
      tempoLeitura: 4,
      destaque: true,
    },
    {
      titulo: 'Índice Glicêmico: guia completo',
      sumario: 'Saiba quais alimentos causam picos de glicose e como evitá-los',
      conteudo: `## Índice Glicêmico

O índice glicêmico (IG) mede a velocidade com que um alimento eleva a glicose sanguínea.

## Classificação

• **Baixo IG (até 55):** pão integral, aveia, lentilha, maçã
• **Médio IG (56–69):** arroz branco, beterraba, mel
• **Alto IG (70+):** pão branco, batata, refrigerante

## Como usar na prática

1. Prefira carboidratos de baixo IG
2. Combine alimentos com proteínas e gorduras boas para reduzir o IG da refeição
3. Evite alimentos ultraprocessados

**Dica:** uma salada antes da refeição reduz o IG médio da refeição em até 20%.`,
      categoria: 'ALIMENTACAO' as const,
      tempoLeitura: 3,
      destaque: true,
    },
    {
      titulo: 'Hipoglicemia: reconheça e aja rápido',
      sumario: 'Aprenda a identificar e tratar a queda perigosa de glicose',
      conteudo: `## O que é Hipoglicemia?

Hipoglicemia é quando a glicose cai abaixo de **70 mg/dL**. Pode ser perigosa se não tratada.

## Sintomas

• Tremores e suor frio
• Tontura e confusão mental
• Palpitações
• Fome súbita
• Visão turva

## O que fazer?

1. **Leve:** tome 15g de carboidrato rápido (1 copo de suco, 3 balas)
2. **Aguarde 15 minutos** e meça novamente
3. **Se persistir:** repita o passo 1
4. **Grave/inconsciente:** ligue 192 (SAMU) imediatamente

## Prevenção

• Nunca pule refeições
• Carregue sempre balas ou suco na bolsa
• Avise pessoas próximas sobre a condição`,
      categoria: 'EMERGENCIA' as const,
      tempoLeitura: 3,
      destaque: false,
    },
    {
      titulo: 'Sono e diabetes: a conexão oculta',
      sumario: 'Como a qualidade do sono impacta diretamente o controle glicêmico',
      conteudo: `## Sono e Diabetes

A falta de sono pode aumentar a **resistência à insulina em até 40%** em apenas uma semana.

## Por que o sono importa?

Durante o sono, o corpo regula hormônios como cortisol e insulina. Noites ruins aumentam o cortisol, que eleva a glicose.

## Quanto dormir?

• Adultos: **7 a 9 horas** por noite
• Qualidade importa tanto quanto quantidade

## Dicas para dormir melhor

1. Mantenha horário regular para dormir e acordar
2. Evite telas 1h antes de dormir
3. Quarto escuro e fresco (18–22°C)
4. Evite cafeína após as 14h
5. Meça a glicose antes de dormir: o ideal é entre 100–140 mg/dL`,
      categoria: 'BEM_ESTAR' as const,
      tempoLeitura: 3,
      destaque: false,
    },
    {
      titulo: 'Estresse eleva a glicose: entenda por quê',
      sumario: 'Por que momentos de estresse fazem a glicemia disparar',
      conteudo: `## Estresse e Glicemia

O estresse libera hormônios como **cortisol** e **adrenalina** que elevam a glicose diretamente.

## O ciclo vicioso

Estresse → cortisol alto → glicose sobe → preocupação com diabetes → mais estresse.

## Técnicas de manejo

• **Respiração 4-7-8:** inspire 4s, segure 7s, expire 8s
• **Meditação:** 10 min por dia já fazem diferença
• **Exercício:** reduz cortisol naturalmente
• **Sono:** fundamental para regular o cortisol

## Estresse e insulina

O cortisol bloqueia a ação da insulina temporariamente. Por isso é normal ver glicose alta em dias difíceis mesmo sem comer errado.

**Lembre-se:** cuidar da saúde mental é parte do tratamento do diabetes.`,
      categoria: 'BEM_ESTAR' as const,
      tempoLeitura: 3,
      destaque: false,
    },
    {
      titulo: 'Álcool e diabetes: o que saber',
      sumario: 'O que você precisa saber antes de consumir bebidas alcoólicas',
      conteudo: `## Álcool e Diabetes

O álcool pode tanto **elevar quanto reduzir** a glicose, dependendo do tipo e quantidade.

## Efeitos no organismo

• Cerveja e drinks doces: elevam a glicose (alto teor de carboidratos)
• Destilados puros (vodka, gin): podem causar hipoglicemia horas depois
• O fígado prioriza metabolizar álcool, pausando a regulação da glicose

## Regras de segurança

1. Nunca beba com o estômago vazio
2. Meça a glicose antes, durante e antes de dormir
3. Limite: 1 dose/dia para mulheres, 2 doses/dia para homens
4. Avise acompanhantes sobre sua condição
5. Não confunda sintomas de hipoglicemia com embriaguez

**Atenção:** álcool pode causar hipoglicemia noturna grave. Sempre faça um lanche antes de dormir após consumir álcool.`,
      categoria: 'ALIMENTACAO' as const,
      tempoLeitura: 2,
      destaque: false,
    },
  ];

  let criadas = 0;
  for (const dica of dicas) {
    const existente = await prisma.dicas.findFirst({ where: { titulo: dica.titulo } });
    if (!existente) {
      await prisma.dicas.create({ data: dica });
      criadas++;
      console.log(`   📝 "${dica.titulo}"`);
    } else {
      console.log(`   ⏭️  Já existe: "${dica.titulo}"`);
    }
  }

  console.log(`\n✅ ${criadas} dica(s) criada(s).`);
  console.log('\n🎉 Seed concluído!\n');
  console.log('─────────────────────────────────────');
  console.log('  Admin: admin@diabecontrol.com');
  console.log('  Senha: admin123');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
