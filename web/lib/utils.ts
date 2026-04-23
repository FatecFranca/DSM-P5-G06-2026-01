import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GlucoseStatus } from "./api";
import type { DiabetesType, Mood, MealType, MedType, GoalCategory, NotifType, TipCategory } from "./mock-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function glucoseStatusLabel(status: GlucoseStatus): string {
  return { low: "Baixo", normal: "Normal", high: "Alto", very_high: "Muito Alto" }[status];
}

export function glucoseStatusColor(status: GlucoseStatus): string {
  return { low: "#3B8ED0", normal: "#4CAF82", high: "#F59E0B", very_high: "#EF4444" }[status];
}

export function glucoseStatusBg(status: GlucoseStatus): string {
  return { low: "#E3F0FB", normal: "#E8F5EE", high: "#FEF3C7", very_high: "#FEE2E2" }[status];
}

export function contextLabel(ctx: string): string {
  const map: Record<string, string> = {
    fasting: "Em Jejum", before_meal: "Pré-refeição",
    after_meal: "Pós-refeição", bedtime: "Antes de dormir", random: "Aleatório",
  };
  return map[ctx] ?? ctx;
}

export function mealTypeLabel(type: MealType): string {
  return { breakfast: "Café da manhã", lunch: "Almoço", dinner: "Jantar", snack: "Lanche" }[type];
}

export function mealTypeIcon(type: MealType): string {
  return { breakfast: "☕", lunch: "🍽️", dinner: "🌙", snack: "🍎" }[type];
}

export function mealTypeColor(type: MealType): string {
  return { breakfast: "#F97316", lunch: "#4CAF82", dinner: "#3B8ED0", snack: "#EC4899" }[type];
}

export function moodLabel(mood: Mood): string {
  return { great: "Ótimo", good: "Bem", okay: "Ok", bad: "Mal", terrible: "Péssimo" }[mood];
}

export function moodEmoji(mood: Mood): string {
  return { great: "😄", good: "😊", okay: "😐", bad: "😔", terrible: "😢" }[mood];
}

export function moodColor(mood: Mood): string {
  return { great: "#4CAF82", good: "#3B8ED0", okay: "#F59E0B", bad: "#EF4444", terrible: "#8B5CF6" }[mood];
}

export function medTypeLabel(type: MedType): string {
  return { oral: "Oral", insulin: "Insulina", supplement: "Suplemento" }[type];
}

export function medTypeBg(type: MedType): string {
  return { oral: "#E8F5EE", insulin: "#EDE9FE", supplement: "#FFF0E5" }[type];
}

export function medTypeColor(type: MedType): string {
  return { oral: "#4CAF82", insulin: "#8B5CF6", supplement: "#F97316" }[type];
}

export function goalCategoryIcon(cat: GoalCategory): string {
  return { glucose: "🩸", weight: "⚖️", exercise: "🏃", water: "💧", sleep: "😴", steps: "👣" }[cat];
}

export function diabetesTypeLabel(type: DiabetesType): string {
  return { type1: "Tipo 1", type2: "Tipo 2", gestational: "Gestacional", prediabetes: "Pré-diabetes" }[type];
}

export function diabetesTypeColor(type: DiabetesType): string {
  return { type1: "#3B8ED0", type2: "#4CAF82", gestational: "#EC4899", prediabetes: "#F59E0B" }[type];
}

export function notifTypeIcon(type: NotifType): string {
  return { glucose: "🩸", meal: "🍽️", medication: "💊", appointment: "📅", tip: "💡", goal: "🎯" }[type];
}

export function notifTypeColor(type: NotifType): string {
  return { glucose: "#EF4444", meal: "#4CAF82", medication: "#8B5CF6", appointment: "#3B8ED0", tip: "#F97316", goal: "#14B8A6" }[type];
}

export function tipCategoryColor(cat: TipCategory): string {
  return { "Exercício": "#4CAF82", "Alimentação": "#F97316", "Emergência": "#EF4444", "Bem-estar": "#8B5CF6" }[cat];
}

export function tipCategoryBg(cat: TipCategory): string {
  return { "Exercício": "#E8F5EE", "Alimentação": "#FFF0E5", "Emergência": "#FEE2E2", "Bem-estar": "#EDE9FE" }[cat];
}

export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function progressPercent(current: number, target: number): number {
  return Math.min(100, Math.round((current / target) * 100));
}

export function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function bmi(weight: number, height: number): string {
  const bmiVal = weight / ((height / 100) ** 2);
  return bmiVal.toFixed(1);
}
