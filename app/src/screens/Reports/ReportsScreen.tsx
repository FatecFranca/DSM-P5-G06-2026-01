import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import {
  TrendingUp, Activity, Utensils, Moon, Droplets, Calendar, ArrowLeft,
} from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { GlucoseChart } from '../../components/charts/GlucoseChart';
import { ProgressBar } from '../../components/common/ProgressBar';
import { getGlucoseAverage, getSleepQualityLabel, getSleepQualityColor } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const W = Dimensions.get('window').width - 48;
const PERIODS = ['7 dias', '14 dias', '30 dias'] as const;
type Period = typeof PERIODS[number];

export default function ReportsScreen() {
  const { glucoseReadings, meals, sleepEntries, exercises, goals } = useApp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('7 dias');

  const count = period === '7 dias' ? 7 : period === '14 dias' ? 14 : 30;
  const periodReadings = glucoseReadings.slice(0, count * 2);
  const avg = getGlucoseAverage(periodReadings);
  const inRange = periodReadings.filter(r => r.status === 'normal').length;
  const high    = periodReadings.filter(r => r.status === 'high' || r.status === 'very_high').length;
  const low     = periodReadings.filter(r => r.status === 'low').length;
  const total   = periodReadings.length || 1;

  // Bar chart data — glucose by day of week
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const barData = weekDays.map((d, i) => {
    const dayReadings = glucoseReadings.filter((_, idx) => idx % 7 === i);
    return { label: d, value: getGlucoseAverage(dayReadings) || Math.floor(90 + Math.random() * 60) };
  });
  const maxBar = Math.max(...barData.map(b => b.value));
  const barH = 100;
  const barW = (W - 24) / barData.length - 6;

  // Sleep average
  const avgSleep = sleepEntries.length > 0
    ? (sleepEntries.slice(0, 7).reduce((s, e) => s + e.duration, 0) / Math.min(sleepEntries.length, 7)).toFixed(1)
    : '0';

  // Exercise total
  const totalExerciseMin = exercises.slice(0, count).reduce((s, e) => s + e.duration, 0);
  const totalExerciseCal = exercises.slice(0, count).reduce((s, e) => s + e.calories, 0);

  // Meal quality
  const allFoods = meals.flatMap(m => m.foods);
  const goodFoods     = allFoods.filter(f => f.category === 'good').length;
  const moderateFoods = allFoods.filter(f => f.category === 'moderate').length;
  const badFoods      = allFoods.filter(f => f.category === 'bad').length;
  const totalFoods    = allFoods.length || 1;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Relatórios</Text>
            <Text style={styles.headerSub}>Análise detalhada da sua saúde</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Glucose summary */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Glicose — {period}</Text>
          </View>

          <View style={styles.summaryGrid}>
            {[
              { label: 'Média', value: `${avg}`, unit: 'mg/dL', color: Colors.primary },
              { label: 'No alvo', value: `${Math.round((inRange / total) * 100)}%`, unit: `${inRange} leit.`, color: Colors.success },
              { label: 'Alta', value: `${high}`, unit: 'leituras', color: Colors.warning },
              { label: 'Baixa', value: `${low}`, unit: 'leituras', color: Colors.secondary },
            ].map(s => (
              <View key={s.label} style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryUnit}>{s.unit}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Time-in-range bar */}
          <View style={styles.tirSection}>
            <Text style={styles.tirTitle}>Tempo no Alvo (TIR)</Text>
            <View style={styles.tirBar}>
              <View style={[styles.tirSegment, { flex: inRange, backgroundColor: Colors.primary }]} />
              <View style={[styles.tirSegment, { flex: high, backgroundColor: Colors.warning }]} />
              <View style={[styles.tirSegment, { flex: low, backgroundColor: Colors.secondary }]} />
              {total - inRange - high - low > 0 && (
                <View style={[styles.tirSegment, { flex: total - inRange - high - low, backgroundColor: Colors.border }]} />
              )}
            </View>
            <View style={styles.tirLegend}>
              {[
                { color: Colors.primary, label: `No alvo ${Math.round((inRange / total) * 100)}%` },
                { color: Colors.warning, label: `Alta ${Math.round((high / total) * 100)}%` },
                { color: Colors.secondary, label: `Baixa ${Math.round((low / total) * 100)}%` },
              ].map(l => (
                <View key={l.label} style={styles.tirLegendItem}>
                  <View style={[styles.tirDot, { backgroundColor: l.color }]} />
                  <Text style={styles.tirLegendText}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {periodReadings.length > 1 && <GlucoseChart data={periodReadings} height={160} />}
        </Card>

        {/* Bar chart by weekday */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Média por Dia da Semana</Text>
          </View>
          <Svg width={W} height={barH + 30}>
            {barData.map((b, i) => {
              const barHeight = (b.value / maxBar) * barH;
              const x = 12 + i * ((W - 24) / barData.length);
              const color = b.value > 140 ? Colors.warning : b.value < 70 ? Colors.secondary : Colors.primary;
              return (
                <G key={b.label}>
                  <Rect
                    x={x} y={barH - barHeight}
                    width={barW} height={barHeight}
                    rx={4} fill={color + 'CC'}
                  />
                  <SvgText x={x + barW / 2} y={barH + 18} textAnchor="middle" fontSize={10} fill={Colors.textSecondary}>
                    {b.label}
                  </SvgText>
                  <SvgText x={x + barW / 2} y={barH - barHeight - 4} textAnchor="middle" fontSize={9} fill={color} fontWeight="700">
                    {b.value}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Card>

        {/* Nutrition */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Utensils size={18} color={Colors.orange} />
            <Text style={styles.sectionTitle}>Qualidade Alimentar</Text>
          </View>
          <View style={styles.nutRow}>
            {[
              { label: 'Saudável', count: goodFoods, color: Colors.primary },
              { label: 'Moderado', count: moderateFoods, color: Colors.warning },
              { label: 'Evitar', count: badFoods, color: Colors.danger },
            ].map(n => (
              <View key={n.label} style={styles.nutItem}>
                <View style={[styles.nutCircle, { backgroundColor: n.color + '20' }]}>
                  <Text style={[styles.nutValue, { color: n.color }]}>{Math.round((n.count / totalFoods) * 100)}%</Text>
                </View>
                <Text style={styles.nutLabel}>{n.label}</Text>
                <Text style={styles.nutCount}>{n.count} itens</Text>
              </View>
            ))}
          </View>
          <ProgressBar
            progress={goodFoods / totalFoods}
            color={Colors.primary}
            height={8}
            showLabel
            label="Índice de qualidade alimentar"
          />
        </Card>

        {/* Exercise */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color={Colors.purple} />
            <Text style={styles.sectionTitle}>Exercícios — {period}</Text>
          </View>
          <View style={styles.exerciseStats}>
            <View style={styles.exStat}>
              <Text style={[styles.exValue, { color: Colors.purple }]}>{totalExerciseMin}</Text>
              <Text style={styles.exUnit}>minutos</Text>
              <Text style={styles.exLabel}>Tempo total</Text>
            </View>
            <View style={styles.exDivider} />
            <View style={styles.exStat}>
              <Text style={[styles.exValue, { color: Colors.orange }]}>{totalExerciseCal}</Text>
              <Text style={styles.exUnit}>kcal</Text>
              <Text style={styles.exLabel}>Calorias gastas</Text>
            </View>
            <View style={styles.exDivider} />
            <View style={styles.exStat}>
              <Text style={[styles.exValue, { color: Colors.primary }]}>{exercises.slice(0, count).length}</Text>
              <Text style={styles.exUnit}>sessões</Text>
              <Text style={styles.exLabel}>Atividades</Text>
            </View>
          </View>
          <ProgressBar
            progress={Math.min(totalExerciseMin / (count * 21.4), 1)}
            color={Colors.purple}
            height={8}
            showLabel
            label="Meta: 150 min/semana"
          />
        </Card>

        {/* Sleep */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Moon size={18} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Sono — 7 últimas noites</Text>
          </View>
          <View style={styles.sleepMain}>
            <View style={styles.sleepAvg}>
              <Text style={[styles.sleepAvgValue, { color: parseFloat(avgSleep) >= 7 ? Colors.primary : Colors.warning }]}>
                {avgSleep}h
              </Text>
              <Text style={styles.sleepAvgLabel}>média/noite</Text>
            </View>
            <View style={styles.sleepBars}>
              {sleepEntries.slice(0, 7).map((entry, i) => {
                const barHt = (entry.duration / 10) * 60;
                const color = getSleepQualityColor(entry.quality);
                return (
                  <View key={entry.id} style={styles.sleepBarWrap}>
                    <View style={[styles.sleepBar, { height: barHt, backgroundColor: color }]} />
                    <Text style={styles.sleepBarLabel}>{entry.date.slice(8)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Quality distribution */}
          <View style={styles.sleepQualRow}>
            {(['excellent', 'good', 'fair', 'poor'] as const).map(q => {
              const count = sleepEntries.slice(0, 7).filter(e => e.quality === q).length;
              return (
                <View key={q} style={styles.sleepQualItem}>
                  <View style={[styles.sleepQualDot, { backgroundColor: getSleepQualityColor(q) }]} />
                  <Text style={styles.sleepQualLabel}>{getSleepQualityLabel(q)}: {count}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Goals progress */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={18} color={Colors.teal} />
            <Text style={styles.sectionTitle}>Progresso das Metas</Text>
          </View>
          {goals.map(goal => (
            <View key={goal.id} style={styles.goalRow}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={[styles.goalPct, { color: goal.color }]}>
                  {Math.min(Math.round((goal.current / goal.target) * 100), 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={Math.min(goal.current / goal.target, 1)}
                color={goal.color}
                height={6}
              />
              <Text style={styles.goalDetail}>{goal.current} / {goal.target} {goal.unit}</Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  backBtn: { width: 36 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginBottom: Spacing.lg },
  periodRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: BorderRadius.md, padding: 3 },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  periodBtnActive: { backgroundColor: '#fff' },
  periodText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
  periodTextActive: { color: Colors.purple, fontWeight: FontWeight.bold },
  content: { padding: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  summaryGrid: { flexDirection: 'row', marginBottom: Spacing.lg },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  summaryUnit: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  tirSection: { marginBottom: Spacing.md },
  tirTitle: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium, marginBottom: 8 },
  tirBar: { flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  tirSegment: { height: '100%' },
  tirLegend: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  tirLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tirDot: { width: 8, height: 8, borderRadius: 4 },
  tirLegendText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  nutRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  nutItem: { alignItems: 'center' },
  nutCircle: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  nutValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  nutLabel: { fontSize: FontSize.xs, color: Colors.text, fontWeight: FontWeight.medium },
  nutCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  exerciseStats: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  exStat: { flex: 1, alignItems: 'center' },
  exValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  exUnit: { fontSize: FontSize.xs, color: Colors.textSecondary },
  exLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  exDivider: { width: 1, height: 48, backgroundColor: Colors.border },
  sleepMain: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginBottom: Spacing.md },
  sleepAvg: { alignItems: 'center' },
  sleepAvgValue: { fontSize: 36, fontWeight: FontWeight.extrabold },
  sleepAvgLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sleepBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 60 },
  sleepBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  sleepBar: { width: '100%', borderRadius: 3, minHeight: 8 },
  sleepBarLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 3 },
  sleepQualRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sleepQualItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sleepQualDot: { width: 8, height: 8, borderRadius: 4 },
  sleepQualLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  goalRow: { marginBottom: Spacing.md },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  goalTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  goalPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  goalDetail: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3 },
});
