import { DiagnosisQuestion } from '../types';

export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  {
    id: 'q1',
    category: 'Sintomas Clássicos',
    question: 'Com que frequência você sente sede excessiva?',
    options: [
      { label: 'Raramente ou nunca', value: 0 },
      { label: 'Às vezes (1-2x por semana)', value: 1 },
      { label: 'Frequentemente (vários dias)', value: 2 },
      { label: 'Quase sempre ou sempre', value: 3 },
    ],
  },
  {
    id: 'q2',
    category: 'Sintomas Clássicos',
    question: 'Você urina com muita frequência, inclusive à noite?',
    options: [
      { label: 'Não', value: 0 },
      { label: 'Às vezes', value: 1 },
      { label: 'Com frequência', value: 2 },
      { label: 'Sempre, inclusive acordo à noite', value: 3 },
    ],
  },
  {
    id: 'q3',
    category: 'Sintomas Clássicos',
    question: 'Você sente cansaço excessivo sem razão aparente?',
    options: [
      { label: 'Não, tenho boa energia', value: 0 },
      { label: 'Às vezes me sinto cansado', value: 1 },
      { label: 'Frequentemente cansado', value: 2 },
      { label: 'Cansaço extremo e constante', value: 3 },
    ],
  },
  {
    id: 'q4',
    category: 'Sintomas Clássicos',
    question: 'Sua visão fica embaçada com frequência?',
    options: [
      { label: 'Não', value: 0 },
      { label: 'Raramente', value: 1 },
      { label: 'Às vezes', value: 2 },
      { label: 'Frequentemente', value: 3 },
    ],
  },
  {
    id: 'q5',
    category: 'Histórico Familiar',
    question: 'Algum familiar próximo tem ou teve diabetes?',
    options: [
      { label: 'Não', value: 0 },
      { label: 'Parentes distantes', value: 1 },
      { label: 'Avós ou tios', value: 2 },
      { label: 'Pais, irmãos ou filhos', value: 3 },
    ],
  },
  {
    id: 'q6',
    category: 'Estilo de Vida',
    question: 'Como você descreveria seu peso atual?',
    options: [
      { label: 'Peso saudável (IMC < 25)', value: 0 },
      { label: 'Levemente acima (IMC 25-27)', value: 1 },
      { label: 'Sobrepeso (IMC 27-30)', value: 2 },
      { label: 'Obesidade (IMC > 30)', value: 3 },
    ],
  },
  {
    id: 'q7',
    category: 'Estilo de Vida',
    question: 'Com que frequência você pratica atividade física?',
    options: [
      { label: 'Regularmente (3+ x/semana)', value: 0 },
      { label: '1-2 vezes por semana', value: 1 },
      { label: 'Raramente', value: 2 },
      { label: 'Nunca ou quase nunca', value: 3 },
    ],
  },
  {
    id: 'q8',
    category: 'Estilo de Vida',
    question: 'Como é sua alimentação em geral?',
    options: [
      { label: 'Muito saudável, pouco açúcar', value: 0 },
      { label: 'Razoável, com alguns excessos', value: 1 },
      { label: 'Bastante açúcar e industrializados', value: 2 },
      { label: 'Muito açúcar, frituras e processados', value: 3 },
    ],
  },
  {
    id: 'q9',
    category: 'Sinais Físicos',
    question: 'Você tem formigamento ou dormência nas mãos e pés?',
    options: [
      { label: 'Não', value: 0 },
      { label: 'Raramente', value: 1 },
      { label: 'Às vezes', value: 2 },
      { label: 'Frequentemente', value: 3 },
    ],
  },
  {
    id: 'q10',
    category: 'Sinais Físicos',
    question: 'Feridas e cortes demoram muito para cicatrizar?',
    options: [
      { label: 'Não, cicatrizam normalmente', value: 0 },
      { label: 'Um pouco mais devagar', value: 1 },
      { label: 'Bastante devagar', value: 2 },
      { label: 'Extremamente lento', value: 3 },
    ],
  },
];

export const getRiskLevel = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage < 30) return 'low';
  if (percentage < 60) return 'medium';
  return 'high';
};
