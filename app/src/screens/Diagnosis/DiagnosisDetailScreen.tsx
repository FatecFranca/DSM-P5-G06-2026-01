import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, AlertTriangle, AlertCircle, Phone, CheckCircle2 } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { RootStackParamList } from '../../types';
import { getRiskColor, getRiskLabel } from '../../utils/helpers';

type Route = RouteProp<RootStackParamList, 'DiagnosisDetail'>;

const RECOMMENDATIONS: Record<string, { title: string; items: string[]; icon: React.ReactNode; color: string }> = {
  low: {
    title: 'Você está bem! Mantenha os bons hábitos.',
    color: Colors.primary,
    icon: <CheckCircle2 size={28} color={Colors.primary} />,
    items: [
      'Continue com alimentação saudável e exercícios regulares',
      'Faça check-up anual com seu médico',
      'Monitore seu peso e mantenha o IMC saudável',
      'Limite o consumo de açúcar e bebidas açucaradas',
      'Dê atenção à qualidade do sono',
    ],
  },
  medium: {
    title: 'Atenção! Alguns fatores merecem cuidado.',
    color: Colors.warning,
    icon: <AlertTriangle size={28} color={Colors.warning} />,
    items: [
      'Agende uma consulta médica em breve para exames',
      'Solicite exame de glicemia em jejum e HbA1c',
      'Reduza açúcar, carboidratos simples e alimentos ultra-processados',
      'Inicie ou intensifique atividades físicas (150 min/semana)',
      'Controle seu peso — perda de 5-7% já reduz risco significativamente',
      'Monitore pressão arterial e colesterol',
    ],
  },
  high: {
    title: 'Atenção urgente! Procure um médico.',
    color: Colors.danger,
    icon: <AlertCircle size={28} color={Colors.danger} />,
    items: [
      'Consulte um endocrinologista o quanto antes',
      'Realize exames: glicemia, HbA1c, lipidograma, função renal',
      'Não ignore sintomas como sede excessiva e urina frequente',
      'Inicie mudanças alimentares imediatamente com nutricionista',
      'Realize atividade física sob supervisão médica',
      'Mantenha um diário de sintomas para mostrar ao médico',
    ],
  },
};

export default function DiagnosisDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { result, isFromOnboarding } = route.params;
  const { riskLevel, score, percentage, predicao, probabilidade } = result;

  const riskColor = getRiskColor(riskLevel);
  const rec = RECOMMENDATIONS[riskLevel];
  const gradients: Record<string, [string, string]> = {
    low: ['#4CAF82', '#2E9E6B'],
    medium: ['#F59E0B', '#D97706'],
    high: ['#EF4444', '#DC2626'],
  };

  const isDiabetico = predicao === 1;
  const probPct = probabilidade !== undefined ? Math.round(probabilidade * 100) : undefined;

  const predicaoGradient: [string, string] = isDiabetico
    ? ['#EF4444', '#B91C1C']
    : ['#4CAF82', '#2E9E6B'];

  const handleIrInicio = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {!isFromOnboarding && <ScreenHeader title="Resultado" subtitle="Pré-diagnóstico" />}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Risk score banner */}
        <LinearGradient colors={gradients[riskLevel]} style={[styles.banner, isFromOnboarding && { marginTop: 52 }]}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>de risco</Text>
          </View>
          <Text style={styles.riskLabel}>{getRiskLabel(riskLevel)}</Text>
          <Text style={styles.riskSub}>{rec.title}</Text>
        </LinearGradient>

        <View style={styles.content}>

          {/* ─── Resultado do algoritmo Python ─── */}
          {predicao !== undefined && (
            <View style={styles.predicaoWrap}>
              <Text style={styles.predicaoHeader}>Resultado do Algoritmo</Text>
              <LinearGradient colors={predicaoGradient} style={styles.predicaoCard}>
                <View style={styles.predicaoIconRow}>
                  {isDiabetico
                    ? <AlertCircle size={40} color="#fff" />
                    : <CheckCircle2 size={40} color="#fff" />}
                </View>
                <Text style={styles.predicaoTitle}>
                  {isDiabetico ? 'Indicativo de Diabetes' : 'Sem Indicativo de Diabetes'}
                </Text>
                <Text style={styles.predicaoSubtitle}>
                  {isDiabetico
                    ? 'O modelo identificou padrões associados ao diabetes. Consulte um médico para confirmar.'
                    : 'O modelo não identificou padrões associados ao diabetes. Continue com hábitos saudáveis.'}
                </Text>
                {probPct !== undefined && (
                  <View style={styles.probRow}>
                    <Text style={styles.probLabel}>Probabilidade estimada:</Text>
                    <Text style={styles.probValue}>{probPct}%</Text>
                  </View>
                )}
              </LinearGradient>
              <Text style={styles.predicaoDisclaimer}>
                Baseado no algoritmo de Machine Learning treinado com o Pima Indians Diabetes Dataset.
              </Text>
            </View>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              ⚠️ Este resultado é apenas uma estimativa educacional e NÃO substitui diagnóstico médico. Consulte sempre um profissional de saúde qualificado.
            </Text>
          </View>

          {/* Recommendations */}
          <Card style={styles.recCard}>
            <View style={styles.recHeader}>
              {rec.icon}
              <Text style={[styles.recTitle, { color: riskColor }]}>Recomendações</Text>
            </View>
            {rec.items.map((item, i) => (
              <View key={i} style={styles.recRow}>
                <View style={[styles.recDot, { backgroundColor: riskColor }]} />
                <Text style={styles.recText}>{item}</Text>
              </View>
            ))}
          </Card>

          {/* Contact doctor */}
          {riskLevel !== 'low' && (
            <Card style={StyleSheet.flatten([styles.contactCard, { borderColor: riskColor + '30', borderWidth: 1 }])}>
              <Phone size={24} color={riskColor} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactTitle, { color: riskColor }]}>Procure seu médico</Text>
                <Text style={styles.contactText}>
                  {riskLevel === 'high'
                    ? 'Recomendamos consulta urgente com endocrinologista.'
                    : 'Agende uma consulta preventiva com seu médico de confiança.'}
                </Text>
              </View>
            </Card>
          )}

          {/* Saiba mais */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Saiba mais</Text>
            <Text style={styles.infoText}>
              O diabetes tipo 2 pode ser prevenido ou atrasado com mudanças no estilo de vida. Perda de 5-7% do peso corporal, alimentação saudável e 150 minutos de exercício por semana reduzem em até 58% o risco de desenvolver diabetes.
            </Text>
          </Card>

          {!isFromOnboarding && (
            <Button
              title="Refazer Questionário"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={{ marginTop: Spacing.sm }}
            />
          )}
          <Button
            title="Ir ao Início"
            onPress={handleIrInicio}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    margin: Spacing.lg, borderRadius: BorderRadius.xl,
    padding: 32, alignItems: 'center', gap: 8,
  },
  scoreCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  scoreValue: { fontSize: 32, fontWeight: FontWeight.extrabold, color: '#fff' },
  scoreLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)' },
  riskLabel: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  riskSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },

  // Predição
  predicaoWrap: { gap: 8 },
  predicaoHeader: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold,
    color: Colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase',
  },
  predicaoCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.xl,
    alignItems: 'center', gap: 10,
  },
  predicaoIconRow: { marginBottom: 4 },
  predicaoTitle: {
    fontSize: FontSize.xl, fontWeight: FontWeight.extrabold,
    color: '#fff', textAlign: 'center',
  },
  predicaoSubtitle: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)',
    textAlign: 'center', lineHeight: 20,
  },
  probRow: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: BorderRadius.full, marginTop: 4,
  },
  probLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)' },
  probValue: { fontSize: FontSize.md, fontWeight: FontWeight.extrabold, color: '#fff' },
  predicaoDisclaimer: {
    fontSize: FontSize.xs, color: Colors.textLight,
    textAlign: 'center', lineHeight: 16,
  },

  disclaimerBox: {
    backgroundColor: Colors.warningLight, borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.warning + '40',
  },
  disclaimerText: { fontSize: FontSize.xs, color: Colors.text, lineHeight: 18 },
  recCard: {},
  recHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.md },
  recTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  recRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  recDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  recText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: Spacing.lg },
  contactTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: 4 },
  contactText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  infoCard: {},
  infoTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  infoText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
});
