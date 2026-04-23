import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { GlucoseContext } from '../../types';
import { getContextLabel, getGlucoseStatus } from '../../utils/helpers';
import { Card } from '../../components/common/Card';
import { Info } from 'lucide-react-native';

const CONTEXTS: GlucoseContext[] = ['fasting', 'before_meal', 'after_meal', 'bedtime', 'random'];

const GLUCOSE_RANGES: Record<GlucoseContext, { min: number; max: number; label: string }> = {
  fasting: { min: 70, max: 100, label: 'Normal: 70-100 mg/dL' },
  before_meal: { min: 70, max: 130, label: 'Normal: 70-130 mg/dL' },
  after_meal: { min: 70, max: 180, label: 'Normal: < 180 mg/dL' },
  bedtime: { min: 90, max: 150, label: 'Normal: 90-150 mg/dL' },
  random: { min: 70, max: 140, label: 'Normal: 70-140 mg/dL' },
};

export default function AddGlucoseScreen() {
  const navigation = useNavigation();
  const { addGlucoseReading } = useApp();
  const [value, setValue] = useState('');
  const [context, setContext] = useState<GlucoseContext>('fasting');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const numValue = parseInt(value);
  const isValid = !isNaN(numValue) && numValue > 20 && numValue < 600;
  const status = isValid ? getGlucoseStatus(numValue) : null;

  const getStatusColor = () => {
    if (!status) return Colors.border;
    const colors = { low: Colors.secondary, normal: Colors.primary, high: Colors.warning, very_high: Colors.danger };
    return colors[status];
  };

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('Valor inválido', 'Insira um valor entre 20 e 600 mg/dL');
      return;
    }
    setLoading(true);
    try {
      await addGlucoseReading({
        value: numValue,
        context,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        notes: notes.trim() || undefined,
        status: getGlucoseStatus(numValue),
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar a leitura.');
    } finally {
      setLoading(false);
    }
  };

  const range = GLUCOSE_RANGES[context];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Registrar Glicose" subtitle="Nova medição" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Value Input */}
        <Card style={styles.valueCard}>
          <Text style={styles.inputLabel}>Valor da Glicose</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.valueInput, { borderColor: getStatusColor() }]}
              value={value}
              onChangeText={setValue}
              keyboardType="number-pad"
              placeholder="---"
              placeholderTextColor={Colors.border}
              maxLength={3}
            />
            <Text style={styles.unitLabel}>mg/dL</Text>
          </View>

          {isValid && status && (
            <View style={[styles.statusInfo, { backgroundColor: getStatusColor() + '15', borderColor: getStatusColor() }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {status === 'low' ? 'Hipoglicemia' : status === 'normal' ? 'Normal — Dentro do esperado' : status === 'high' ? 'Hiperglicemia leve' : 'Hiperglicemia severa'}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Info size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{range.label}</Text>
          </View>
        </Card>

        {/* Context */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Situação da Medição</Text>
          <View style={styles.contextGrid}>
            {CONTEXTS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.contextBtn, context === c && styles.contextBtnActive]}
                onPress={() => setContext(c)}
              >
                <Text style={[styles.contextText, context === c && styles.contextTextActive]}>
                  {getContextLabel(c)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notes */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Observações (opcional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: Em jejum, após exercício, medicação tomada..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Card>

        {/* Date/Time */}
        <Card style={styles.section}>
          <Text style={styles.sectionLabel}>Data e Hora</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Data</Text>
              <Text style={styles.dateValue}>{new Date().toLocaleDateString('pt-BR')}</Text>
            </View>
            <View style={styles.dateDivider} />
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Hora</Text>
              <Text style={styles.dateValue}>{new Date().toTimeString().slice(0, 5)}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Salvar Medição"
            onPress={handleSave}
            loading={loading}
            disabled={!isValid}
          />
          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="ghost"
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg },
  valueCard: { marginBottom: Spacing.lg },
  inputLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md, fontWeight: FontWeight.medium },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  valueInput: {
    fontSize: 64, fontWeight: FontWeight.extrabold, color: Colors.text,
    textAlign: 'center', width: 160, borderBottomWidth: 3,
    paddingBottom: 8,
  },
  unitLabel: { fontSize: FontSize.xl, color: Colors.textSecondary, marginLeft: 12, marginTop: 20 },
  statusInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.md,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  section: { marginBottom: Spacing.lg },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.md },
  contextGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  contextBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  contextBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  contextText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  contextTextActive: { color: Colors.primary },
  notesInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    padding: Spacing.md, fontSize: FontSize.md, color: Colors.text,
    minHeight: 80,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center' },
  dateItem: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  dateValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  dateDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  actions: { gap: 0 },
});
