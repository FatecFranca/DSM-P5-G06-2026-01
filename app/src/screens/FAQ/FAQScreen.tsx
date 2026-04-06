import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, ChevronDown, ChevronUp, X, ArrowLeft } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { Card } from '../../components/common/Card';
import { FAQ_DATA } from '../../data/faqData';
import { FAQItem } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => prev === id ? null : id);
  };

  const allItems: FAQItem[] = FAQ_DATA.flatMap(c => c.items);

  const filtered = allItems.filter(item => {
    const matchSearch = item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  const displayData = search || activeCategory
    ? [{ id: 'search', title: 'Resultados', color: Colors.primary, icon: '', items: filtered }]
    : FAQ_DATA;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient
        colors={['#14B8A6', '#0D9488']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Central de Ajuda</Text>
            <Text style={styles.headerSub}>Tire suas dúvidas sobre diabetes</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catBar} contentContainerStyle={styles.catContent}>
        <TouchableOpacity
          style={[styles.catChip, !activeCategory && styles.catChipActive]}
          onPress={() => setActiveCategory(null)}
        >
          <Text style={[styles.catChipText, !activeCategory && styles.catChipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {FAQ_DATA.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catChip, activeCategory === c.title && { backgroundColor: c.color + '20', borderColor: c.color }]}
            onPress={() => setActiveCategory(activeCategory === c.title ? null : c.title)}
          >
            <Text style={[styles.catChipText, activeCategory === c.title && { color: c.color }]}>{c.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {displayData.map(category => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryCount}>{category.items.length}</Text>
            </View>

            {category.items.map(item => (
              <Card key={item.id} style={styles.faqCard} padding={0}>
                <TouchableOpacity
                  style={styles.questionRow}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  {expanded === item.id
                    ? <ChevronUp size={18} color={Colors.textSecondary} />
                    : <ChevronDown size={18} color={Colors.textSecondary} />
                  }
                </TouchableOpacity>

                {expanded === item.id && (
                  <View style={styles.answerWrap}>
                    <View style={styles.answerDivider} />
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </Card>
            ))}

            {category.items.length === 0 && (
              <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
            )}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  backBtn: { width: 36 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', marginBottom: 2,  },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginBottom: Spacing.lg },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  catBar: { backgroundColor: Colors.card, maxHeight: 52, borderBottomWidth: 1, borderBottomColor: Colors.border },
  catContent: { paddingHorizontal: Spacing.lg, paddingVertical: 10, gap: 8, alignItems: 'center' },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  catChipActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  catChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catChipTextActive: { color: '#fff' },
  listContent: { padding: Spacing.lg },
  categorySection: { marginBottom: Spacing.xl },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryTitle: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  categoryCount: { fontSize: FontSize.xs, color: Colors.textSecondary, backgroundColor: Colors.borderLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  faqCard: { marginBottom: 8},
  questionRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  questionText: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, lineHeight: 20 },
  answerWrap: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  answerDivider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: Spacing.sm },
  answerText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 20 },
});
