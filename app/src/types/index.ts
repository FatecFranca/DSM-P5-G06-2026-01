export interface User {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  diabetesType: 'none' | 'type1' | 'type2' | 'gestational' | 'prediabetes';
  email: string;
  avatar?: string;
  targetGlucoseMin: number;
  targetGlucoseMax: number;
  doctorName?: string;
  lastCheckup?: string;
}

export type GlucoseContext = 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'random';

export type GlucoseStatus = 'low' | 'normal' | 'high' | 'very_high';

export interface GlucoseReading {
  id: string;
  value: number;
  context: GlucoseContext;
  date: string;
  time: string;
  notes?: string;
  status: GlucoseStatus;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodCategory = 'good' | 'moderate' | 'bad';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  category: FoodCategory;
  portion: string;
  glycemicIndex?: number;
}

export interface MealEntry {
  id: string;
  type: MealType;
  date: string;
  time: string;
  foods: FoodItem[];
  totalCalories: number;
  totalCarbs: number;
  notes?: string;
}

export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  content: string;
  mood: MoodType;
  symptoms: string[];
  tags: string[];
}

export interface DiagnosisQuestion {
  id: string;
  question: string;
  options: { label: string; value: number; }[];
  category: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface DiagnosisResult {
  score: number;
  riskLevel: RiskLevel;
  percentage: number;
  answers: Record<string, number>;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon?: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  color: string;
  icon: string;
  items: FAQItem[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'glucose' | 'meal' | 'medication' | 'appointment' | 'tip' | 'goal';
  date: string;
  time: string;
  read: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  type: 'insulin' | 'oral' | 'supplement' | 'other';
  notes?: string;
  taken: boolean;
  lastTaken?: string;
  color: string;
}

export interface WaterLog {
  id: string;
  date: string;
  amount: number;
  time: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: 'glucose' | 'weight' | 'exercise' | 'water' | 'sleep' | 'steps';
  deadline: string;
  completed: boolean;
  color: string;
}

export interface ExerciseEntry {
  id: string;
  type: string;
  duration: number;
  calories: number;
  date: string;
  time: string;
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
}

export interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
}

export interface Tip {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  readTime: number;
  image?: string;
  date: string;
  featured?: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  glucoseUnit: 'mg/dL' | 'mmol/L';
  reminderGlucose: boolean;
  reminderMeal: boolean;
  reminderMedication: boolean;
  language: string;
  backupEnabled: boolean;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AddGlucose: { editing?: GlucoseReading };
  AddFood: { mealType: MealType; date: string };
  AddJournal: { editing?: JournalEntry };
  DiagnosisDetail: { result: DiagnosisResult };
  FAQDetail: { item: FAQItem };
  EditProfile: undefined;
  TipDetail: { tip: Tip };
  AddMedication: undefined;
  AddGoal: undefined;
  AddExercise: undefined;
  AddSleep: { editing?: SleepEntry };
};

export type TabParamList = {
  HomeTab: undefined;
  GlucoseTab: undefined;
  FoodTab: undefined;
  JournalTab: undefined;
  MoreTab: undefined;
};
