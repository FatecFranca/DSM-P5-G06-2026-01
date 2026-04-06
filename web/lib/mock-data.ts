// ─── Types ───────────────────────────────────────────────────────────────────

export type DiabetesType = "type1" | "type2" | "gestational" | "prediabetes";
export type GlucoseStatus = "low" | "normal" | "high" | "very_high";
export type GlucoseContext = "fasting" | "before_meal" | "after_meal" | "bedtime" | "random";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type Mood = "great" | "good" | "okay" | "bad" | "terrible";
export type MedType = "oral" | "insulin" | "supplement";
export type GoalCategory = "glucose" | "weight" | "exercise" | "water" | "sleep" | "steps";
export type UserStatus = "active" | "inactive";
export type NotifType = "glucose" | "meal" | "medication" | "appointment" | "tip" | "goal";
export type TipCategory = "Exercício" | "Alimentação" | "Emergência" | "Bem-estar";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  diabetesType: DiabetesType;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
  doctorName: string;
  lastCheckup: string;
  status: UserStatus;
  joinedAt: string;
  avatar?: string;
  lastActivity: string;
  hba1c: number;
  avgGlucose: number;
  medAdherence: number;
}

export interface GlucoseReading {
  id: string;
  userId: string;
  value: number;
  context: GlucoseContext;
  date: string;
  time: string;
  status: GlucoseStatus;
  notes?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  portion: string;
  glycemicIndex?: number;
}

export interface MealEntry {
  id: string;
  userId: string;
  type: MealType;
  date: string;
  time: string;
  foods: FoodItem[];
  totalCalories: number;
  totalCarbs: number;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  time: string;
  title: string;
  content: string;
  mood: Mood;
  symptoms: string[];
  tags: string[];
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  type: MedType;
  taken: boolean;
  lastTaken?: string;
  color: string;
  notes?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: GoalCategory;
  deadline: string;
  completed: boolean;
  color: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotifType;
  date: string;
  time: string;
  read: boolean;
}

export interface Tip {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: TipCategory;
  readTime: number;
  date: string;
  featured: boolean;
  views: number;
  likes: number;
}

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: AppUser[] = [
  {
    id: "1",
    name: "Carlos Silva",
    email: "carlos.silva@email.com",
    age: 42,
    weight: 82,
    height: 175,
    diabetesType: "type2",
    targetGlucoseMin: 70,
    targetGlucoseMax: 140,
    doctorName: "Dra. Ana Martins",
    lastCheckup: "2026-03-15",
    status: "active",
    joinedAt: "2025-01-10",
    lastActivity: "2026-04-06",
    hba1c: 6.8,
    avgGlucose: 118,
    medAdherence: 87,
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    age: 35,
    weight: 64,
    height: 162,
    diabetesType: "type1",
    targetGlucoseMin: 70,
    targetGlucoseMax: 130,
    doctorName: "Dr. Roberto Faria",
    lastCheckup: "2026-03-20",
    status: "active",
    joinedAt: "2025-02-14",
    lastActivity: "2026-04-06",
    hba1c: 7.1,
    avgGlucose: 125,
    medAdherence: 95,
  },
  {
    id: "3",
    name: "João Santos",
    email: "joao.santos@email.com",
    age: 58,
    weight: 96,
    height: 178,
    diabetesType: "type2",
    targetGlucoseMin: 80,
    targetGlucoseMax: 150,
    doctorName: "Dr. Marcos Leite",
    lastCheckup: "2026-02-28",
    status: "active",
    joinedAt: "2025-03-01",
    lastActivity: "2026-04-05",
    hba1c: 8.2,
    avgGlucose: 148,
    medAdherence: 72,
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@email.com",
    age: 29,
    weight: 71,
    height: 165,
    diabetesType: "gestational",
    targetGlucoseMin: 70,
    targetGlucoseMax: 120,
    doctorName: "Dra. Carla Mendes",
    lastCheckup: "2026-04-01",
    status: "active",
    joinedAt: "2026-01-05",
    lastActivity: "2026-04-06",
    hba1c: 5.9,
    avgGlucose: 102,
    medAdherence: 98,
  },
  {
    id: "5",
    name: "Pedro Lima",
    email: "pedro.lima@email.com",
    age: 47,
    weight: 88,
    height: 172,
    diabetesType: "prediabetes",
    targetGlucoseMin: 70,
    targetGlucoseMax: 125,
    doctorName: "Dr. Eduardo Ramos",
    lastCheckup: "2026-01-15",
    status: "inactive",
    joinedAt: "2025-06-20",
    lastActivity: "2026-02-10",
    hba1c: 6.2,
    avgGlucose: 112,
    medAdherence: 60,
  },
  {
    id: "6",
    name: "Lucia Ferreira",
    email: "lucia.ferreira@email.com",
    age: 63,
    weight: 70,
    height: 158,
    diabetesType: "type2",
    targetGlucoseMin: 80,
    targetGlucoseMax: 150,
    doctorName: "Dra. Ana Martins",
    lastCheckup: "2026-03-10",
    status: "active",
    joinedAt: "2024-11-30",
    lastActivity: "2026-04-04",
    hba1c: 7.4,
    avgGlucose: 132,
    medAdherence: 80,
  },
  {
    id: "7",
    name: "Roberto Alves",
    email: "roberto.alves@email.com",
    age: 22,
    weight: 70,
    height: 180,
    diabetesType: "type1",
    targetGlucoseMin: 70,
    targetGlucoseMax: 130,
    doctorName: "Dr. Roberto Faria",
    lastCheckup: "2026-03-25",
    status: "active",
    joinedAt: "2025-09-15",
    lastActivity: "2026-04-06",
    hba1c: 6.5,
    avgGlucose: 114,
    medAdherence: 92,
  },
  {
    id: "8",
    name: "Fernanda Castro",
    email: "fernanda.castro@email.com",
    age: 51,
    weight: 75,
    height: 163,
    diabetesType: "type2",
    targetGlucoseMin: 70,
    targetGlucoseMax: 140,
    doctorName: "Dr. Marcos Leite",
    lastCheckup: "2026-02-20",
    status: "inactive",
    joinedAt: "2025-04-10",
    lastActivity: "2026-03-15",
    hba1c: 7.8,
    avgGlucose: 139,
    medAdherence: 65,
  },
];

// ─── Mock Glucose ─────────────────────────────────────────────────────────────

export const MOCK_GLUCOSE: GlucoseReading[] = [
  { id: "1", userId: "1", value: 98, context: "fasting", date: "2026-04-06", time: "07:00", status: "normal", notes: "Acordei bem" },
  { id: "2", userId: "1", value: 145, context: "after_meal", date: "2026-04-06", time: "12:30", status: "high", notes: "Após almoço" },
  { id: "3", userId: "1", value: 118, context: "before_meal", date: "2026-04-05", time: "07:15", status: "normal" },
  { id: "4", userId: "1", value: 162, context: "after_meal", date: "2026-04-05", time: "13:00", status: "high", notes: "Pizza no almoço" },
  { id: "5", userId: "1", value: 88, context: "fasting", date: "2026-04-04", time: "07:00", status: "normal" },
  { id: "6", userId: "1", value: 134, context: "after_meal", date: "2026-04-04", time: "12:45", status: "normal" },
  { id: "7", userId: "1", value: 105, context: "fasting", date: "2026-04-03", time: "06:50", status: "normal" },
  { id: "8", userId: "1", value: 189, context: "after_meal", date: "2026-04-03", time: "20:00", status: "very_high", notes: "Saída do jantar" },
  { id: "9", userId: "1", value: 92, context: "fasting", date: "2026-04-02", time: "07:10", status: "normal" },
  { id: "10", userId: "1", value: 127, context: "after_meal", date: "2026-04-02", time: "12:30", status: "normal" },
  { id: "11", userId: "1", value: 65, context: "fasting", date: "2026-04-01", time: "07:00", status: "low", notes: "Hipoglicemia leve" },
  { id: "12", userId: "1", value: 143, context: "after_meal", date: "2026-04-01", time: "13:00", status: "high" },
  { id: "13", userId: "1", value: 110, context: "fasting", date: "2026-03-31", time: "07:20", status: "normal" },
  { id: "14", userId: "1", value: 138, context: "after_meal", date: "2026-03-31", time: "12:30", status: "normal" },
  { id: "15", userId: "2", value: 112, context: "fasting", date: "2026-04-06", time: "07:30", status: "normal" },
  { id: "16", userId: "2", value: 158, context: "after_meal", date: "2026-04-06", time: "13:00", status: "high" },
  { id: "17", userId: "3", value: 168, context: "fasting", date: "2026-04-06", time: "08:00", status: "high" },
  { id: "18", userId: "3", value: 210, context: "after_meal", date: "2026-04-06", time: "13:30", status: "very_high" },
  { id: "19", userId: "4", value: 95, context: "fasting", date: "2026-04-06", time: "07:00", status: "normal" },
  { id: "20", userId: "4", value: 118, context: "after_meal", date: "2026-04-06", time: "12:30", status: "normal" },
];

// ─── Mock Meals ───────────────────────────────────────────────────────────────

export const MOCK_MEALS: MealEntry[] = [
  {
    id: "1", userId: "1", type: "breakfast", date: "2026-04-06", time: "07:30",
    foods: [
      { id: "f1", name: "Pão integral", calories: 120, carbs: 22, protein: 4, fat: 2, portion: "2 fatias", glycemicIndex: 42 },
      { id: "f2", name: "Ovos mexidos", calories: 150, carbs: 1, protein: 12, fat: 11, portion: "2 unidades" },
      { id: "f3", name: "Suco de laranja", calories: 110, carbs: 26, protein: 2, fat: 0, portion: "200ml", glycemicIndex: 57 },
    ],
    totalCalories: 380, totalCarbs: 49,
  },
  {
    id: "2", userId: "1", type: "lunch", date: "2026-04-06", time: "12:00",
    foods: [
      { id: "f4", name: "Arroz integral", calories: 216, carbs: 45, protein: 5, fat: 2, portion: "1 xícara", glycemicIndex: 55 },
      { id: "f5", name: "Frango grelhado", calories: 165, carbs: 0, protein: 31, fat: 4, portion: "150g" },
      { id: "f6", name: "Salada verde", calories: 35, carbs: 6, protein: 2, fat: 0, portion: "1 tigela" },
    ],
    totalCalories: 416, totalCarbs: 51,
  },
  {
    id: "3", userId: "1", type: "snack", date: "2026-04-06", time: "15:30",
    foods: [
      { id: "f7", name: "Maçã", calories: 95, carbs: 25, protein: 0, fat: 0, portion: "1 unidade", glycemicIndex: 36 },
      { id: "f8", name: "Castanhas", calories: 185, carbs: 4, protein: 4, fat: 18, portion: "30g" },
    ],
    totalCalories: 280, totalCarbs: 29,
  },
  {
    id: "4", userId: "1", type: "breakfast", date: "2026-04-05", time: "08:00",
    foods: [
      { id: "f9", name: "Aveia", calories: 150, carbs: 27, protein: 5, fat: 3, portion: "40g", glycemicIndex: 55 },
      { id: "f10", name: "Banana", calories: 105, carbs: 27, protein: 1, fat: 0, portion: "1 unidade", glycemicIndex: 51 },
    ],
    totalCalories: 315, totalCarbs: 60,
  },
  {
    id: "5", userId: "1", type: "lunch", date: "2026-04-05", time: "12:30",
    foods: [
      { id: "f12", name: "Pizza", calories: 580, carbs: 75, protein: 22, fat: 22, portion: "2 fatias", glycemicIndex: 80 },
      { id: "f13", name: "Refrigerante", calories: 140, carbs: 37, protein: 0, fat: 0, portion: "350ml" },
    ],
    totalCalories: 720, totalCarbs: 112, notes: "Pediu pizza com amigos",
  },
];

// ─── Mock Journal ─────────────────────────────────────────────────────────────

export const MOCK_JOURNAL: JournalEntry[] = [
  {
    id: "1", userId: "1", date: "2026-04-06", time: "21:00", title: "Bom dia hoje",
    content: "Me senti bem disposto hoje. A glicose matinal estava ótima e consegui fazer uma caminhada de 30 minutos.",
    mood: "good", symptoms: [], tags: ["exercício", "bem-estar"],
  },
  {
    id: "2", userId: "1", date: "2026-04-05", time: "22:00", title: "Fui à festa",
    content: "Saí com amigos e acabei comendo pizza. A glicose subiu bastante depois. Preciso ser mais cuidadoso.",
    mood: "okay", symptoms: ["cansaço"], tags: ["alimentação", "social"],
  },
  {
    id: "3", userId: "1", date: "2026-04-04", time: "20:30", title: "Consulta médica",
    content: "Fui à consulta com a Dra. Ana. Ela ficou satisfeita com a evolução. HbA1c melhorou para 6.8%.",
    mood: "great", symptoms: [], tags: ["médico", "exames", "positivo"],
  },
  {
    id: "4", userId: "1", date: "2026-04-03", time: "09:00", title: "Hipoglicemia à noite",
    content: "Passei mal à noite com hipoglicemia. Acordei com sudorese e tremores. Tomei suco de laranja e melhorei.",
    mood: "bad", symptoms: ["sudorese", "tremores", "tontura"], tags: ["hipoglicemia", "emergência"],
  },
  {
    id: "5", userId: "1", date: "2026-04-01", time: "19:00", title: "Iniciando nova rotina",
    content: "Comecei a academia hoje. Professor montou um treino especial para diabéticos. Animado!",
    mood: "great", symptoms: [], tags: ["exercício", "academia", "motivação"],
  },
];

// ─── Mock Medications ─────────────────────────────────────────────────────────

export const MOCK_MEDICATIONS: Medication[] = [
  { id: "1", userId: "1", name: "Metformina", dosage: "850mg", frequency: "Duas vezes ao dia", times: ["08:00", "20:00"], type: "oral", taken: false, color: "#4CAF82", notes: "Tomar com refeição" },
  { id: "2", userId: "1", name: "Glibenclamida", dosage: "5mg", frequency: "Uma vez ao dia", times: ["07:30"], type: "oral", taken: true, lastTaken: "2026-04-06 07:30", color: "#3B8ED0" },
  { id: "3", userId: "1", name: "Insulina Glargina", dosage: "20UI", frequency: "Uma vez ao dia", times: ["22:00"], type: "insulin", taken: false, color: "#8B5CF6", notes: "Aplicar no abdômen" },
  { id: "4", userId: "1", name: "Ômega 3", dosage: "1000mg", frequency: "Uma vez ao dia", times: ["12:00"], type: "supplement", taken: true, lastTaken: "2026-04-06 12:00", color: "#F97316" },
  { id: "5", userId: "1", name: "Vitamina D", dosage: "2000UI", frequency: "Uma vez ao dia", times: ["08:00"], type: "supplement", taken: false, color: "#F59E0B" },
];

// ─── Mock Goals ───────────────────────────────────────────────────────────────

export const MOCK_GOALS: Goal[] = [
  { id: "1", userId: "1", title: "Glicose no Alvo", description: "Manter 80% das leituras entre 70-140 mg/dL", target: 30, current: 24, unit: "leituras", category: "glucose", deadline: "2026-04-30", completed: false, color: "#4CAF82" },
  { id: "2", userId: "1", title: "Perder Peso", description: "Reduzir 3kg até o fim do mês", target: 3, current: 1.2, unit: "kg", category: "weight", deadline: "2026-04-30", completed: false, color: "#3B8ED0" },
  { id: "3", userId: "1", title: "Exercícios Semanais", description: "Caminhar 150 min por semana", target: 150, current: 90, unit: "min", category: "exercise", deadline: "2026-04-13", completed: false, color: "#F97316" },
  { id: "4", userId: "1", title: "Hidratação Diária", description: "Beber 2.5L de água por dia", target: 2500, current: 1500, unit: "ml", category: "water", deadline: "2026-04-06", completed: false, color: "#14B8A6" },
  { id: "5", userId: "1", title: "Sono Adequado", description: "Dormir 7-8h por noite", target: 7, current: 7, unit: "horas", category: "sleep", deadline: "2026-04-30", completed: true, color: "#8B5CF6" },
  { id: "6", userId: "1", title: "Passos Diários", description: "8.000 passos por dia", target: 8000, current: 6200, unit: "passos", category: "steps", deadline: "2026-04-06", completed: false, color: "#EC4899" },
];

// ─── Mock Notifications ───────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", userId: "1", title: "Medir Glicose", message: "Não esqueça de medir sua glicose em jejum!", type: "glucose", date: "2026-04-06", time: "07:00", read: false },
  { id: "2", userId: "1", title: "Hora do Almoço", message: "Lembre-se de registrar sua refeição do almoço.", type: "meal", date: "2026-04-06", time: "12:00", read: false },
  { id: "3", userId: "1", title: "Medicação", message: "Hora de tomar a Metformina 850mg.", type: "medication", date: "2026-04-06", time: "08:00", read: true },
  { id: "4", userId: "1", title: "Dica do Dia", message: "Caminhadas de 30 min após refeições reduzem a glicose em até 30%!", type: "tip", date: "2026-04-05", time: "10:00", read: true },
  { id: "5", userId: "1", title: "Consulta Agendada", message: "Sua consulta com Dra. Ana é amanhã às 14h.", type: "appointment", date: "2026-04-04", time: "09:00", read: true },
  { id: "6", userId: "1", title: "Meta Atingida!", message: "Parabéns! Você atingiu sua meta semanal de exercícios!", type: "goal", date: "2026-04-03", time: "18:00", read: true },
  { id: "7", userId: "1", title: "Glicose Alta", message: "Sua última medição estava acima do ideal (189 mg/dL).", type: "glucose", date: "2026-04-03", time: "20:30", read: true },
  { id: "8", userId: "1", title: "Hidratação", message: "Você bebeu apenas 1L de água hoje. A meta é 2.5L!", type: "tip", date: "2026-04-02", time: "16:00", read: true },
];

// ─── Mock Tips ────────────────────────────────────────────────────────────────

export const MOCK_TIPS: Tip[] = [
  {
    id: "1", title: "Como o exercício afeta sua glicose",
    summary: "Entenda por que a atividade física é essencial no controle do diabetes",
    content: "## Exercício e Diabetes\n\nA atividade física é uma das ferramentas mais poderosas no controle do diabetes.",
    category: "Exercício", readTime: 4, date: "2026-04-06", featured: true, views: 1240, likes: 87,
  },
  {
    id: "2", title: "Índice Glicêmico: guia completo",
    summary: "Saiba quais alimentos causam picos de glicose e como evitá-los",
    content: "## Índice Glicêmico\n\nO índice glicêmico (IG) mede a velocidade com que um alimento eleva a glicose sanguínea.",
    category: "Alimentação", readTime: 3, date: "2026-04-05", featured: true, views: 980, likes: 72,
  },
  {
    id: "3", title: "Hipoglicemia: o que fazer?",
    summary: "Aprenda a reconhecer e tratar rapidamente a hipoglicemia",
    content: "## Hipoglicemia\n\nHipoglicemia é quando a glicose cai abaixo de 70 mg/dL.",
    category: "Emergência", readTime: 3, date: "2026-04-04", featured: false, views: 756, likes: 65,
  },
  {
    id: "4", title: "Sono e diabetes: a conexão oculta",
    summary: "Como a qualidade do sono impacta diretamente seu controle glicêmico",
    content: "## Sono e Diabetes\n\nA falta de sono pode aumentar a resistência à insulina em até 40%.",
    category: "Bem-estar", readTime: 3, date: "2026-04-03", featured: false, views: 612, likes: 48,
  },
  {
    id: "5", title: "Estresse e glicemia alta",
    summary: "Por que momentos de estresse fazem a glicose disparar",
    content: "## Estresse e Glicemia\n\nO estresse libera hormônios como cortisol e adrenalina que elevam a glicose.",
    category: "Bem-estar", readTime: 3, date: "2026-04-02", featured: false, views: 534, likes: 41,
  },
  {
    id: "6", title: "Álcool e diabetes",
    summary: "O que você precisa saber antes de beber",
    content: "## Álcool e Diabetes\n\nO álcool pode tanto elevar quanto reduzir a glicose.",
    category: "Alimentação", readTime: 2, date: "2026-04-01", featured: false, views: 489, likes: 36,
  },
];

// ─── Aggregated stats ─────────────────────────────────────────────────────────

export const GLUCOSE_TREND = [
  { date: "31/03", avg: 124, min: 110, max: 138 },
  { date: "01/04", avg: 104, min: 65, max: 143 },
  { date: "02/04", avg: 110, min: 92, max: 127 },
  { date: "03/04", avg: 147, min: 105, max: 189 },
  { date: "04/04", avg: 111, min: 88, max: 134 },
  { date: "05/04", avg: 140, min: 118, max: 162 },
  { date: "06/04", avg: 122, min: 98, max: 145 },
];

export const WEEKLY_MEALS_CALORIES = [
  { day: "Seg", calories: 1680 },
  { day: "Ter", calories: 1920 },
  { day: "Qua", calories: 1540 },
  { day: "Qui", calories: 2100 },
  { day: "Sex", calories: 1760 },
  { day: "Sáb", calories: 1850 },
  { day: "Dom", calories: 1430 },
];

export const MOOD_DISTRIBUTION = [
  { mood: "Ótimo 😄", count: 2, color: "#4CAF82" },
  { mood: "Bem 😊", count: 1, color: "#3B8ED0" },
  { mood: "Ok 😐", count: 1, color: "#F59E0B" },
  { mood: "Mal 😔", count: 1, color: "#EF4444" },
];

export const GLUCOSE_DISTRIBUTION = [
  { name: "Normal", value: 8, color: "#4CAF82" },
  { name: "Alto", value: 4, color: "#F59E0B" },
  { name: "Muito alto", value: 1, color: "#EF4444" },
  { name: "Baixo", value: 1, color: "#3B8ED0" },
];

export const DIABETES_TYPE_DISTRIBUTION = [
  { name: "Tipo 2", value: 4, color: "#4CAF82" },
  { name: "Tipo 1", value: 2, color: "#3B8ED0" },
  { name: "Pré-diabetes", value: 1, color: "#F59E0B" },
  { name: "Gestacional", value: 1, color: "#EC4899" },
];
