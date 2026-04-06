import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, Plus } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';

const WATER_GOAL = 2500;
const QUICK_AMOUNTS = [150, 200, 300, 500, 750];

export default function WaterScreen() {
  const { waterLog, addWater, getTodayWater } = useApp();
  const todayTotal = getTodayWater();
  const progress = Math.min(todayTotal / WATER_GOAL, 1);
  const remaining = Math.max(WATER_GOAL - todayTotal, 0);

  const todayLogs = waterLog.filter(w => w.date === '2026-04-06');

  const getGlassesCount = () => Math.floor(todayTotal / 250);

  const fillColor = progress >= 1 ? Colors.primary : progress >= 0.5 ? Colors.teal : Colors.secondary;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Hidratação" subtitle="Acompanhe seu consumo de água" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Main meter */}
        <Card style={styles.meterCard}>
          <View style={styles.meterCircleWrap}>
            <View style={styles.meterCircleOuter}>
              <LinearGradient
                colors={['#14B8A6', '#0D9488']}
                style={[styles.meterCircle, { opacity: 0.15 + progress * 0.85 }]}
              />
              <View style={styles.meterInner}>
                <Droplets size={32} color={fillColor} />
                <Text style={[styles.meterValue, { color: fillColor }]}>{(todayTotal / 1000).toFixed(2)}L</Text>
                <Text style={styles.meterGoal}>de {(WATER_GOAL / 1000).toFixed(1)}L</Text>
              </View>
            </View>
          </View>

          <ProgressBar progress={progress} color={fillColor} height={10} showLabel label={`${Math.round(progress * 100)}% da meta diária`} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: fillColor }]}>{getGlassesCount()}</Text>
              <Text style={styles.statLabel}>Copos (250ml)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.warning }]}>{remaining}ml</Text>
              <Text style={styles.statLabel}>Restante</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{todayLogs.length}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
          </View>
        </Card>

        {/* Quick add */}
        <Card style={styles.quickCard}>
          <Text style={styles.quickTitle}>Adicionar Rápido</Text>
          <View style={styles.quickGrid}>
            {QUICK_AMOUNTS.map(amount => (
              <TouchableOpacity
                key={amount}
                style={[styles.quickBtn, { backgroundColor: fillColor + '15', borderColor: fillColor + '40' }]}
                onPress={() => addWater(amount)}
              >
                <Droplets size={18} color={fillColor} />
                <Text style={[styles.quickAmount, { color: fillColor }]}>{amount}ml</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: Colors.primary + '15', borderColor: Colors.primary + '40' }]}
              onPress={() => addWater(1000)}
            >
              <Text style={[styles.quickAmount, { color: Colors.primary }]}>1L</Text>
              <Text style={styles.quickSub}>1 garrafa</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Glasses visual */}
        <Card style={styles.glassesCard}>
          <Text style={styles.glassesTitle}>Visualização do dia</Text>
          <View style={styles.glassesGrid}>
            {Array.from({ length: 10 }).map((_, i) => {
              const filled = i < getGlassesCount();
              return (
                <View key={i} style={[styles.glass, filled ? { backgroundColor: fillColor + '30', borderColor: fillColor } : {}]}>
                  <Droplets size={16} color={filled ? fillColor : Colors.border} />
                </View>
              );
            })}
          </View>
          <Text style={styles.glassesNote}>Cada copo = 250ml. Meta: 10 copos por dia</Text>
        </Card>

        {/* Today's log */}
        {todayLogs.length > 0 && (
          <Card style={styles.logCard}>
            <Text style={styles.logTitle}>Registro de Hoje</Text>
            {todayLogs.map(log => (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.logDot} />
                <Text style={styles.logTime}>{log.time}</Text>
                <Text style={styles.logAmount}>{log.amount}ml</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Dicas de Hidratação</Text>
          {[
            'Beba água ao acordar — o corpo fica desidratado durante o sono',
            'Diabéticos precisam de mais água pois urinam mais frequentemente',
            'A desidratação pode elevar a concentração de glicose no sangue',
            'Prefira água ao invés de bebidas açucaradas',
            'Uma dica: beba um copo antes de cada refeição',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: fillColor }]} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.lg },
  meterCard: {},
  meterCircleWrap: { alignItems: 'center', marginBottom: Spacing.lg },
  meterCircleOuter: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 3, borderColor: Colors.teal + '30',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  meterCircle: { ...StyleSheet.absoluteFillObject, borderRadius: 80 },
  meterInner: { alignItems: 'center', gap: 4 },
  meterValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  meterGoal: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  quickCard: {},
  quickTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: BorderRadius.md, borderWidth: 1,
    flexDirection: 'row', gap: 6,
  },
  quickAmount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  quickSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  glassesCard: {},
  glassesTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  glassesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  glass: {
    width: 44, height: 44, borderRadius: BorderRadius.sm,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  glassesNote: { fontSize: FontSize.xs, color: Colors.textSecondary },
  logCard: {},
  logTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.teal },
  logTime: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  logAmount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  tipsCard: {},
  tipsTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  tipRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
});
