import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Plus, Sunrise, Sun, Moon, Coffee, Trash2,
  Flame, ChevronRight, TrendingUp,
} from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { RootStackParamList, MealType, MealEntry } from '../../types';
import { getMealTypeLabel, getFoodCategoryColor, getRelativeDate } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  breakfast: <Sunrise size={18} color={Colors.orange} />,
  lunch:     <Sun     size={18} color={Colors.warning} />,
  dinner:    <Moon    size={18} color={Colors.secondary} />,
  snack:     <Coffee  size={18} color={Colors.primary} />,
};
const MEAL_COLORS: Record<MealType, string[]> = {
  breakfast: ['#F97316', '#EA580C'],
  lunch:     ['#F59E0B', '#D97706'],
  dinner:    ['#3B8ED0', '#2563EB'],
  snack:     ['#4CAF82', '#2E9E6B'],
};

const CALORIE_GOAL = 1800;
const CARB_GOAL    = 200;
const PROTEIN_GOAL = 100;
const FAT_GOAL     = 60;

const DATES = ['2026-04-06', '2026-04-05', '2026-04-04'];
const DATE_LABELS = ['Hoje', 'Ontem', 'Anteontem'];

export default function FoodDiaryScreen() {
  const { meals, deleteMeal } = useApp();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(DATES[0]);

  const dayMeals = meals.filter(m => m.date === selectedDate);
  const totalCal  = dayMeals.reduce((s, m) => s + m.totalCalories, 0);
  const totalCarb = dayMeals.reduce((s, m) => s + m.totalCarbs, 0);
  const totalProt = dayMeals.reduce((s, m) => s + m.foods.reduce((a, f) => a + f.protein, 0), 0);
  const totalFat  = dayMeals.reduce((s, m) => s + m.foods.reduce((a, f) => a + f.fat, 0), 0);

  const mealsByType = MEAL_ORDER.reduce<Record<MealType, MealEntry[]>>((acc, t) => {
    acc[t] = dayMeals.filter(m => m.type === t);
    return acc;
  }, { breakfast: [], lunch: [], dinner: [], snack: [] });

  const handleDelete = (id: string) => {
    Alert.alert('Excluir', 'Remover esta refeição?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteMeal(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Diário Alimentar</Text>
            <Text style={styles.headerSub}>Acompanhe sua nutrição</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddFood' as any, { mealType: 'lunch', date: selectedDate })}
          >
            <Plus size={20} color={Colors.orange} />
          </TouchableOpacity>
        </View>

        {/* Date selector */}
        <View style={styles.dateTabs}>
          {DATES.map((d, i) => (
            <TouchableOpacity
              key={d}
              style={[styles.dateTab, selectedDate === d && styles.dateTabActive]}
              onPress={() => setSelectedDate(d)}
            >
              <Text style={[styles.dateTabText, selectedDate === d && styles.dateTabTextActive]}>
                {DATE_LABELS[i]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Macro summary */}
        <Card style={styles.macroCard}>
          <View style={styles.macroHeader}>
            <View style={styles.calorieCircle}>
              <Text style={styles.calValue}>{totalCal}</Text>
              <Text style={styles.calUnit}>kcal</Text>
              <Text style={styles.calMeta}>de {CALORIE_GOAL}</Text>
            </View>
            <View style={styles.macroDetails}>
              {[
                { label: 'Carboidratos', value: totalCarb, goal: CARB_GOAL, color: Colors.warning },
                { label: 'Proteínas',    value: totalProt, goal: PROTEIN_GOAL, color: Colors.primary },
                { label: 'Gorduras',     value: totalFat,  goal: FAT_GOAL,     color: Colors.secondary },
              ].map(m => (
                <View key={m.label} style={styles.macroRow}>
                  <View style={styles.macroLabelRow}>
                    <Text style={styles.macroName}>{m.label}</Text>
                    <Text style={[styles.macroVal, { color: m.color }]}>{m.value}g</Text>
                  </View>
                  <ProgressBar progress={m.value / m.goal} color={m.color} height={5} />
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Meals by type */}
        <View style={styles.mealsSection}>
          {MEAL_ORDER.map(type => {
            const typeMeals = mealsByType[type];
            return (
              <View key={type} style={styles.mealGroup}>
                {/* Meal type header */}
                <View style={styles.mealTypeHeader}>
                  <View style={styles.mealTypeLeft}>
                    {MEAL_ICONS[type]}
                    <Text style={styles.mealTypeName}>{getMealTypeLabel(type)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addMealBtn}
                    onPress={() => navigation.navigate('AddFood' as any, { mealType: type, date: selectedDate })}
                  >
                    <Plus size={14} color={Colors.primary} />
                    <Text style={styles.addMealText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>

                {typeMeals.length === 0 ? (
                  <TouchableOpacity
                    style={styles.emptyMeal}
                    onPress={() => navigation.navigate('AddFood' as any, { mealType: type, date: selectedDate })}
                  >
                    <Text style={styles.emptyMealText}>Toque para registrar {getMealTypeLabel(type).toLowerCase()}</Text>
                  </TouchableOpacity>
                ) : (
                  typeMeals.map(meal => (
                    <Card key={meal.id} style={styles.mealCard} padding={14}>
                      <View style={styles.mealCardHeader}>
                        <LinearGradient
                          colors={MEAL_COLORS[meal.type] as [string, string]}
                          style={styles.mealTimeTag}
                        >
                          <Text style={styles.mealTimeText}>{meal.time}</Text>
                        </LinearGradient>
                        <View style={styles.mealStats}>
                          <View style={styles.mealStat}>
                            <Flame size={12} color={Colors.danger} />
                            <Text style={styles.mealStatText}>{meal.totalCalories} kcal</Text>
                          </View>
                          <Text style={styles.mealStatDot}>·</Text>
                          <Text style={styles.mealStatText}>{meal.totalCarbs}g carbs</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(meal.id)}>
                          <Trash2 size={15} color={Colors.textLight} />
                        </TouchableOpacity>
                      </View>

                      {meal.foods.map(food => (
                        <View key={food.id} style={styles.foodRow}>
                          <View style={[styles.foodDot, { backgroundColor: getFoodCategoryColor(food.category) }]} />
                          <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
                          <Text style={styles.foodPortion}>{food.portion}</Text>
                          <Text style={styles.foodCal}>{food.calories} kcal</Text>
                        </View>
                      ))}

                      {meal.notes && (
                        <Text style={styles.mealNote}>📝 {meal.notes}</Text>
                      )}
                    </Card>
                  ))
                )}
              </View>
            );
          })}
        </View>

        {/* Glycemic load info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <TrendingUp size={18} color={Colors.secondary} />
            <Text style={styles.infoTitle}>Carga Glicêmica do Dia</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoValue, { color: totalCarb < 150 ? Colors.primary : totalCarb < 200 ? Colors.warning : Colors.danger }]}>
                {totalCarb < 150 ? 'Baixa' : totalCarb < 200 ? 'Moderada' : 'Alta'}
              </Text>
              <Text style={styles.infoLabel}>Carga Glicêmica</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoValue, { color: Colors.orange }]}>{totalCarb}g</Text>
              <Text style={styles.infoLabel}>Total de Carbs</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoValue, { color: Colors.secondary }]}>{CARB_GOAL - totalCarb}g</Text>
              <Text style={styles.infoLabel}>Restante</Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  dateTabs: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: BorderRadius.md, padding: 3 },
  dateTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  dateTabActive: { backgroundColor: '#fff' },
  dateTabText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
  dateTabTextActive: { color: Colors.orange, fontWeight: FontWeight.bold },
  macroCard: { margin: Spacing.lg, marginBottom: Spacing.md },
  macroHeader: { flexDirection: 'row', gap: 20 },
  calorieCircle: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 4, borderColor: Colors.orange + '40',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.orangeLight,
  },
  calValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.orange },
  calUnit: { fontSize: FontSize.xs, color: Colors.orange, marginTop: -2 },
  calMeta: { fontSize: 9, color: Colors.textSecondary },
  macroDetails: { flex: 1, gap: 10, justifyContent: 'center' },
  macroRow: { gap: 4 },
  macroLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroName: { fontSize: FontSize.xs, color: Colors.textSecondary },
  macroVal: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  mealsSection: { paddingHorizontal: Spacing.lg },
  mealGroup: { marginBottom: Spacing.lg },
  mealTypeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  mealTypeLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mealTypeName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  addMealBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.full,
  },
  addMealText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  emptyMeal: {
    borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
    borderRadius: BorderRadius.md, paddingVertical: 16, alignItems: 'center',
    backgroundColor: Colors.borderLight,
  },
  emptyMealText: { fontSize: FontSize.sm, color: Colors.textLight },
  mealCard: { marginBottom: Spacing.sm },
  mealCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: 8 },
  mealTimeTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  mealTimeText: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  mealStats: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  mealStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  mealStatText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  mealStatDot: { color: Colors.textLight },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  foodDot: { width: 6, height: 6, borderRadius: 3 },
  foodName: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  foodPortion: { fontSize: FontSize.xs, color: Colors.textLight },
  foodCal: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium, minWidth: 55, textAlign: 'right' },
  mealNote: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 6, fontStyle: 'italic' },
  infoCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  infoTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoItem: { flex: 1, alignItems: 'center' },
  infoValue: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  infoLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  infoDivider: { width: 1, height: 36, backgroundColor: Colors.border },
});
