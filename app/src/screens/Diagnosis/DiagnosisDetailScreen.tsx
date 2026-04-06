import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
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
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { result } = route.params;
  const { riskLevel, score, percentage } = result;

  const riskColor = getRiskColor(riskLevel);
  const rec = RECOMMENDATIONS[riskLevel];
  const gradients: Record<string, [string, string]> = {
    low: ['#4CAF82', '#2E9E6B'],
    medium: ['#F59E0B', '#D97706'],
    high: ['#EF4444', '#DC2626'],
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Resultado" subtitle="Pré-diagnóstico" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Result banner */}
        <LinearGradient colors={gradients[riskLevel]} style={styles.banner}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>{percentage}%</Text>
            <Text style={styles.scoreLabel}>de risco</Text>
          </View>
          <Text style={styles.riskLabel}>{getRiskLabel(riskLevel)}</Text>
          <Text style={styles.riskSub}>{rec.title}</Text>
          <Text style={styles.scoreDetail}>Pontuação: {score} / {result.score + (30 - result.score)}</Text>
        </LinearGradient>

        <View style={styles.content}>
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

          {/* What is diabetes info */}
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Saiba mais</Text>
            <Text style={styles.infoText}>
              O diabetes tipo 2 pode ser prevenido ou atrasado com mudanças no estilo de vida. Perda de 5-7% do peso corporal, alimentação saudável e 150 minutos de exercício por semana reduzem em até 58% o risco de desenvolver diabetes.
            </Text>
          </Card>

          <Button
            title="Refazer Questionário"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{ marginTop: Spacing.sm }}
          />
          <Button
            title="Ir ao Início"
            onPress={() => (navigation as any).navigate('Main')}
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
  scoreDetail: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  content: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
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
