import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Calendar } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { RootStackParamList } from '../../types';

type Route = RouteProp<RootStackParamList, 'TipDetail'>;

const CAT_COLORS: Record<string, [string, string]> = {
  Exercício:    ['#4CAF82', '#2E9E6B'],
  Alimentação:  ['#F97316', '#EA580C'],
  Emergência:   ['#EF4444', '#DC2626'],
  'Bem-estar':  ['#8B5CF6', '#6D28D9'],
  Monitoramento:['#3B8ED0', '#2563EB'],
};

export default function TipDetailScreen() {
  const route = useRoute<Route>();
  const { tip } = route.params;
  const gradientColors = CAT_COLORS[tip.category] || ['#4CAF82', '#2E9E6B'];

  // Simple markdown-ish renderer
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <Text key={i} style={styles.h2}>{line.replace('## ', '')}</Text>;
      }
      if (line.startsWith('### ')) {
        return <Text key={i} style={styles.h3}>{line.replace('### ', '')}</Text>;
      }
      if (line.startsWith('• ')) {
        return (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={styles.bulletText}>{line.replace('• ', '')}</Text>
          </View>
        );
      }
      if (line.match(/^\d+\. /)) {
        const num = line.match(/^(\d+)\. /)?.[1];
        const text = line.replace(/^\d+\. /, '');
        return (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.numLabel}>{num}.</Text>
            <Text style={styles.bulletText}>{text}</Text>
          </View>
        );
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <Text key={i} style={styles.bold}>{line.replace(/\*\*/g, '')}</Text>;
      }
      if (line.trim() === '') {
        return <View key={i} style={{ height: 8 }} />;
      }
      return <Text key={i} style={styles.paragraph}>{line}</Text>;
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title={tip.category} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={gradientColors as [string, string]} style={styles.hero}>
          <Text style={styles.heroTitle}>{tip.title}</Text>
          <Text style={styles.heroSummary}>{tip.summary}</Text>
          <View style={styles.hersMeta}>
            <View style={styles.metaItem}>
              <Clock size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{tip.readTime} min de leitura</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metaText}>{tip.date.split('-').reverse().join('/')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {renderContent(tip.content)}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚕️ Este conteúdo tem caráter educativo e informativo. Sempre consulte seu médico antes de fazer mudanças no seu tratamento.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { padding: Spacing.xl, paddingBottom: 32 },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', lineHeight: 32, marginBottom: 10 },
  heroSummary: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.9)', lineHeight: 22, marginBottom: 16 },
  hersMeta: { flexDirection: 'row', gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)' },
  content: { padding: Spacing.xl },
  h2: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.text, marginBottom: 12, marginTop: 8 },
  h3: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 8, marginTop: 12 },
  paragraph: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24, marginBottom: 8 },
  bold: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 6 },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  bulletDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.primary, marginTop: 9 },
  numLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, minWidth: 20 },
  bulletText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24 },
  disclaimer: {
    margin: Spacing.lg, padding: Spacing.md,
    backgroundColor: Colors.secondaryLight, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.secondary + '30',
  },
  disclaimerText: { fontSize: FontSize.xs, color: Colors.text, lineHeight: 18 },
});
