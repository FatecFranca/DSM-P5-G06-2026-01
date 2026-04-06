import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Activity, Utensils, BookOpen, Droplets, Pill, Target,
  Bell, ChevronRight, Plus, TrendingUp, Moon, Dumbbell, Heart,
} from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { GlucoseStatusBadge } from '../../components/common/GlucoseStatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { GlucoseChart } from '../../components/charts/GlucoseChart';
import { RootStackParamList } from '../../types';
import { getRelativeDate, getMealTypeLabel, getMoodEmoji } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { user, glucoseReadings, meals, journals, medications, getTodayWater, goals, unreadNotificationsCount } = useApp();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const today = '2026-04-06';
  const todayReadings = glucoseReadings.filter(r => r.date === today);
  const lastReading = todayReadings[0] || glucoseReadings[0];
  const todayMeals = meals.filter(m => m.date === today);
  const todayCalories = todayMeals.reduce((s, m) => s + m.totalCalories, 0);
  const todayCarbs = todayMeals.reduce((s, m) => s + m.totalCarbs, 0);
  const waterMl = getTodayWater();
  const waterGoal = 2500;
  const todayMeds = medications.filter(m => !m.taken).length;
  const lastJournal = journals[0];
  const recentReadings = glucoseReadings.slice(0, 7);
  const glucoseGoal = goals.find(g => g.category === 'glucose');

  const quickActions = [
    { icon: <Activity size={22} color={Colors.primary} />, label: 'Glicose', color: Colors.primaryLight, onPress: () => navigation.navigate('AddGlucose' as any) },
    { icon: <Utensils size={22} color={Colors.secondary} />, label: 'Refeição', color: Colors.secondaryLight, onPress: () => {} },
    { icon: <Droplets size={22} color={Colors.teal} />, label: 'Água', color: Colors.tealLight, onPress: () => {} },
    { icon: <Pill size={22} color={Colors.purple} />, label: 'Medicação', color: Colors.purpleLight, onPress: () => {} },
  ];

  const getTimeOfDay = () => {
    const h = 14;
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getOverallStatus = () => {
    if (!lastReading) return { label: 'Sem dados', color: Colors.textSecondary };
    if (lastReading.status === 'normal') return { label: 'Bom Controle ✓', color: Colors.success };
    if (lastReading.status === 'high' || lastReading.status === 'very_high') return { label: 'Atenção!', color: Colors.warning };
    return { label: 'Verificar', color: Colors.secondary };
  };

  const status = getOverallStatus();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <LinearGradient
          colors={['#4CAF82', '#2E9E6B']}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getTimeOfDay()},</Text>
              <Text style={styles.userName}>{user.name.split(' ')[0]} 👋</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} onPress={() => {}}>
              <Bell size={22} color="#fff" />
              {unreadNotificationsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusLabel}>Status do dia</Text>
              <Text style={[styles.statusValue, { color: status.color }]}>{status.label}</Text>
              <Text style={styles.statusSub}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
            </View>
            <View style={styles.statusRight}>
              <View style={styles.hbaWrap}>
                <Text style={styles.hbaLabel}>HbA1c</Text>
                <Text style={styles.hbaValue}>6.8%</Text>
                <Text style={styles.hbaGood}>Bom ✓</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {quickActions.map((action, i) => (
              <TouchableOpacity key={i} style={[styles.quickAction, { backgroundColor: action.color }]} onPress={action.onPress}>
                {action.icon}
                <Text style={styles.quickLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Last Glucose */}
          {lastReading && (
            <Card style={styles.glucoseCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Activity size={18} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Última Glicose</Text>
                </View>
                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.seeAll}>Ver tudo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.glucoseMain}>
                <View>
                  <Text style={styles.glucoseValue}>{lastReading.value}</Text>
                  <Text style={styles.glucoseUnit}>mg/dL</Text>
                </View>
                <View style={styles.glucoseRight}>
                  <GlucoseStatusBadge status={lastReading.status} />
                  <Text style={styles.glucoseTime}>{getRelativeDate(lastReading.date)} • {lastReading.time}</Text>
                  <Text style={styles.glucoseCtx}>{lastReading.context === 'fasting' ? 'Em jejum' : 'Pós-refeição'}</Text>
                </View>
              </View>

              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Meta: {user.targetGlucoseMin}-{user.targetGlucoseMax} mg/dL</Text>
                <ProgressBar
                  progress={Math.min(lastReading.value / user.targetGlucoseMax, 1)}
                  color={lastReading.status === 'normal' ? Colors.primary : Colors.warning}
                  height={6}
                />
              </View>

              {recentReadings.length > 1 && (
                <View style={{ marginTop: 16 }}>
                  <GlucoseChart data={recentReadings} height={120} compact />
                </View>
              )}
            </Card>
          )}

          {/* Today's Meals */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Utensils size={18} color={Colors.secondary} />
                <Text style={styles.sectionTitle}>Alimentação Hoje</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Ver tudo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{todayCalories}</Text>
                <Text style={styles.macroLabel}>kcal</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{todayCarbs}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{todayMeals.length}</Text>
                <Text style={styles.macroLabel}>Refeições</Text>
              </View>
            </View>

            {todayMeals.slice(0, 2).map(meal => (
              <View key={meal.id} style={styles.mealRow}>
                <Text style={styles.mealType}>{getMealTypeLabel(meal.type)}</Text>
                <Text style={styles.mealCal}>{meal.totalCalories} kcal</Text>
              </View>
            ))}

            {todayMeals.length === 0 && (
              <Text style={styles.emptyText}>Nenhuma refeição registrada hoje</Text>
            )}
          </Card>

          {/* Water & Medications Row */}
          <View style={styles.row}>
            <Card style={StyleSheet.flatten([styles.halfCard, { marginRight: 8 }])}>
              <View style={styles.halfHeader}>
                <Droplets size={18} color={Colors.teal} />
                <Text style={styles.halfTitle}>Hidratação</Text>
              </View>
              <Text style={styles.halfValue}>{(waterMl / 1000).toFixed(1)}L</Text>
              <Text style={styles.halfSub}>de {waterGoal / 1000}L</Text>
              <View style={{ marginTop: 8 }}>
                <ProgressBar progress={waterMl / waterGoal} color={Colors.teal} height={6} />
              </View>
            </Card>

            <Card style={StyleSheet.flatten([styles.halfCard, { marginLeft: 8 }])}>
              <View style={styles.halfHeader}>
                <Pill size={18} color={Colors.purple} />
                <Text style={styles.halfTitle}>Medicações</Text>
              </View>
              <Text style={styles.halfValue}>{medications.filter(m => m.taken).length}</Text>
              <Text style={styles.halfSub}>de {medications.length} tomadas</Text>
              <View style={{ marginTop: 8 }}>
                <ProgressBar
                  progress={medications.filter(m => m.taken).length / medications.length}
                  color={Colors.purple} height={6}
                />
              </View>
            </Card>
          </View>

          {/* Goals */}
          {glucoseGoal && (
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Target size={18} color={Colors.orange} />
                  <Text style={styles.sectionTitle}>Metas do Mês</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver todas</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{glucoseGoal.title}</Text>
                  <Text style={[styles.goalPct, { color: Colors.orange }]}>
                    {Math.round((glucoseGoal.current / glucoseGoal.target) * 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={glucoseGoal.current / glucoseGoal.target}
                  color={Colors.orange} height={8}
                />
                <Text style={styles.goalSub}>{glucoseGoal.current} / {glucoseGoal.target} {glucoseGoal.unit}</Text>
              </View>
            </Card>
          )}

          {/* Last Journal */}
          {lastJournal && (
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <BookOpen size={18} color={Colors.pink} />
                  <Text style={styles.sectionTitle}>Último Diário</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Ver tudo</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.journalCard}>
                <Text style={styles.journalEmoji}>{getMoodEmoji(lastJournal.mood)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.journalTitle}>{lastJournal.title}</Text>
                  <Text style={styles.journalContent} numberOfLines={2}>{lastJournal.content}</Text>
                  <Text style={styles.journalDate}>{getRelativeDate(lastJournal.date)}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* Health Tips Banner */}
          <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.tipBanner}>
            <Heart size={24} color="#fff" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.tipTitle}>Dica do Dia</Text>
              <Text style={styles.tipText}>Caminhadas de 30 min após refeições reduzem a glicose em até 30%!</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: Colors.danger, width: 18, height: 18,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: FontWeight.bold },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {},
  statusLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  statusValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, marginBottom: 2 },
  statusSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },
  statusRight: {},
  hbaWrap: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: BorderRadius.md },
  hbaLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  hbaValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff' },
  hbaGood: { fontSize: FontSize.xs, color: '#fff', marginTop: 2 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  quickAction: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: BorderRadius.md, marginHorizontal: 4,
  },
  quickLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.text, marginTop: 6 },
  glucoseCard: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  glucoseMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  glucoseValue: { fontSize: 48, fontWeight: FontWeight.extrabold, color: Colors.text, lineHeight: 52 },
  glucoseUnit: { fontSize: FontSize.sm, color: Colors.textSecondary },
  glucoseRight: { alignItems: 'flex-end', gap: 6 },
  glucoseTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  glucoseCtx: { fontSize: FontSize.xs, color: Colors.textLight },
  targetRow: { gap: 6 },
  targetLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  section: { marginBottom: Spacing.lg },
  macroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  macroItem: { flex: 1, alignItems: 'center' },
  macroValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  macroLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  macroDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  mealType: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium },
  mealCal: { fontSize: FontSize.sm, color: Colors.textSecondary },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 8 },
  row: { flexDirection: 'row', marginBottom: Spacing.lg },
  halfCard: { flex: 1 },
  halfHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  halfTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  halfValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text },
  halfSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  goalItem: { gap: 6 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  goalTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  goalPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  goalSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  journalCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  journalEmoji: { fontSize: 32 },
  journalTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 4 },
  journalContent: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  journalDate: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 4 },
  tipBanner: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg,
  },
  tipTitle: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.sm, marginBottom: 2 },
  tipText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.xs, lineHeight: 18 },
});
