import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pill, Check, Clock, Plus, Info } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';

const TYPE_LABELS: Record<string, string> = {
  insulin: 'Insulina', oral: 'Oral', supplement: 'Suplemento', other: 'Outro',
};

export default function MedicationsScreen() {
  const { medications, toggleMedication } = useApp();

  const takenCount = medications.filter(m => m.taken).length;
  const pendingMeds = medications.filter(m => !m.taken);
  const takenMeds   = medications.filter(m => m.taken);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Medicações" subtitle="Controle seus remédios" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Progress */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Progresso de hoje</Text>
              <Text style={styles.progressSub}>{takenCount} de {medications.length} tomadas</Text>
            </View>
            <View style={[styles.progressCircle, { backgroundColor: takenCount === medications.length ? Colors.primaryLight : Colors.warningLight }]}>
              <Text style={[styles.progressPct, { color: takenCount === medications.length ? Colors.primary : Colors.warning }]}>
                {Math.round((takenCount / medications.length) * 100)}%
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={takenCount / medications.length}
            color={takenCount === medications.length ? Colors.primary : Colors.warning}
            height={10}
          />
          {takenCount === medications.length && (
            <View style={styles.allDoneRow}>
              <Check size={16} color={Colors.primary} />
              <Text style={styles.allDoneText}>Todas as medicações do dia tomadas! 🎉</Text>
            </View>
          )}
        </Card>

        {/* Pending */}
        {pendingMeds.length > 0 && (
          <View>
            <Text style={styles.groupLabel}>PENDENTES</Text>
            {pendingMeds.map(med => (
              <Card key={med.id} style={styles.medCard} padding={16}>
                <View style={styles.medRow}>
                  <View style={[styles.medDot, { backgroundColor: med.color }]} />
                  <View style={styles.medInfo}>
                    <View style={styles.medNameRow}>
                      <Text style={styles.medName}>{med.name}</Text>
                      <View style={[styles.typeTag, { backgroundColor: med.color + '20' }]}>
                        <Text style={[styles.typeText, { color: med.color }]}>{TYPE_LABELS[med.type]}</Text>
                      </View>
                    </View>
                    <Text style={styles.medDosage}>{med.dosage} · {med.frequency}</Text>
                    <View style={styles.timesRow}>
                      {med.times.map(t => (
                        <View key={t} style={styles.timeChip}>
                          <Clock size={10} color={Colors.textSecondary} />
                          <Text style={styles.timeText}>{t}</Text>
                        </View>
                      ))}
                    </View>
                    {med.notes && <Text style={styles.medNote}>{med.notes}</Text>}
                  </View>
                  <TouchableOpacity
                    style={[styles.takeBtn, { backgroundColor: med.color }]}
                    onPress={() => toggleMedication(med.id)}
                  >
                    <Check size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Taken */}
        {takenMeds.length > 0 && (
          <View>
            <Text style={styles.groupLabel}>TOMADAS HOJE</Text>
            {takenMeds.map(med => (
              <Card key={med.id} style={StyleSheet.flatten([styles.medCard, styles.medCardTaken])} padding={16}>
                <View style={styles.medRow}>
                  <View style={[styles.medDot, { backgroundColor: Colors.border }]} />
                  <View style={styles.medInfo}>
                    <Text style={styles.medNameTaken}>{med.name}</Text>
                    <Text style={styles.medDosage}>{med.dosage} · {med.frequency}</Text>
                    {med.lastTaken && (
                      <Text style={styles.takenTime}>
                        ✓ Tomado às {med.lastTaken.split('T')[1]?.slice(0,5) || med.lastTaken.slice(-5)}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.undoBtn}
                    onPress={() => toggleMedication(med.id)}
                  >
                    <Text style={styles.undoText}>Desfazer</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Info banner */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Info size={18} color={Colors.secondary} />
            <Text style={styles.infoTitle}>Importante</Text>
          </View>
          <Text style={styles.infoText}>
            Nunca altere sua medicação sem orientação médica. Se esquecer uma dose, consulte seu médico sobre o que fazer. Mantenha seus medicamentos em local fresco e seco.
          </Text>
        </Card>

        {/* Add button */}
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={20} color={Colors.primary} />
          <Text style={styles.addBtnText}>Adicionar Medicação</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md },
  progressCard: {},
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  progressTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  progressSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  progressCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  progressPct: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  allDoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  allDoneText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  groupLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  medCard: { marginBottom: 8 },
  medCardTaken: { opacity: 0.65 },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  medDot: { width: 12, height: '80%', borderRadius: 3, minHeight: 40 },
  medInfo: { flex: 1 },
  medNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  medName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  medNameTaken: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  typeTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  typeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  medDosage: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  timesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  timeText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  medNote: { fontSize: FontSize.xs, color: Colors.textLight, fontStyle: 'italic', marginTop: 4 },
  takeBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  undoBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  undoText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  takenTime: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  infoCard: {},
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  infoTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  infoText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 14, backgroundColor: Colors.primaryLight,
  },
  addBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
});
