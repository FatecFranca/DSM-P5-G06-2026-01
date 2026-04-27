import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline, Line, Text as SvgText, Circle, Rect, G } from 'react-native-svg';
import {
  TrendingUp, Activity, Utensils, Moon, ArrowLeft, Target, Dumbbell,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { getSleepQualityColor, getSleepQualityLabel } from '../../utils/helpers';
import {
  apiEstatisticasGlicose, apiTendenciaGlicose, apiEstatisticasSono,
  ApiGlicoseEstatisticas, ApiTendenciaGlicose, ApiEstatisticasSono,
} from '../../services/api';

// ─── Constantes ───────────────────────────────────────────────────────────────

const W = Dimensions.get('window').width - 48;
const PERIODS = ['7 dias', '14 dias', '30 dias'] as const;
type Period = typeof PERIODS[number];

function periodDays(p: Period) {
  return p === '7 dias' ? 7 : p === '14 dias' ? 14 : 30;
}

function getPeriodDates(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    dataInicio: start.toISOString().split('T')[0],
    dataFim: end.toISOString().split('T')[0],
  };
}

function dateShort(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// ─── Mini line chart ──────────────────────────────────────────────────────────

function TrendChart({ data }: { data: ApiTendenciaGlicose[] }) {
  if (data.length < 2) {
    return (
      <View style={{ height: 120, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: Colors.textLight, fontSize: FontSize.sm }}>Sem dados suficientes</Text>
      </View>
    );
  }
  const cw = W - 8;
  const ch = 110;
  const padX = 28;
  const padY = 14;
  const iw = cw - padX * 2;
  const ih = ch - padY * 2;

  const allVals = data.flatMap(d => [d.min, d.media, d.max]);
  const minV = Math.min(...allVals, 60);
  const maxV = Math.max(...allVals, 200);
  const range = maxV - minV || 1;

  function x(i: number) { return padX + (i / (data.length - 1)) * iw; }
  function y(v: number) { return padY + ih - ((v - minV) / range) * ih; }

  const avgPoints = data.map((d, i) => `${x(i)},${y(d.media)}`).join(' ');
  const maxPoints = data.map((d, i) => `${x(i)},${y(d.max)}`).join(' ');

  return (
    <Svg width={cw} height={ch}>
      {/* Reference lines */}
      <Line x1={padX} y1={y(70)} x2={cw - padX} y2={y(70)} stroke="#3B8ED020" strokeWidth={1} strokeDasharray="4 3" />
      <Line x1={padX} y1={y(140)} x2={cw - padX} y2={y(140)} stroke="#F97316" strokeWidth={1} strokeDasharray="4 3" strokeOpacity={0.4} />

      {/* Max line (dashed) */}
      <Polyline points={maxPoints} fill="none" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 3" strokeOpacity={0.7} />
      {/* Avg line */}
      <Polyline points={avgPoints} fill="none" stroke={Colors.primary} strokeWidth={2.5} />

      {/* Dots on avg */}
      {data.map((d, i) => (
        <Circle key={i} cx={x(i)} cy={y(d.media)} r={3} fill={Colors.primary} />
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        i % Math.max(1, Math.floor(data.length / 5)) === 0 ? (
          <SvgText key={i} x={x(i)} y={ch - 2} textAnchor="middle" fontSize={9} fill={Colors.textLight}>
            {dateShort(d.data)}
          </SvgText>
        ) : null
      ))}
    </Svg>
  );
}

// ─── Bar chart (média por dia) ────────────────────────────────────────────────

function WeekBarsChart({ data }: { data: ApiTendenciaGlicose[] }) {
  if (data.length === 0) return null;
  const bw = W - 8;
  const bh = 120;
  const padX = 4;
  const padY = 20;
  const maxV = Math.max(...data.map(d => d.media), 1);
  const barW = Math.max(4, (bw - padX * 2) / data.length - 4);

  return (
    <Svg width={bw} height={bh + 18}>
      {data.map((d, i) => {
        const barH = ((d.media / maxV) * (bh - padY));
        const cx = padX + i * ((bw - padX * 2) / data.length) + barW / 2;
        const barColor = d.media > 140 ? Colors.warning : d.media < 70 ? Colors.secondary : Colors.primary;
        return (
          <G key={i}>
            <Rect
              x={cx - barW / 2}
              y={bh - barH}
              width={barW}
              height={barH}
              rx={3}
              fill={barColor + 'CC'}
            />
            <SvgText x={cx} y={bh - barH - 4} textAnchor="middle" fontSize={9} fill={barColor} fontWeight="700">
              {Math.round(d.media)}
            </SvgText>
            <SvgText x={cx} y={bh + 14} textAnchor="middle" fontSize={9} fill={Colors.textLight}>
              {dateShort(d.data)}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export default function ReportsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { exercises, meals, sleepEntries, goals } = useApp();
  const [period, setPeriod] = useState<Period>('7 dias');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [glicoseStats, setGlicoseStats] = useState<ApiGlicoseEstatisticas | null>(null);
  const [tendencia, setTendencia] = useState<ApiTendenciaGlicose[]>([]);
  const [sonoStats, setSonoStats] = useState<ApiEstatisticasSono | null>(null);

  async function loadData(isRefresh = false) {
    if (!isRefresh) setLoading(true);
    const days = periodDays(period);
    const { dataInicio, dataFim } = getPeriodDates(days);
    try {
      const [gs, tr, ss] = await Promise.all([
        apiEstatisticasGlicose(dataInicio, dataFim),
        apiTendenciaGlicose(dataInicio, dataFim),
        apiEstatisticasSono(),
      ]);
      setGlicoseStats(gs);
      setTendencia(tr);
      setSonoStats(ss);
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { loadData(); }, []));

  useEffect(() => { if (!loading) loadData(); }, [period]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData(true);
  }

  // ─── Derivations ─────────────────────────────────────────────────────────
  const days = periodDays(period);
  const { dataInicio } = getPeriodDates(days);

  const periodExercises = exercises.filter(e => e.date >= dataInicio);
  const totalExMin = periodExercises.reduce((s, e) => s + e.duration, 0);
  const totalExCal = periodExercises.reduce((s, e) => s + e.calories, 0);
  const goalMinPerWeek = 150;
  const weeksInPeriod = days / 7;
  const exGoalProgress = Math.min(totalExMin / (goalMinPerWeek * weeksInPeriod), 1);

  const periodMeals = meals.filter(m => m.date >= dataInicio);
  const allFoods = periodMeals.flatMap(m => m.foods);
  const totalFoods = allFoods.length || 1;
  const goodFoods = allFoods.filter(f => f.category === 'good').length;
  const modFoods  = allFoods.filter(f => f.category === 'moderate').length;
  const badFoods  = allFoods.filter(f => f.category === 'bad').length;

  const sleepLast7 = sleepEntries.slice(0, 7);
  const avgSleep = sleepLast7.length > 0
    ? (sleepLast7.reduce((s, e) => s + e.duration, 0) / sleepLast7.length)
    : 0;

  const sonoQual: Record<string, number> = sonoStats?.distribuicaoQualidade ?? {};
  const sonoQualApp: Record<string, number> = {
    excellent: sonoQual['EXCELENTE'] ?? 0,
    good:      sonoQual['BOA'] ?? 0,
    fair:      sonoQual['RUIM'] ?? 0,
    poor:      sonoQual['PESSIMA'] ?? 0,
  };

  const pct = glicoseStats?.percentual;
  const normalPct = Math.round(pct?.normal ?? 0);
  const altoPct   = Math.round(pct?.alto ?? 0);
  const baixoPct  = Math.round(pct?.baixo ?? 0);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={[s.header, { paddingTop: insets.top + 16 }]}>
        <View style={s.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.headerTitle}>Relatórios</Text>
            <Text style={s.headerSub}>Análise detalhada da sua saúde</Text>
          </View>
        </View>
        <View style={s.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[s.periodBtn, period === p && s.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.periodText, period === p && s.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={s.loadingText}>Carregando dados...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />}
        >

          {/* ── Glicose ── */}
          <Card style={s.section}>
            <View style={s.sectionHeader}>
              <Activity size={18} color={Colors.primary} />
              <Text style={s.sectionTitle}>Glicose — {period}</Text>
              <Text style={s.sectionCount}>{glicoseStats?.total ?? 0} leituras</Text>
            </View>

            <View style={s.kpiRow}>
              {[
                { label: 'Média', value: glicoseStats ? `${Math.round(glicoseStats.media)}` : '—', unit: 'mg/dL', color: Colors.primary },
                { label: 'No alvo', value: `${normalPct}%`, unit: 'tempo no alvo', color: Colors.success },
                { label: 'Alta', value: `${altoPct}%`, unit: 'leituras', color: Colors.warning },
                { label: 'Baixa', value: `${baixoPct}%`, unit: 'leituras', color: Colors.secondary },
              ].map(k => (
                <View key={k.label} style={s.kpiItem}>
                  <Text style={[s.kpiValue, { color: k.color }]}>{k.value}</Text>
                  <Text style={s.kpiUnit}>{k.unit}</Text>
                  <Text style={s.kpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>

            {/* TIR bar */}
            <View style={s.tirWrap}>
              <Text style={s.tirTitle}>Tempo no Alvo (TIR)</Text>
              <View style={s.tirBar}>
                <View style={[s.tirSeg, { flex: Math.max(normalPct, 1), backgroundColor: Colors.primary }]} />
                <View style={[s.tirSeg, { flex: Math.max(altoPct, 1), backgroundColor: Colors.warning }]} />
                <View style={[s.tirSeg, { flex: Math.max(baixoPct, 1), backgroundColor: Colors.secondary }]} />
              </View>
              <View style={s.tirLegend}>
                {[
                  { color: Colors.primary,   label: `No alvo ${normalPct}%` },
                  { color: Colors.warning,   label: `Alta ${altoPct}%` },
                  { color: Colors.secondary, label: `Baixa ${baixoPct}%` },
                ].map(l => (
                  <View key={l.label} style={s.tirLegendItem}>
                    <View style={[s.tirDot, { backgroundColor: l.color }]} />
                    <Text style={s.tirLegendText}>{l.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Trend line chart */}
            {tendencia.length > 1 && (
              <View style={{ marginTop: 12 }}>
                <Text style={s.chartLabel}>Tendência — média/máx</Text>
                <TrendChart data={tendencia} />
                <View style={s.chartLegend}>
                  <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: Colors.primary }]} /><Text style={s.legendText}>Média</Text></View>
                  <View style={s.legendItem}><View style={[s.legendDot, { backgroundColor: '#F59E0B' }]} /><Text style={s.legendText}>Máxima</Text></View>
                </View>
              </View>
            )}

            {/* Bar chart por dia */}
            {tendencia.length > 1 && (
              <View style={{ marginTop: 16 }}>
                <Text style={s.chartLabel}>Média por dia</Text>
                <WeekBarsChart data={tendencia} />
              </View>
            )}
          </Card>

          {/* ── Exercícios ── */}
          <Card style={s.section}>
            <View style={s.sectionHeader}>
              <Dumbbell size={18} color="#8B5CF6" />
              <Text style={s.sectionTitle}>Exercícios — {period}</Text>
              <Text style={s.sectionCount}>{periodExercises.length} sessões</Text>
            </View>
            <View style={s.statRow}>
              <View style={s.stat}>
                <Text style={[s.statValue, { color: '#8B5CF6' }]}>
                  {totalExMin >= 60 ? `${(totalExMin / 60).toFixed(1)}h` : `${totalExMin}min`}
                </Text>
                <Text style={s.statUnit}>tempo total</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.stat}>
                <Text style={[s.statValue, { color: Colors.orange }]}>{totalExCal.toLocaleString('pt-BR')}</Text>
                <Text style={s.statUnit}>kcal gastas</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.stat}>
                <Text style={[s.statValue, { color: Colors.primary }]}>{periodExercises.length}</Text>
                <Text style={s.statUnit}>sessões</Text>
              </View>
            </View>
            <ProgressBar
              progress={exGoalProgress}
              color="#8B5CF6"
              height={8}
              showLabel
              label={`Meta: ${goalMinPerWeek} min/semana`}
            />
          </Card>

          {/* ── Sono ── */}
          <Card style={s.section}>
            <View style={s.sectionHeader}>
              <Moon size={18} color={Colors.secondary} />
              <Text style={s.sectionTitle}>Sono — últimas 7 noites</Text>
              <Text style={s.sectionCount}>{sonoStats?.total ?? sleepLast7.length} registros</Text>
            </View>

            <View style={s.sleepMain}>
              <View style={s.sleepAvgWrap}>
                <Text style={[s.sleepAvgValue, { color: avgSleep >= 7 ? Colors.primary : Colors.warning }]}>
                  {avgSleep.toFixed(1)}h
                </Text>
                <Text style={s.sleepAvgLabel}>média/noite</Text>
              </View>
              <View style={s.sleepBars}>
                {sleepLast7.length === 0 ? (
                  <Text style={{ fontSize: FontSize.xs, color: Colors.textLight }}>Sem dados</Text>
                ) : sleepLast7.map(entry => {
                  const barH = Math.max(8, (entry.duration / 10) * 60);
                  const color = getSleepQualityColor(entry.quality);
                  return (
                    <View key={entry.id} style={s.sleepBarWrap}>
                      <View style={[s.sleepBar, { height: barH, backgroundColor: color }]} />
                      <Text style={s.sleepBarLabel}>{entry.date.slice(8)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={s.sleepQualRow}>
              {(['excellent', 'good', 'fair', 'poor'] as const).map(q => (
                <View key={q} style={s.sleepQualItem}>
                  <View style={[s.sleepQualDot, { backgroundColor: getSleepQualityColor(q) }]} />
                  <Text style={s.sleepQualText}>{getSleepQualityLabel(q)}: {sonoQualApp[q]}</Text>
                </View>
              ))}
            </View>

            {sonoStats && (
              <View style={s.sonoMeta}>
                <Text style={s.sonoMetaText}>
                  Duração média (backend): <Text style={{ fontWeight: FontWeight.bold, color: sonoStats.mediaDuracao >= 7 ? Colors.primary : Colors.warning }}>{sonoStats.mediaDuracao}h</Text>
                </Text>
              </View>
            )}
          </Card>

          {/* ── Alimentação ── */}
          <Card style={s.section}>
            <View style={s.sectionHeader}>
              <Utensils size={18} color={Colors.orange} />
              <Text style={s.sectionTitle}>Qualidade Alimentar — {period}</Text>
              <Text style={s.sectionCount}>{totalFoods === 1 && allFoods.length === 0 ? 0 : allFoods.length} itens</Text>
            </View>
            <View style={s.nutRow}>
              {[
                { label: 'Saudável', count: goodFoods, color: Colors.primary },
                { label: 'Moderado', count: modFoods,  color: Colors.warning },
                { label: 'Evitar',  count: badFoods,   color: Colors.danger },
              ].map(n => (
                <View key={n.label} style={s.nutItem}>
                  <View style={[s.nutCircle, { backgroundColor: n.color + '20' }]}>
                    <Text style={[s.nutPct, { color: n.color }]}>
                      {allFoods.length > 0 ? Math.round((n.count / totalFoods) * 100) : 0}%
                    </Text>
                  </View>
                  <Text style={s.nutLabel}>{n.label}</Text>
                  <Text style={s.nutCount}>{n.count} itens</Text>
                </View>
              ))}
            </View>
            <ProgressBar
              progress={allFoods.length > 0 ? goodFoods / totalFoods : 0}
              color={Colors.primary}
              height={8}
              showLabel
              label="Índice de qualidade alimentar"
            />
          </Card>

          {/* ── Metas ── */}
          {goals.length > 0 && (
            <Card style={s.section}>
              <View style={s.sectionHeader}>
                <Target size={18} color={Colors.teal} />
                <Text style={s.sectionTitle}>Progresso das Metas</Text>
                <Text style={s.sectionCount}>{goals.filter(g => g.completed).length}/{goals.length} concluídas</Text>
              </View>
              {goals.map(goal => {
                const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                return (
                  <View key={goal.id} style={s.goalRow}>
                    <View style={s.goalHeader}>
                      <Text style={s.goalTitle} numberOfLines={1}>{goal.title}</Text>
                      <Text style={[s.goalPct, { color: goal.color }]}>{pct}%</Text>
                    </View>
                    <ProgressBar progress={Math.min(goal.current / goal.target, 1)} color={goal.color} height={6} />
                    <Text style={s.goalDetail}>{goal.current} / {goal.target} {goal.unit}</Text>
                  </View>
                );
              })}
            </Card>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  periodRow: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: BorderRadius.md, padding: 3 },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: BorderRadius.sm },
  periodBtnActive: { backgroundColor: '#fff' },
  periodText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: FontWeight.medium },
  periodTextActive: { color: '#6D28D9', fontWeight: FontWeight.bold },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: FontSize.sm },
  content: { padding: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
  sectionCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  kpiRow: { flexDirection: 'row', marginBottom: Spacing.lg },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  kpiUnit: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 1 },
  kpiLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  tirWrap: { marginBottom: Spacing.sm },
  tirTitle: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium, marginBottom: 8 },
  tirBar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 8 },
  tirSeg: { height: '100%' },
  tirLegend: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  tirLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tirDot: { width: 7, height: 7, borderRadius: 3.5 },
  tirLegendText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  chartLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium, marginBottom: 4 },
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  statUnit: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statDivider: { width: 1, height: 48, backgroundColor: Colors.border },
  sleepMain: { flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginBottom: Spacing.md },
  sleepAvgWrap: { alignItems: 'center' },
  sleepAvgValue: { fontSize: 36, fontWeight: FontWeight.extrabold },
  sleepAvgLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sleepBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 60 },
  sleepBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  sleepBar: { width: '100%', borderRadius: 3, minHeight: 6 },
  sleepBarLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },
  sleepQualRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  sleepQualItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sleepQualDot: { width: 7, height: 7, borderRadius: 3.5 },
  sleepQualText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sonoMeta: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 10, marginTop: 4 },
  sonoMetaText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  nutRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  nutItem: { alignItems: 'center' },
  nutCircle: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  nutPct: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  nutLabel: { fontSize: FontSize.xs, color: Colors.text, fontWeight: FontWeight.medium },
  nutCount: { fontSize: FontSize.xs, color: Colors.textSecondary },
  goalRow: { marginBottom: Spacing.md },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  goalTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, flex: 1 },
  goalPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  goalDetail: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 3 },
});
