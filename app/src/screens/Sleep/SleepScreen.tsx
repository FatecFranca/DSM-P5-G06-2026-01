import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Plus, Trash2, TrendingUp, Clock, Star, Pencil } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { SleepEntry } from '../../types';
import { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SLEEP_GOAL = 8;

const QUALITY_CONFIG: Record<SleepEntry['quality'], { label: string; color: string; bg: string; stars: number }> = {
  excellent: { label: 'Excelente', color: Colors.primary,   bg: Colors.primaryLight,  stars: 4 },
  good:      { label: 'Boa',       color: Colors.secondary, bg: Colors.secondaryLight, stars: 3 },
  fair:      { label: 'Regular',   color: Colors.warning,   bg: Colors.warningLight,  stars: 2 },
  poor:      { label: 'Ruim',      color: Colors.danger,    bg: Colors.dangerLight,   stars: 1 },
};

export default function SleepScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { sleepEntries, deleteSleepEntry, getAvgSleepDuration, loadSleepEntries, sleepLoading } = useApp();

  useEffect(() => {
    loadSleepEntries();
  }, [loadSleepEntries]);

  const [filter, setFilter] = useState<'all' | SleepEntry['quality']>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const avgDuration = getAvgSleepDuration();
  const lastEntry = sleepEntries[0] ?? null;

  const qualityCounts = sleepEntries.reduce<Record<string, number>>((acc, s) => {
    acc[s.quality] = (acc[s.quality] ?? 0) + 1;
    return acc;
  }, {});

  const excellentOrGood = (qualityCounts['excellent'] ?? 0) + (qualityCounts['good'] ?? 0);
  const goodRatePct = sleepEntries.length > 0
    ? Math.round((excellentOrGood / sleepEntries.length) * 100)
    : 0;

  const filtered = filter === 'all'
    ? sleepEntries
    : sleepEntries.filter(s => s.quality === filter);

  async function confirmDelete() {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await deleteSleepEntry(confirmId);
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  }

  const progressAngle = Math.min((avgDuration / SLEEP_GOAL) * 100, 100);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradientPurple as [string, string]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Sono</Text>
            <Text style={styles.headerSub}>Acompanhe seu descanso</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddSleep' as any, {})}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Metric circle */}
        <View style={styles.metricCard}>
          <View style={styles.circleContainer}>
            <View style={styles.circleOuter}>
              <View style={[
                styles.circleInner,
                { borderColor: avgDuration >= SLEEP_GOAL ? Colors.primary : Colors.warning },
              ]}>
                <Moon size={22} color={Colors.purple} />
                <Text style={styles.circleValue}>{avgDuration > 0 ? `${avgDuration}h` : '—'}</Text>
                <Text style={styles.circleLabel}>média</Text>
              </View>
            </View>
            <View style={styles.circleStats}>
              <View style={styles.circleStat}>
                <Text style={styles.circleStatValue}>{SLEEP_GOAL}h</Text>
                <Text style={styles.circleStatLabel}>Meta</Text>
              </View>
              <View style={styles.circleStatDivider} />
              <View style={styles.circleStat}>
                <Text style={styles.circleStatValue}>{progressAngle.toFixed(0)}%</Text>
                <Text style={styles.circleStatLabel}>da meta</Text>
              </View>
              <View style={styles.circleStatDivider} />
              <View style={styles.circleStat}>
                <Text style={styles.circleStatValue}>{goodRatePct}%</Text>
                <Text style={styles.circleStatLabel}>Qualidade boa</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* KPI cards */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { borderLeftColor: Colors.purple }]}>
            <Moon size={18} color={Colors.purple} />
            <Text style={styles.kpiValue}>{sleepEntries.length}</Text>
            <Text style={styles.kpiLabel}>Registros</Text>
          </View>
          <View style={[styles.kpiCard, { borderLeftColor: Colors.primary }]}>
            <TrendingUp size={18} color={Colors.primary} />
            <Text style={styles.kpiValue}>{excellentOrGood}</Text>
            <Text style={styles.kpiLabel}>Noites boas</Text>
          </View>
          <View style={[styles.kpiCard, { borderLeftColor: Colors.warning }]}>
            <Clock size={18} color={Colors.warning} />
            <Text style={styles.kpiValue}>{lastEntry ? lastEntry.duration + 'h' : '—'}</Text>
            <Text style={styles.kpiLabel}>Última noite</Text>
          </View>
        </View>

        {/* Quality distribution */}
        <Card style={styles.distCard}>
          <Text style={styles.sectionTitle}>Distribuição de qualidade</Text>
          <View style={styles.qualityBars}>
            {(Object.entries(QUALITY_CONFIG) as [SleepEntry['quality'], typeof QUALITY_CONFIG[SleepEntry['quality']]][]).map(
              ([key, cfg]) => {
                const count = qualityCounts[key] ?? 0;
                const pct = sleepEntries.length > 0 ? count / sleepEntries.length : 0;
                return (
                  <View key={key} style={styles.qualityBarRow}>
                    <View style={styles.qualityStars}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          color={i < cfg.stars ? cfg.color : Colors.borderLight}
                          fill={i < cfg.stars ? cfg.color : 'transparent'}
                        />
                      ))}
                    </View>
                    <Text style={styles.qualityLabel}>{cfg.label}</Text>
                    <View style={styles.qualityBarBg}>
                      <View style={[styles.qualityBarFill, { width: `${pct * 100}%`, backgroundColor: cfg.color }]} />
                    </View>
                    <Text style={styles.qualityCount}>{count}</Text>
                  </View>
                );
              },
            )}
          </View>
        </Card>

        {/* Tips */}
        <Card style={styles.tipCard}>
          <Moon size={16} color={Colors.purple} />
          <Text style={styles.tipText}>
            Adultos precisam de 7–9h de sono por noite. O sono de qualidade reduz a resistência à insulina e ajuda no controle glicêmico.
          </Text>
        </Card>

        {/* Filter */}
        <View style={styles.filterRow}>
          {(['all', 'excellent', 'good', 'fair', 'poor'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>
                {f === 'all' ? 'Todos' : QUALITY_CONFIG[f].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History */}
        <Text style={styles.historyTitle}>HISTÓRICO</Text>
        {sleepLoading ? (
          <ActivityIndicator size="large" color={Colors.purple} style={{ marginTop: 32 }} />
        ) : filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Moon size={36} color={Colors.textLight} />
            <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('AddSleep' as any, {})}
            >
              <Text style={styles.emptyBtnText}>Registrar sono</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          filtered.map(entry => {
            const cfg = QUALITY_CONFIG[entry.quality];
            return (
              <Card key={entry.id} style={styles.entryCard} padding={0}>
                <View style={styles.entryRow}>
                  <View style={[styles.entryQualityDot, { backgroundColor: cfg.bg }]}>
                    <Moon size={16} color={cfg.color} />
                  </View>
                  <View style={styles.entryInfo}>
                    <View style={styles.entryTopRow}>
                      <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                      <View style={[styles.qualityBadge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.qualityBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                    </View>
                    <View style={styles.entryDetailRow}>
                      <Clock size={12} color={Colors.textSecondary} />
                      <Text style={styles.entryDetail}>{entry.bedtime} → {entry.wakeTime}</Text>
                      <Text style={styles.entryDuration}>{entry.duration}h</Text>
                    </View>
                    {entry.notes ? (
                      <Text style={styles.entryNotes} numberOfLines={1}>{entry.notes}</Text>
                    ) : null}
                  </View>
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AddSleep' as any, { editing: entry })}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.entryActionBtn}
                    >
                      <Pencil size={15} color={Colors.purple} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setConfirmId(entry.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.entryActionBtn}
                    >
                      <Trash2 size={15} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Confirm delete modal */}
      <Modal visible={!!confirmId} transparent animationType="fade" onRequestClose={() => setConfirmId(null)}>
        <View style={styles.confirmOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setConfirmId(null)} />
          <View style={styles.confirmBox}>
            <View style={styles.confirmIconWrap}>
              <Trash2 size={28} color={Colors.danger} />
            </View>
            <Text style={styles.confirmTitle}>Remover registro</Text>
            <Text style={styles.confirmMsg}>Deseja remover este registro de sono? Esta ação não pode ser desfeita.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setConfirmId(null)}
                disabled={deleting}
              >
                <Text style={styles.confirmCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmDelete, deleting && { opacity: 0.6 }]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteText}>{deleting ? 'Removendo...' : 'Remover'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  metricCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  circleContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  circleOuter: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  circleInner: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: '#fff',
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  circleValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.purple, lineHeight: 22 },
  circleLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  circleStats: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  circleStat: { alignItems: 'center' },
  circleStatValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  circleStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 2 },
  circleStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  content: { padding: Spacing.lg },
  kpiRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  kpiCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: BorderRadius.lg,
    padding: Spacing.md, alignItems: 'center', gap: 4,
    borderLeftWidth: 3,
    shadowColor: Colors.cardShadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
  },
  kpiValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  kpiLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  distCard: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.md },
  qualityBars: { gap: Spacing.sm },
  qualityBarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qualityStars: { flexDirection: 'row', gap: 1, width: 48 },
  qualityLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, width: 52 },
  qualityBarBg: { flex: 1, height: 8, backgroundColor: Colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  qualityBarFill: { height: 8, borderRadius: 4 },
  qualityCount: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.text, width: 18, textAlign: 'right' },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.purpleLight, marginBottom: Spacing.lg,
  },
  tipText: { flex: 1, fontSize: FontSize.xs, color: Colors.purple, lineHeight: 18 },
  filterRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md, flexWrap: 'wrap' },
  filterBtn: {
    paddingHorizontal: Spacing.sm, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderLight,
  },
  filterBtnActive: { backgroundColor: Colors.purpleLight },
  filterLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterLabelActive: { color: Colors.purple },
  historyTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.sm },
  emptyCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary },
  emptyBtn: {
    backgroundColor: Colors.purple, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginTop: Spacing.sm,
  },
  emptyBtnText: { color: '#fff', fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  entryCard: { marginBottom: Spacing.sm },
  entryRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  entryQualityDot: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  entryInfo: { flex: 1 },
  entryTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  entryDate: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  qualityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  qualityBadgeText: { fontSize: 11, fontWeight: FontWeight.semibold },
  entryDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryDetail: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  entryDuration: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.purple },
  entryNotes: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 4, fontStyle: 'italic' },
  entryActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  entryActionBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.borderLight,
  },
  // Confirm modal
  confirmOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  confirmBox: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, width: '100%', maxWidth: 320,
    alignItems: 'center', gap: Spacing.sm,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 12,
  },
  confirmIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  confirmTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
  confirmMsg: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  confirmActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, width: '100%' },
  confirmCancel: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.borderLight, alignItems: 'center',
  },
  confirmCancelText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  confirmDelete: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.danger, alignItems: 'center',
  },
  confirmDeleteText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: '#fff' },
});
