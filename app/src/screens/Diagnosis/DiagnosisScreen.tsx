import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, ChevronRight, AlertTriangle, Info } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { DIAGNOSIS_QUESTIONS, getRiskLevel } from '../../data/diagnosisData';
import { RootStackParamList, DiagnosisResult } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DiagnosisScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const question = DIAGNOSIS_QUESTIONS[step];
  const maxScore  = DIAGNOSIS_QUESTIONS.length * 3;
  const answered  = question ? answers[question.id] !== undefined : false;
  const progress  = step / DIAGNOSIS_QUESTIONS.length;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (step < DIAGNOSIS_QUESTIONS.length - 1) {
      setStep(prev => prev + 1);
    } else {
      // finish
      const score = Object.values(answers).reduce((s, v) => s + v, 0);
      const riskLevel = getRiskLevel(score, maxScore);
      const result: DiagnosisResult = {
        score,
        riskLevel,
        percentage: Math.round((score / maxScore) * 100),
        answers,
      };
      navigation.navigate('DiagnosisDetail', { result });
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  if (!started) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <ScreenHeader title="Pré-Diagnóstico" showBack={true} />
        <ScrollView contentContainerStyle={styles.introContainer}>
          <LinearGradient colors={['#4CAF82', '#2E9E6B']} style={styles.introBanner}>
            <ShieldCheck size={56} color="#fff" />
            <Text style={styles.introTitle}>Questionário de Risco</Text>
            <Text style={styles.introSubtitle}>para Diabetes</Text>
          </LinearGradient>

          <View style={styles.introContent}>
            <Text style={styles.introDesc}>
              Este questionário avalia fatores de risco baseados em diretrizes clínicas e ajuda a identificar a necessidade de consultar um profissional de saúde.
            </Text>

            <View style={styles.warningBox}>
              <AlertTriangle size={18} color={Colors.warning} />
              <Text style={styles.warningText}>
                Este não substitui um diagnóstico médico. Consulte sempre um profissional de saúde.
              </Text>
            </View>

            <View style={styles.infoGrid}>
              {[
                { emoji: '📋', label: `${DIAGNOSIS_QUESTIONS.length} perguntas` },
                { emoji: '⏱️', label: '~3 minutos' },
                { emoji: '🔒', label: 'Privado e seguro' },
                { emoji: '🆓', label: 'Totalmente gratuito' },
              ].map(item => (
                <View key={item.label} style={styles.infoItem}>
                  <Text style={styles.infoEmoji}>{item.emoji}</Text>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

            <Button title="Iniciar Questionário" onPress={() => setStarted(true)} />

            <View style={styles.categoriesInfo}>
              <Text style={styles.catInfoTitle}>O questionário avalia:</Text>
              {['Sintomas clássicos', 'Histórico familiar', 'Estilo de vida', 'Sinais físicos'].map(c => (
                <View key={c} style={styles.catInfoRow}>
                  <View style={styles.catInfoDot} />
                  <Text style={styles.catInfoText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={[styles.qHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.qHeaderRow}>
          <TouchableOpacity onPress={handlePrev} disabled={step === 0} style={[styles.navBtn, step === 0 && { opacity: 0.3 }]}>
            <Text style={styles.navBtnText}>‹ Anterior</Text>
          </TouchableOpacity>
          <Text style={styles.stepLabel}>{step + 1} / {DIAGNOSIS_QUESTIONS.length}</Text>
          <TouchableOpacity onPress={() => { setStarted(false); setStep(0); setAnswers({}); }}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
        <ProgressBar progress={progress} color={Colors.primary} height={6} />
        <Text style={styles.categoryLabel}>{question.category}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.qContainer}>
        <Text style={styles.questionText}>{question.question}</Text>

        <View style={styles.options}>
          {question.options.map((opt, i) => {
            const selected = answers[question.id] === opt.value;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.optionBtn, selected && styles.optionBtnActive]}
                onPress={() => handleAnswer(opt.value)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionCircle, selected && styles.optionCircleActive]}>
                  {selected && <View style={styles.optionCircleDot} />}
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={step === DIAGNOSIS_QUESTIONS.length - 1 ? 'Ver Resultado' : 'Próxima'}
          onPress={handleNext}
          disabled={!answered}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  introContainer: { paddingBottom: 40 },
  introBanner: {
    margin: Spacing.lg, borderRadius: BorderRadius.xl,
    padding: 36, alignItems: 'center', gap: 8,
  },
  introTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  introSubtitle: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.85)' },
  introContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  introDesc: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24, textAlign: 'center' },
  warningBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: Colors.warningLight, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '40',
  },
  warningText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem: {
    flex: 1, minWidth: '45%', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  infoEmoji: { fontSize: 26, marginBottom: 4 },
  infoLabel: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium, textAlign: 'center' },
  categoriesInfo: { backgroundColor: Colors.card, borderRadius: BorderRadius.md, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  catInfoTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  catInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  catInfoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  catInfoText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  qHeader: {
    backgroundColor: Colors.card, paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  qHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: {},
  navBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  stepLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  cancelText: { fontSize: FontSize.sm, color: Colors.danger },
  categoryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  qContainer: { padding: Spacing.xl },
  questionText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, lineHeight: 30, marginBottom: Spacing.xl },
  options: { gap: 12 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: Spacing.lg, borderRadius: BorderRadius.lg,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card,
  },
  optionBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  optionCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  optionCircleActive: { borderColor: Colors.primary },
  optionCircleDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },
  optionTextActive: { color: Colors.text, fontWeight: FontWeight.semibold },
});
