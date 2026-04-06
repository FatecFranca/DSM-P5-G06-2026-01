import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, CheckCircle2, Plus, Trophy } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';

const CATEGORY_EMOJIS: Record<string, string> = {
  glucose: '🩸', weight: '⚖️', exercise: '🏃', water: '💧', sleep: '😴', steps: '👣',
};

export default function GoalsScreen() {
  const { goals, updateGoal } = useApp();

  const completedGoals = goals.filter(g => g.completed);
  const activeGoals    = goals.filter(g => !g.completed);

  const handleProgress = (id: string, target: number, current: number) => {
    Alert.prompt
      ? Alert.prompt('Atualizar progresso', `Valor atual: ${current}`, (value) => {
          const num = parseFloat(value);
          if (!isNaN(num)) updateGoal(id, num);
        }, 'plain-text', String(current), 'number-pad')
      : Alert.alert('Atualizar', 'Funcionalidade disponível na versão iOS');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Metas de Saúde" subtitle={`${completedGoals.length} de ${goals.length} concluídas`} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard} padding={16}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{completedGoals.length}</Text>
            <Text style={styles.summaryLabel}>Concluídas</Text>
          </Card>
          <Card style={styles.summaryCard} padding={16}>
            <Text style={[styles.summaryValue, { color: Colors.warning }]}>{activeGoals.length}</Text>
            <Text style={styles.summaryLabel}>Em andamento</Text>
          </Card>
          <Card style={styles.summaryCard} padding={16}>
            <Text style={[styles.summaryValue, { color: Colors.secondary }]}>
              {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
            </Text>
            <Text style={styles.summaryLabel}>Progresso</Text>
          </Card>
        </View>

        {/* Active goals */}
        {activeGoals.length > 0 && (
          <View>
            <Text style={styles.groupLabel}>EM ANDAMENTO</Text>
            {activeGoals.map(goal => {
              const pct = Math.min(goal.current / goal.target, 1);
              return (
                <Card key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={[styles.goalEmoji, { backgroundColor: goal.color + '20' }]}>
                      <Text style={styles.goalEmojiText}>{CATEGORY_EMOJIS[goal.category]}</Text>
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalDesc}>{goal.description}</Text>
                    </View>
                    <View style={[styles.goalPctBadge, { backgroundColor: goal.color + '20' }]}>
                      <Text style={[styles.goalPctText, { color: goal.color }]}>
                        {Math.round(pct * 100)}%
                      </Text>
                    </View>
                  </View>

                  <ProgressBar progress={pct} color={goal.color} height={8} />

                  <View style={styles.goalFooter}>
                    <Text style={styles.goalProgress}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                    <Text style={styles.goalDeadline}>
                      até {goal.deadline.split('-').reverse().join('/')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.updateBtn, { borderColor: goal.color }]}
                    onPress={() => handleProgress(goal.id, goal.target, goal.current)}
                  >
                    <Text style={[styles.updateBtnText, { color: goal.color }]}>Atualizar progresso</Text>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        )}

        {/* Completed */}
        {completedGoals.length > 0 && (
          <View>
            <Text style={styles.groupLabel}>CONCLUÍDAS 🏆</Text>
            {completedGoals.map(goal => (
              <Card key={goal.id} style={StyleSheet.flatten([styles.goalCard, styles.goalCardDone])}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalEmoji, { backgroundColor: Colors.primaryLight }]}>
                    <Text style={styles.goalEmojiText}>{CATEGORY_EMOJIS[goal.category]}</Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalTitle, { color: Colors.primary }]}>{goal.title}</Text>
                    <Text style={styles.goalDesc}>{goal.description}</Text>
                  </View>
                  <CheckCircle2 size={26} color={Colors.primary} />
                </View>
                <ProgressBar progress={1} color={Colors.primary} height={6} />
                <Text style={styles.goalCompletedText}>✓ Meta concluída! Parabéns!</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Add goal */}
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={20} color={Colors.primary} />
          <Text style={styles.addBtnText}>Nova Meta</Text>
        </TouchableOpacity>

        {/* Motivation */}
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.motivCard}>
          <Trophy size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.motivTitle}>Continue assim!</Text>
            <Text style={styles.motivText}>Cada pequena conquista te aproxima de uma vida mais saudável.</Text>
          </View>
        </LinearGradient>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  groupLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  goalCard: { marginBottom: 10, gap: 10 },
  goalCardDone: { opacity: 0.8 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalEmoji: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  goalEmojiText: { fontSize: 22 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  goalDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  goalPctBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  goalPctText: { fontSize: FontSize.sm, fontWeight: FontWeight.extrabold },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  goalProgress: { fontSize: FontSize.xs, color: Colors.textSecondary },
  goalDeadline: { fontSize: FontSize.xs, color: Colors.textSecondary },
  updateBtn: { borderWidth: 1, borderRadius: BorderRadius.md, paddingVertical: 8, alignItems: 'center' },
  updateBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  goalCompletedText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 14, backgroundColor: Colors.primaryLight,
  },
  addBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  motivCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: Spacing.lg, borderRadius: BorderRadius.lg },
  motivTitle: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md, marginBottom: 2 },
  motivText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.xs, lineHeight: 18 },
});
