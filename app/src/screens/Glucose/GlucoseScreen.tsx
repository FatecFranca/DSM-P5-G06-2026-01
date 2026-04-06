import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Trash2, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { GlucoseStatusBadge } from '../../components/common/GlucoseStatusBadge';
import { GlucoseChart } from '../../components/charts/GlucoseChart';
import { RootStackParamList } from '../../types';
import { getContextLabel, getRelativeDate, getGlucoseAverage } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['Todos', 'Hoje', 'Semana', 'Mês'] as const;
type Filter = typeof FILTERS[number];

export default function GlucoseScreen() {
  const { glucoseReadings, deleteGlucoseReading, user } = useApp();
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<Filter>('Todos');
  const insets = useSafeAreaInsets();

  const filtered = glucoseReadings.filter(r => {
    if (filter === 'Hoje') return r.date === '2026-04-06';
    if (filter === 'Semana') return r.date >= '2026-03-30';
    if (filter === 'Mês') return r.date >= '2026-03-06';
    return true;
  });

  const avg = getGlucoseAverage(filtered);
  const inRange = filtered.filter(r => r.status === 'normal').length;
  const inRangePct = filtered.length > 0 ? Math.round((inRange / filtered.length) * 100) : 0;
  const highCount = filtered.filter(r => r.status === 'high' || r.status === 'very_high').length;
  const lowCount = filtered.filter(r => r.status === 'low').length;

  const handleDelete = (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir esta leitura?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteGlucoseReading(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Glicose</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddGlucose' as any)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addBtnText}>Registrar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} padding={12}>
            <Text style={styles.statValue}>{avg || '--'}</Text>
            <Text style={styles.statLabel}>Média (mg/dL)</Text>
          </Card>
          <Card style={styles.statCard} padding={12}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{inRangePct}%</Text>
            <Text style={styles.statLabel}>No Alvo</Text>
          </Card>
          <Card style={styles.statCard} padding={12}>
            <Text style={[styles.statValue, { color: Colors.danger }]}>{highCount}</Text>
            <Text style={styles.statLabel}>Acima</Text>
          </Card>
          <Card style={styles.statCard} padding={12}>
            <Text style={[styles.statValue, { color: Colors.secondary }]}>{lowCount}</Text>
            <Text style={styles.statLabel}>Abaixo</Text>
          </Card>
        </View>

        {/* Chart */}
        {glucoseReadings.length > 1 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Evolução (últimas leituras)</Text>
            <Text style={styles.chartSub}>Faixa ideal: {user.targetGlucoseMin}-{user.targetGlucoseMax} mg/dL</Text>
            <GlucoseChart data={glucoseReadings} height={180} />
          </Card>
        )}

        {/* Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Activity size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>Nenhuma leitura</Text>
              <Text style={styles.emptyText}>Registre sua primeira medição</Text>
            </View>
          ) : (
            filtered.map(reading => (
              <Card key={reading.id} style={styles.readingCard} padding={14}>
                <View style={styles.readingRow}>
                  <View style={styles.readingLeft}>
                    <View style={[styles.readingDot, { backgroundColor: reading.status === 'normal' ? Colors.primary : reading.status === 'high' ? Colors.warning : reading.status === 'very_high' ? Colors.danger : Colors.secondary }]} />
                    <View>
                      <View style={styles.readingValueRow}>
                        <Text style={styles.readingValue}>{reading.value}</Text>
                        <Text style={styles.readingUnit}> mg/dL</Text>
                      </View>
                      <Text style={styles.readingCtx}>{getContextLabel(reading.context)}</Text>
                    </View>
                  </View>

                  <View style={styles.readingRight}>
                    <GlucoseStatusBadge status={reading.status} size="sm" />
                    <Text style={styles.readingDate}>{getRelativeDate(reading.date)} • {reading.time}</Text>
                    {reading.notes && (
                      <Text style={styles.readingNotes} numberOfLines={1}>{reading.notes}</Text>
                    )}
                  </View>

                  <TouchableOpacity onPress={() => handleDelete(reading.id)} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Trash2 size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  addBtnText: { color: '#fff', fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: 8,
    marginBottom: Spacing.lg,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  chartCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, padding: Spacing.lg },
  chartTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 2 },
  chartSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 12 },
  filters: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filtersContent: { gap: 8 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: BorderRadius.full, backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: Spacing.lg, gap: 10 },
  emptyWrap: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 16, marginBottom: 4 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  readingCard: { marginBottom: 0 },
  readingRow: { flexDirection: 'row', alignItems: 'center' },
  readingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  readingDot: { width: 10, height: 10, borderRadius: 5 },
  readingValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  readingValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.text },
  readingUnit: { fontSize: FontSize.sm, color: Colors.textSecondary },
  readingCtx: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  readingRight: { alignItems: 'flex-end', gap: 4 },
  readingDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  readingNotes: { fontSize: FontSize.xs, color: Colors.textLight, maxWidth: 120 },
  deleteBtn: { marginLeft: 10, padding: 4 },
});
