import { GlucoseStatus, GlucoseContext, MealType, MoodType, RiskLevel } from '../types';

export const getGlucoseStatus = (value: number, min = 70, max = 140): GlucoseStatus => {
  if (value < min) return 'low';
  if (value <= max) return 'normal';
  if (value <= 180) return 'high';
  return 'very_high';
};

export const getGlucoseStatusColor = (status: GlucoseStatus) => {
  switch (status) {
    case 'low': return '#3B8ED0';
    case 'normal': return '#4CAF82';
    case 'high': return '#F59E0B';
    case 'very_high': return '#EF4444';
  }
};

export const getGlucoseStatusLabel = (status: GlucoseStatus) => {
  switch (status) {
    case 'low': return 'Baixa';
    case 'normal': return 'Normal';
    case 'high': return 'Alta';
    case 'very_high': return 'Muito Alta';
  }
};

export const getContextLabel = (context: GlucoseContext) => {
  switch (context) {
    case 'fasting': return 'Jejum';
    case 'before_meal': return 'Pré-refeição';
    case 'after_meal': return 'Pós-refeição';
    case 'bedtime': return 'Ao dormir';
    case 'random': return 'Aleatório';
  }
};

export const getMealTypeLabel = (type: MealType) => {
  switch (type) {
    case 'breakfast': return 'Café da Manhã';
    case 'lunch': return 'Almoço';
    case 'dinner': return 'Jantar';
    case 'snack': return 'Lanche';
  }
};

export const getMealTypeIcon = (type: MealType) => {
  switch (type) {
    case 'breakfast': return 'sunrise';
    case 'lunch': return 'sun';
    case 'dinner': return 'moon';
    case 'snack': return 'coffee';
  }
};

export const getMoodLabel = (mood: MoodType) => {
  switch (mood) {
    case 'great': return 'Ótimo';
    case 'good': return 'Bom';
    case 'okay': return 'Regular';
    case 'bad': return 'Ruim';
    case 'terrible': return 'Péssimo';
  }
};

export const getMoodEmoji = (mood: MoodType) => {
  switch (mood) {
    case 'great': return '😄';
    case 'good': return '🙂';
    case 'okay': return '😐';
    case 'bad': return '😔';
    case 'terrible': return '😢';
  }
};

export const getMoodColor = (mood: MoodType) => {
  switch (mood) {
    case 'great': return '#4CAF82';
    case 'good': return '#3B8ED0';
    case 'okay': return '#F59E0B';
    case 'bad': return '#F97316';
    case 'terrible': return '#EF4444';
  }
};

export const getRiskColor = (risk: RiskLevel) => {
  switch (risk) {
    case 'low': return '#4CAF82';
    case 'medium': return '#F59E0B';
    case 'high': return '#EF4444';
  }
};

export const getRiskLabel = (risk: RiskLevel) => {
  switch (risk) {
    case 'low': return 'Baixo Risco';
    case 'medium': return 'Risco Moderado';
    case 'high': return 'Alto Risco';
  }
};

export const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateStr: string, timeStr: string) => {
  return `${formatDate(dateStr)} às ${timeStr}`;
};

export const isToday = (dateStr: string) => {
  return dateStr === '2026-04-06';
};

export const isYesterday = (dateStr: string) => {
  return dateStr === '2026-04-05';
};

export const getRelativeDate = (dateStr: string) => {
  if (isToday(dateStr)) return 'Hoje';
  if (isYesterday(dateStr)) return 'Ontem';
  return formatDate(dateStr);
};

export const getFoodCategoryColor = (category: 'good' | 'moderate' | 'bad') => {
  switch (category) {
    case 'good': return '#4CAF82';
    case 'moderate': return '#F59E0B';
    case 'bad': return '#EF4444';
  }
};

export const getFoodCategoryLabel = (category: 'good' | 'moderate' | 'bad') => {
  switch (category) {
    case 'good': return 'Saudável';
    case 'moderate': return 'Moderado';
    case 'bad': return 'Evitar';
  }
};

export const getGlucoseAverage = (readings: Array<{ value: number }>) => {
  if (readings.length === 0) return 0;
  return Math.round(readings.reduce((sum, r) => sum + r.value, 0) / readings.length);
};

export const getSleepQualityColor = (quality: 'poor' | 'fair' | 'good' | 'excellent') => {
  switch (quality) {
    case 'excellent': return '#4CAF82';
    case 'good': return '#3B8ED0';
    case 'fair': return '#F59E0B';
    case 'poor': return '#EF4444';
  }
};

export const getSleepQualityLabel = (quality: 'poor' | 'fair' | 'good' | 'excellent') => {
  switch (quality) {
    case 'excellent': return 'Excelente';
    case 'good': return 'Boa';
    case 'fair': return 'Regular';
    case 'poor': return 'Ruim';
  }
};
