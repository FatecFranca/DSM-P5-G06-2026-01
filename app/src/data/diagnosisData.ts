import { DiagnosisQuestion } from '../types';

export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
  {
    id: 'q1',
    category: 'Histórico Reprodutivo',
    question: 'Quantas vezes você já engravidou?',
    options: [
      { label: 'Nunca', value: 0 },
      { label: '1 vez', value: 1 },
      { label: '2 vezes', value: 2 },
      { label: '3 vezes ou mais', value: 3 },
    ],
  },
  {
    id: 'q2',
    category: 'Exames',
    question: 'Qual foi o seu nível de glicose no exame de sangue?',
    options: [
      { label: 'Abaixo de 100 mg/dL', value: 0 },
      { label: '100-125 mg/dL', value: 1 },
      { label: '126-199 mg/dL', value: 2 },
      { label: '200 mg/dL ou mais', value: 3 },
    ],
  },
  {
    id: 'q3',
    category: 'Exames',
    question: 'Qual é a sua pressão arterial mínima (mmHg)?',
    options: [
      { label: 'Abaixo de 80', value: 0 },
      { label: '80-89', value: 1 },
      { label: '90-99', value: 2 },
      { label: '100 ou mais', value: 3 },
    ],
  },
  {
    id: 'q4',
    category: 'Exames',
    question: 'Qual é a medida da gordura do braço na região do tríceps (mm)?',
    options: [
      { label: 'Menos de 10 mm', value: 0 },
      { label: '10-14 mm', value: 1 },
      { label: '15-19 mm', value: 2 },
      { label: '20 mm ou mais', value: 3 },
    ],
  },
  {
    id: 'q5',
    category: 'Exames',
    question: 'Qual foi o seu nível de insulina no exame?',
    options: [
      { label: 'Abaixo de 10 µU/mL', value: 0 },
      { label: '10-19 µU/mL', value: 1 },
      { label: '20-29 µU/mL', value: 2 },
      { label: '30 µU/mL ou mais', value: 3 },
    ],
  },
  {
    id: 'q6',
    category: 'Dados Físicos',
    question: 'Qual é o seu IMC (Índice de Massa Corporal)?',
    options: [
      { label: 'Menos de 25', value: 0 },
      { label: '25-29.9', value: 1 },
      { label: '30-34.9', value: 2 },
      { label: '35 ou mais', value: 3 },
    ],
  },
  {
    id: 'q7',
    category: 'Histórico Familiar',
    question: 'Quantos familiares próximos têm diabetes?',
    options: [
      { label: 'Nenhum', value: 0 },
      { label: '1 familiar', value: 1 },
      { label: '2 familiares', value: 2 },
      { label: '3 ou mais', value: 3 },
    ],
  },
  {
    id: 'q8',
    category: 'Dados Pessoais',
    question: 'Qual é a sua idade?',
    options: [
      { label: 'Menos de 30 anos', value: 0 },
      { label: '30-45 anos', value: 1 },
      { label: '46-60 anos', value: 2 },
      { label: 'Mais de 60 anos', value: 3 },
    ],
  },
];
























export const getRiskLevel = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage < 30) return 'low';
  if (percentage < 60) return 'medium';
  return 'high';
};
