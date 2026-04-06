import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, BookOpen, Trash2, Tag } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { RootStackParamList } from '../../types';
import { getMoodEmoji, getMoodLabel, getMoodColor, getRelativeDate } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOODS = ['great', 'good', 'okay', 'bad', 'terrible'] as const;

export default function JournalScreen() {
  const { journals, deleteJournal } = useApp();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  const filtered = moodFilter ? journals.filter(j => j.mood === moodFilter) : journals;

  const moodCounts = MOODS.reduce<Record<string, number>>((acc, m) => {
    acc[m] = journals.filter(j => j.mood === m).length;
    return acc;
  }, {});

  const handleDelete = (id: string) => {
    Alert.alert('Excluir', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteJournal(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient
        colors={['#EC4899', '#DB2777']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Diário</Text>
            <Text style={styles.headerSub}>{journals.length} registros</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddJournal' as any)}
          >
            <Plus size={20} color={Colors.pink} />
          </TouchableOpacity>
        </View>

        {/* Mood overview */}
        <View style={styles.moodRow}>
          {MOODS.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.moodBtn, moodFilter === m && styles.moodBtnActive]}
              onPress={() => setMoodFilter(moodFilter === m ? null : m)}
            >
              <Text style={styles.moodEmoji}>{getMoodEmoji(m)}</Text>
              <Text style={styles.moodCount}>{moodCounts[m]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <BookOpen size={48} color={Colors.border} />
            <Text style={styles.emptyTitle}>Nenhum registro</Text>
            <Text style={styles.emptyText}>Registre como você está se sentindo!</Text>
          </View>
        ) : (
          filtered.map(entry => {
            const moodColor = getMoodColor(entry.mood);
            return (
              <Card key={entry.id} style={styles.entryCard} padding={16}>
                <View style={styles.entryHeader}>
                  <View style={[styles.moodBubble, { backgroundColor: moodColor + '20' }]}>
                    <Text style={styles.entryMoodEmoji}>{getMoodEmoji(entry.mood)}</Text>
                  </View>
                  <View style={styles.entryMeta}>
                    <Text style={styles.entryTitle}>{entry.title}</Text>
                    <View style={styles.entryDateRow}>
                      <Text style={styles.entryDate}>{getRelativeDate(entry.date)} • {entry.time}</Text>
                      <View style={[styles.moodTag, { backgroundColor: moodColor + '20' }]}>
                        <Text style={[styles.moodTagText, { color: moodColor }]}>{getMoodLabel(entry.mood)}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(entry.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.entryContent} numberOfLines={3}>{entry.content}</Text>

                {entry.symptoms.length > 0 && (
                  <View style={styles.symptomsRow}>
                    {entry.symptoms.map(s => (
                      <View key={s} style={styles.symptomChip}>
                        <Text style={styles.symptomText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {entry.tags.length > 0 && (
                  <View style={styles.tagsRow}>
                    <Tag size={12} color={Colors.textLight} />
                    {entry.tags.map(t => (
                      <Text key={t} style={styles.tagText}>#{t}</Text>
                    ))}
                  </View>
                )}
              </Card>
            );
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...Shadow.md },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: BorderRadius.md },
  moodBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  moodEmoji: { fontSize: 22 },
  moodCount: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', fontWeight: FontWeight.bold, marginTop: 2 },
  list: { padding: Spacing.lg, gap: 12 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 16, marginBottom: 4 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  entryCard: {},
  entryHeader: { flexDirection: 'row', gap: 12, marginBottom: 10, alignItems: 'flex-start' },
  moodBubble: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  entryMoodEmoji: { fontSize: 22 },
  entryMeta: { flex: 1 },
  entryTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  entryDateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  entryDate: { fontSize: FontSize.xs, color: Colors.textSecondary },
  moodTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  moodTagText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  entryContent: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: 10 },
  symptomsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  symptomChip: { backgroundColor: Colors.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  symptomText: { fontSize: FontSize.xs, color: Colors.danger },
  tagsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  tagText: { fontSize: FontSize.xs, color: Colors.textLight },
});
