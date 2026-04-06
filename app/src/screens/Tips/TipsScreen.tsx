import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Clock, ChevronRight, BookOpen, Star, ArrowLeft } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import { Card } from '../../components/common/Card';
import { MOCK_TIPS } from '../../data/mockData';
import { RootStackParamList } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = ['Todos', 'Exercício', 'Alimentação', 'Emergência', 'Bem-estar'];

const CAT_COLORS: Record<string, string> = {
  Exercício: Colors.primary,
  Alimentação: Colors.orange,
  Emergência: Colors.danger,
  'Bem-estar': Colors.purple,
  Monitoramento: Colors.secondary,
};

const CAT_EMOJIS: Record<string, string> = {
  Exercício: '🏃',
  Alimentação: '🥗',
  Emergência: '🚨',
  'Bem-estar': '🧘',
  Monitoramento: '📊',
};

export default function TipsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('Todos');

  const featured = MOCK_TIPS.filter(t => t.featured);
  const filtered  = MOCK_TIPS.filter(t => category === 'Todos' || t.category === category);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient
        colors={['#4CAF82', '#2E9E6B']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.headerTitle}>Dicas & Artigos</Text>
            <Text style={styles.headerSub}>Conteúdo educativo sobre diabetes</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catBar} contentContainerStyle={styles.catContent}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.catBtn, category === c && styles.catBtnActive]}
              onPress={() => setCategory(c)}
            >
              {c !== 'Todos' && <Text style={styles.catEmoji}>{CAT_EMOJIS[c]}</Text>}
              <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured */}
        {category === 'Todos' && featured.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Star size={16} color={Colors.warning} />
              <Text style={styles.sectionTitle}>Em Destaque</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
              {featured.map(tip => (
                <TouchableOpacity
                  key={tip.id}
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('TipDetail', { tip })}
                >
                  <LinearGradient
                    colors={[CAT_COLORS[tip.category] || Colors.primary, (CAT_COLORS[tip.category] || Colors.primary) + 'BB']}
                    style={styles.featuredGradient}
                  >
                    <View style={styles.featuredCatTag}>
                      <Text style={styles.featuredCatText}>{tip.category}</Text>
                    </View>
                    <Text style={styles.featuredTitle}>{tip.title}</Text>
                    <Text style={styles.featuredSummary} numberOfLines={2}>{tip.summary}</Text>
                    <View style={styles.featuredFooter}>
                      <Clock size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.featuredTime}>{tip.readTime} min de leitura</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All articles */}
        <View style={styles.articlesSection}>
          <View style={styles.sectionHeader}>
            <BookOpen size={16} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>
              {category === 'Todos' ? 'Todos os Artigos' : category}
            </Text>
          </View>

          {filtered.map(tip => {
            const color = CAT_COLORS[tip.category] || Colors.primary;
            return (
              <TouchableOpacity
                key={tip.id}
                onPress={() => navigation.navigate('TipDetail', { tip })}
                activeOpacity={0.7}
              >
                <Card style={styles.articleCard} padding={14}>
                  <View style={styles.articleRow}>
                    <View style={[styles.articleIcon, { backgroundColor: color + '20' }]}>
                      <Text style={styles.articleEmoji}>{CAT_EMOJIS[tip.category] || '📖'}</Text>
                    </View>
                    <View style={styles.articleContent}>
                      <View style={styles.articleTagRow}>
                        <View style={[styles.articleTag, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.articleTagText, { color }]}>{tip.category}</Text>
                        </View>
                        {tip.featured && (
                          <View style={styles.featuredBadge}>
                            <Star size={10} color={Colors.warning} />
                            <Text style={styles.featuredBadgeText}>Destaque</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.articleTitle}>{tip.title}</Text>
                      <Text style={styles.articleSummary} numberOfLines={2}>{tip.summary}</Text>
                      <View style={styles.articleFooter}>
                        <Clock size={11} color={Colors.textLight} />
                        <Text style={styles.articleTime}>{tip.readTime} min</Text>
                        <Text style={styles.articleDate}>{tip.date.split('-').reverse().join('/')}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color={Colors.textLight} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerTopRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
  catBar: { backgroundColor: Colors.card, maxHeight: 52, borderBottomWidth: 1, borderBottomColor: Colors.border },
  catContent: { paddingHorizontal: Spacing.lg, paddingVertical: 8, gap: 8, alignItems: 'center' },
  catBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  catBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catEmoji: { fontSize: 14 },
  catText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catTextActive: { color: '#fff' },
  featuredSection: { paddingTop: Spacing.lg, marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  featuredScroll: { paddingHorizontal: Spacing.lg, gap: 12 },
  featuredCard: { width: 240, borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.md },
  featuredGradient: { padding: Spacing.lg, height: 160, justifyContent: 'space-between' },
  featuredCatTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  featuredCatText: { color: '#fff', fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  featuredTitle: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.extrabold, lineHeight: 22 },
  featuredSummary: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.xs, lineHeight: 16 },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredTime: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },
  articlesSection: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 8 },
  articleCard: {},
  articleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  articleIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  articleEmoji: { fontSize: 22 },
  articleContent: { flex: 1 },
  articleTagRow: { flexDirection: 'row', gap: 6, marginBottom: 4, alignItems: 'center' },
  articleTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  articleTagText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.warningLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  featuredBadgeText: { fontSize: FontSize.xs, color: Colors.warning, fontWeight: FontWeight.medium },
  articleTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 2 },
  articleSummary: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16 },
  articleFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  articleTime: { fontSize: FontSize.xs, color: Colors.textLight },
  articleDate: { fontSize: FontSize.xs, color: Colors.textLight, marginLeft: 8 },
});
