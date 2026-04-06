import {
  User, GlucoseReading, MealEntry, JournalEntry,
  Notification, Medication, WaterLog, Goal, ExerciseEntry, SleepEntry, Tip
} from '../types';

export const MOCK_USER: User = {
  id: '1',
  name: 'Carlos Silva',
  age: 42,
  weight: 82,
  height: 175,
  diabetesType: 'type2',
  email: 'carlos.silva@email.com',
  targetGlucoseMin: 70,
  targetGlucoseMax: 140,
  doctorName: 'Dra. Ana Martins',
  lastCheckup: '2026-03-15',
};

export const MOCK_GLUCOSE: GlucoseReading[] = [
  { id: '1', value: 98, context: 'fasting', date: '2026-04-06', time: '07:00', status: 'normal', notes: 'Acordei bem' },
  { id: '2', value: 145, context: 'after_meal', date: '2026-04-06', time: '12:30', status: 'high', notes: 'Após almoço' },
  { id: '3', value: 118, context: 'before_meal', date: '2026-04-05', time: '07:15', status: 'normal' },
  { id: '4', value: 162, context: 'after_meal', date: '2026-04-05', time: '13:00', status: 'high', notes: 'Pizza no almoço' },
  { id: '5', value: 88, context: 'fasting', date: '2026-04-04', time: '07:00', status: 'normal' },
  { id: '6', value: 134, context: 'after_meal', date: '2026-04-04', time: '12:45', status: 'normal' },
  { id: '7', value: 105, context: 'fasting', date: '2026-04-03', time: '06:50', status: 'normal' },
  { id: '8', value: 189, context: 'after_meal', date: '2026-04-03', time: '20:00', status: 'very_high', notes: 'Saída do jantar' },
  { id: '9', value: 92, context: 'fasting', date: '2026-04-02', time: '07:10', status: 'normal' },
  { id: '10', value: 127, context: 'after_meal', date: '2026-04-02', time: '12:30', status: 'normal' },
  { id: '11', value: 65, context: 'fasting', date: '2026-04-01', time: '07:00', status: 'low', notes: 'Hipoglicemia leve' },
  { id: '12', value: 143, context: 'after_meal', date: '2026-04-01', time: '13:00', status: 'high' },
  { id: '13', value: 110, context: 'fasting', date: '2026-03-31', time: '07:20', status: 'normal' },
  { id: '14', value: 138, context: 'after_meal', date: '2026-03-31', time: '12:30', status: 'normal' },
];

export const MOCK_MEALS: MealEntry[] = [
  {
    id: '1',
    type: 'breakfast',
    date: '2026-04-06',
    time: '07:30',
    foods: [
      { id: 'f1', name: 'Pão integral', calories: 120, carbs: 22, protein: 4, fat: 2, category: 'good', portion: '2 fatias', glycemicIndex: 42 },
      { id: 'f2', name: 'Ovos mexidos', calories: 150, carbs: 1, protein: 12, fat: 11, category: 'good', portion: '2 unidades' },
      { id: 'f3', name: 'Suco de laranja', calories: 110, carbs: 26, protein: 2, fat: 0, category: 'moderate', portion: '200ml', glycemicIndex: 57 },
    ],
    totalCalories: 380,
    totalCarbs: 49,
  },
  {
    id: '2',
    type: 'lunch',
    date: '2026-04-06',
    time: '12:00',
    foods: [
      { id: 'f4', name: 'Arroz integral', calories: 216, carbs: 45, protein: 5, fat: 2, category: 'good', portion: '1 xícara', glycemicIndex: 55 },
      { id: 'f5', name: 'Frango grelhado', calories: 165, carbs: 0, protein: 31, fat: 4, category: 'good', portion: '150g' },
      { id: 'f6', name: 'Salada verde', calories: 35, carbs: 6, protein: 2, fat: 0, category: 'good', portion: '1 tigela' },
    ],
    totalCalories: 416,
    totalCarbs: 51,
  },
  {
    id: '3',
    type: 'snack',
    date: '2026-04-06',
    time: '15:30',
    foods: [
      { id: 'f7', name: 'Maçã', calories: 95, carbs: 25, protein: 0, fat: 0, category: 'good', portion: '1 unidade', glycemicIndex: 36 },
      { id: 'f8', name: 'Castanhas', calories: 185, carbs: 4, protein: 4, fat: 18, category: 'good', portion: '30g' },
    ],
    totalCalories: 280,
    totalCarbs: 29,
  },
  {
    id: '4',
    type: 'breakfast',
    date: '2026-04-05',
    time: '08:00',
    foods: [
      { id: 'f9', name: 'Aveia', calories: 150, carbs: 27, protein: 5, fat: 3, category: 'good', portion: '40g', glycemicIndex: 55 },
      { id: 'f10', name: 'Banana', calories: 105, carbs: 27, protein: 1, fat: 0, category: 'moderate', portion: '1 unidade', glycemicIndex: 51 },
      { id: 'f11', name: 'Café com leite', calories: 60, carbs: 6, protein: 4, fat: 2, category: 'good', portion: '200ml' },
    ],
    totalCalories: 315,
    totalCarbs: 60,
  },
  {
    id: '5',
    type: 'lunch',
    date: '2026-04-05',
    time: '12:30',
    foods: [
      { id: 'f12', name: 'Pizza', calories: 580, carbs: 75, protein: 22, fat: 22, category: 'bad', portion: '2 fatias', glycemicIndex: 80 },
      { id: 'f13', name: 'Refrigerante', calories: 140, carbs: 37, protein: 0, fat: 0, category: 'bad', portion: '350ml', glycemicIndex: 63 },
    ],
    totalCalories: 720,
    totalCarbs: 112,
    notes: 'Pediu pizza com amigos',
  },
];

export const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: '1',
    date: '2026-04-06',
    time: '21:00',
    title: 'Bom dia hoje',
    content: 'Me senti bem disposto hoje. A glicose matinal estava ótima e consegui fazer uma caminhada de 30 minutos.',
    mood: 'good',
    symptoms: [],
    tags: ['exercício', 'bem-estar'],
  },
  {
    id: '2',
    date: '2026-04-05',
    time: '22:00',
    title: 'Fui à festa',
    content: 'Saí com amigos e acabei comendo pizza. A glicose subiu bastante depois. Preciso ser mais cuidadoso nessas situações.',
    mood: 'okay',
    symptoms: ['cansaço'],
    tags: ['alimentação', 'social'],
  },
  {
    id: '3',
    date: '2026-04-04',
    time: '20:30',
    title: 'Consulta médica',
    content: 'Fui à consulta com a Dra. Ana. Ela ficou satisfeita com a evolução. HbA1c melhorou para 6.8%. Continuar com a medicação.',
    mood: 'great',
    symptoms: [],
    tags: ['médico', 'exames', 'positivo'],
  },
  {
    id: '4',
    date: '2026-04-03',
    time: '09:00',
    title: 'Hipoglicemia à noite',
    content: 'Passei mal à noite com hipoglicemia. Acordei com sudorese e tremores. Tomei suco de laranja e melhorei. Devo ajustar a insulina com o médico.',
    mood: 'bad',
    symptoms: ['sudorese', 'tremores', 'tontura'],
    tags: ['hipoglicemia', 'emergência'],
  },
  {
    id: '5',
    date: '2026-04-01',
    time: '19:00',
    title: 'Iniciando nova rotina',
    content: 'Comecei a academia hoje. Professor montou um treino especial para diabéticos. Animado com a mudança!',
    mood: 'great',
    symptoms: [],
    tags: ['exercício', 'academia', 'motivação'],
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Medir Glicose', message: 'Não esqueça de medir sua glicose em jejum!', type: 'glucose', date: '2026-04-06', time: '07:00', read: false },
  { id: '2', title: 'Hora do Almoço', message: 'Lembre-se de registrar sua refeição do almoço.', type: 'meal', date: '2026-04-06', time: '12:00', read: false },
  { id: '3', title: 'Medicação', message: 'Hora de tomar a Metformina 850mg.', type: 'medication', date: '2026-04-06', time: '08:00', read: true },
  { id: '4', title: 'Dica do Dia', message: 'Caminhadas de 30 min após refeições reduzem a glicose em até 30%!', type: 'tip', date: '2026-04-05', time: '10:00', read: true },
  { id: '5', title: 'Consulta Agendada', message: 'Sua consulta com Dra. Ana é amanhã às 14h.', type: 'appointment', date: '2026-04-04', time: '09:00', read: true },
  { id: '6', title: 'Meta Atingida!', message: 'Parabéns! Você atingiu sua meta semanal de exercícios!', type: 'goal', date: '2026-04-03', time: '18:00', read: true },
  { id: '7', title: 'Glicose Alta', message: 'Sua última medição estava acima do ideal (189 mg/dL). Consulte seu médico.', type: 'glucose', date: '2026-04-03', time: '20:30', read: true },
  { id: '8', title: 'Hidratação', message: 'Você bebeu apenas 1L de água hoje. A meta é 2.5L!', type: 'tip', date: '2026-04-02', time: '16:00', read: true },
];

export const MOCK_MEDICATIONS: Medication[] = [
  { id: '1', name: 'Metformina', dosage: '850mg', frequency: 'Duas vezes ao dia', times: ['08:00', '20:00'], type: 'oral', taken: false, color: '#4CAF82', notes: 'Tomar com refeição' },
  { id: '2', name: 'Glibenclamida', dosage: '5mg', frequency: 'Uma vez ao dia', times: ['07:30'], type: 'oral', taken: true, lastTaken: '2026-04-06 07:30', color: '#3B8ED0' },
  { id: '3', name: 'Insulina Glargina', dosage: '20UI', frequency: 'Uma vez ao dia', times: ['22:00'], type: 'insulin', taken: false, color: '#8B5CF6', notes: 'Aplicar no abdômen' },
  { id: '4', name: 'Ômega 3', dosage: '1000mg', frequency: 'Uma vez ao dia', times: ['12:00'], type: 'supplement', taken: true, lastTaken: '2026-04-06 12:00', color: '#F97316' },
  { id: '5', name: 'Vitamina D', dosage: '2000UI', frequency: 'Uma vez ao dia', times: ['08:00'], type: 'supplement', taken: false, color: '#F59E0B' },
];

export const MOCK_WATER_LOG: WaterLog[] = [
  { id: '1', date: '2026-04-06', amount: 300, time: '07:00' },
  { id: '2', date: '2026-04-06', amount: 500, time: '09:30' },
  { id: '3', date: '2026-04-06', amount: 300, time: '12:00' },
  { id: '4', date: '2026-04-06', amount: 400, time: '15:00' },
  { id: '5', date: '2026-04-05', amount: 2000, time: '23:59' },
  { id: '6', date: '2026-04-04', amount: 1800, time: '23:59' },
];

export const MOCK_GOALS: Goal[] = [
  { id: '1', title: 'Glicose no Alvo', description: 'Manter 80% das leituras entre 70-140 mg/dL', target: 30, current: 24, unit: 'leituras', category: 'glucose', deadline: '2026-04-30', completed: false, color: '#4CAF82' },
  { id: '2', title: 'Perder Peso', description: 'Reduzir 3kg até o fim do mês', target: 3, current: 1.2, unit: 'kg', category: 'weight', deadline: '2026-04-30', completed: false, color: '#3B8ED0' },
  { id: '3', title: 'Exercícios Semanais', description: 'Caminhar 150 min por semana', target: 150, current: 90, unit: 'min', category: 'exercise', deadline: '2026-04-13', completed: false, color: '#F97316' },
  { id: '4', title: 'Hidratação Diária', description: 'Beber 2.5L de água por dia', target: 2500, current: 1500, unit: 'ml', category: 'water', deadline: '2026-04-06', completed: false, color: '#14B8A6' },
  { id: '5', title: 'Sono Adequado', description: 'Dormir 7-8h por noite', target: 7, current: 7, unit: 'horas', category: 'sleep', deadline: '2026-04-30', completed: true, color: '#8B5CF6' },
  { id: '6', title: 'Passos Diários', description: '8.000 passos por dia', target: 8000, current: 6200, unit: 'passos', category: 'steps', deadline: '2026-04-06', completed: false, color: '#EC4899' },
];

export const MOCK_EXERCISES: ExerciseEntry[] = [
  { id: '1', type: 'Caminhada', duration: 35, calories: 145, date: '2026-04-06', time: '06:30', intensity: 'moderate' },
  { id: '2', type: 'Musculação', duration: 45, calories: 210, date: '2026-04-04', time: '07:00', intensity: 'moderate', notes: 'Foco em pernas' },
  { id: '3', type: 'Natação', duration: 30, calories: 250, date: '2026-04-02', time: '08:00', intensity: 'high' },
  { id: '4', type: 'Yoga', duration: 40, calories: 100, date: '2026-04-01', time: '06:00', intensity: 'low', notes: 'Aula online' },
  { id: '5', type: 'Ciclismo', duration: 60, calories: 380, date: '2026-03-30', time: '07:30', intensity: 'high' },
];

export const MOCK_SLEEP: SleepEntry[] = [
  { id: '1', date: '2026-04-06', bedtime: '22:30', wakeTime: '06:00', duration: 7.5, quality: 'good' },
  { id: '2', date: '2026-04-05', bedtime: '01:00', wakeTime: '07:30', duration: 6.5, quality: 'fair', notes: 'Saída com amigos' },
  { id: '3', date: '2026-04-04', bedtime: '22:00', wakeTime: '06:00', duration: 8, quality: 'excellent' },
  { id: '4', date: '2026-04-03', bedtime: '00:30', wakeTime: '06:30', duration: 6, quality: 'poor', notes: 'Hipoglicemia à noite' },
  { id: '5', date: '2026-04-02', bedtime: '22:30', wakeTime: '06:00', duration: 7.5, quality: 'good' },
  { id: '6', date: '2026-04-01', bedtime: '23:00', wakeTime: '06:30', duration: 7.5, quality: 'good' },
  { id: '7', date: '2026-03-31', bedtime: '22:00', wakeTime: '05:30', duration: 7.5, quality: 'excellent' },
];

export const MOCK_TIPS: Tip[] = [
  {
    id: '1',
    title: 'Como o exercício afeta sua glicose',
    summary: 'Entenda por que a atividade física é essencial no controle do diabetes',
    content: `## Exercício e Diabetes\n\nA atividade física é uma das ferramentas mais poderosas no controle do diabetes. Durante o exercício, seus músculos absorvem glicose sem precisar de insulina, reduzindo naturalmente os níveis sanguíneos.\n\n### Benefícios\n- Melhora a sensibilidade à insulina\n- Reduz a glicose sanguínea\n- Ajuda no controle de peso\n- Melhora o perfil lipídico\n- Reduz o risco cardiovascular\n\n### Dicas Práticas\n1. Meça a glicose antes e depois do exercício\n2. Tenha sempre um carboidrato de rápida absorção\n3. Hidrate-se bem\n4. Comece devagar e aumente a intensidade gradualmente\n\n### Atenção\nSe a glicose estiver acima de 250 mg/dL, evite exercícios intensos.`,
    category: 'Exercício',
    readTime: 4,
    date: '2026-04-06',
    featured: true,
  },
  {
    id: '2',
    title: 'Índice Glicêmico: guia completo',
    summary: 'Saiba quais alimentos causam picos de glicose e como evitá-los',
    content: `## Índice Glicêmico\n\nO índice glicêmico (IG) mede a velocidade com que um alimento eleva a glicose sanguínea.\n\n### Classificação\n- **Baixo IG (< 55):** Aveia, lentilha, maçã, iogurte natural\n- **Médio IG (55-70):** Arroz integral, batata-doce, beterraba\n- **Alto IG (> 70):** Pão branco, batata inglesa, arroz branco, melancia\n\n### Como Usar\nPrefira alimentos de baixo IG, combine carboidratos com proteínas e fibras para reduzir o impacto glicêmico.`,
    category: 'Alimentação',
    readTime: 3,
    date: '2026-04-05',
    featured: true,
  },
  {
    id: '3',
    title: 'Hipoglicemia: o que fazer?',
    summary: 'Aprenda a reconhecer e tratar rapidamente a hipoglicemia',
    content: `## Hipoglicemia\n\nHipoglicemia é quando a glicose cai abaixo de 70 mg/dL. É uma situação que requer ação rápida.\n\n### Sintomas\n- Tremores e fraqueza\n- Sudorese\n- Tontura e confusão\n- Batimento cardíaco acelerado\n- Fome intensa\n\n### Regra dos 15\n1. Consuma 15g de carboidrato rápido (1 copo de suco, 3 balas, 1 colher de mel)\n2. Espere 15 minutos\n3. Meça a glicose novamente\n4. Repita se ainda estiver baixa\n\n### Prevenção\n- Não pule refeições\n- Monitore a glicose regularmente\n- Tenha sempre um carboidrato de emergência`,
    category: 'Emergência',
    readTime: 3,
    date: '2026-04-04',
  },
  {
    id: '4',
    title: 'Sono e diabetes: a conexão oculta',
    summary: 'Como a qualidade do sono impacta diretamente seu controle glicêmico',
    content: `## Sono e Diabetes\n\nA falta de sono pode aumentar a resistência à insulina em até 40% e elevar os níveis de cortisol, hormonio que eleva a glicose.\n\n### Dicas para Dormir Melhor\n- Mantenha horário regular\n- Evite telas 1h antes de dormir\n- Mantenha o quarto fresco e escuro\n- Evite cafeína após 14h\n- Pratique técnicas de relaxamento`,
    category: 'Bem-estar',
    readTime: 3,
    date: '2026-04-03',
  },
  {
    id: '5',
    title: 'Estresse e glicemia alta',
    summary: 'Por que momentos de estresse fazem a glicose disparar',
    content: `## Estresse e Glicemia\n\nO estresse libera hormônios como cortisol e adrenalina que elevam a glicose. Isso é parte da resposta "luta ou fuga" do organismo.\n\n### Como Gerenciar\n- Meditação e mindfulness\n- Exercício físico regular\n- Respiração profunda\n- Atividades prazerosas\n- Conversar com um psicólogo`,
    category: 'Bem-estar',
    readTime: 3,
    date: '2026-04-02',
  },
  {
    id: '6',
    title: 'Álcool e diabetes',
    summary: 'O que você precisa saber antes de beber',
    content: `## Álcool e Diabetes\n\nO álcool pode tanto elevar quanto reduzir a glicose, dependendo da quantidade e contexto.\n\n### Riscos\n- Hipoglicemia (especialmente em jejum)\n- Mascaramento de sintomas de hipo\n- Alto teor calórico\n\n### Se for beber\n- Nunca em jejum\n- Meça a glicose antes e depois\n- Informe alguém próximo\n- Não exagere`,
    category: 'Alimentação',
    readTime: 2,
    date: '2026-04-01',
  },
];
