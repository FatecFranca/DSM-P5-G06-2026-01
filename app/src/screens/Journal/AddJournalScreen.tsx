import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { MoodType } from '../../types';
import { getMoodEmoji, getMoodLabel, getMoodColor } from '../../utils/helpers';

const MOODS: MoodType[] = ['great', 'good', 'okay', 'bad', 'terrible'];
const COMMON_SYMPTOMS = ['Cansaço', 'Tontura', 'Sede', 'Tremores', 'Sudorese', 'Dor de cabeça', 'Visão turva', 'Formigamento', 'Náusea'];
const COMMON_TAGS = ['exercício', 'alimentação', 'médico', 'medicação', 'bem-estar', 'social', 'trabalho', 'sono'];

export default function AddJournalScreen() {
  const navigation = useNavigation();
  const { addJournal } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('good');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s: string) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setTimeout(() => {
      addJournal({
        date: '2026-04-06',
        time: new Date().toTimeString().slice(0, 5),
        title: title.trim(),
        content: content.trim(),
        mood,
        symptoms,
        tags,
      });
      setLoading(false);
      navigation.goBack();
    }, 500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Novo Registro" subtitle="Como você está?" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Mood selector */}
        <Card style={styles.section}>
          <Text style={styles.label}>Como você está se sentindo?</Text>
          <View style={styles.moodRow}>
            {MOODS.map(m => {
              const active = mood === m;
              const color = getMoodColor(m);
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.moodBtn, active && { backgroundColor: color + '20', borderColor: color }]}
                  onPress={() => setMood(m)}
                >
                  <Text style={styles.moodEmoji}>{getMoodEmoji(m)}</Text>
                  <Text style={[styles.moodLabel, active && { color }]}>{getMoodLabel(m)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Title */}
        <Card style={styles.section}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Resumo do dia..."
            placeholderTextColor={Colors.textLight}
            maxLength={60}
          />
        </Card>

        {/* Content */}
        <Card style={styles.section}>
          <Text style={styles.label}>O que aconteceu?</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Descreva como foi seu dia, como você se sentiu, o que comeu, praticou exercício..."
            placeholderTextColor={Colors.textLight}
            multiline
            textAlignVertical="top"
          />
        </Card>

        {/* Symptoms */}
        <Card style={styles.section}>
          <Text style={styles.label}>Sintomas (opcional)</Text>
          <View style={styles.chipGrid}>
            {COMMON_SYMPTOMS.map(s => {
              const active = symptoms.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, active && styles.chipActiveDanger]}
                  onPress={() => toggleSymptom(s)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextDanger]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Tags */}
        <Card style={styles.section}>
          <Text style={styles.label}>Tags (opcional)</Text>
          <View style={styles.chipGrid}>
            {COMMON_TAGS.map(t => {
              const active = tags.includes(t);
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActivePrimary]}
                  onPress={() => toggleTag(t)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextPrimary]}>#{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Salvar Registro"
            onPress={handleSave}
            loading={loading}
            disabled={!title.trim() || !content.trim()}
          />
          <Button title="Cancelar" onPress={() => navigation.goBack()} variant="ghost" style={{ marginTop: 8 }} />
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.md },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, marginHorizontal: 3,
    borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  moodEmoji: { fontSize: 24, marginBottom: 4 },
  moodLabel: { fontSize: 9, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  titleInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text },
  contentInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.text, minHeight: 120 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: BorderRadius.full, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  chipActiveDanger: { backgroundColor: Colors.dangerLight, borderColor: Colors.danger },
  chipActivePrimary: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chipTextDanger: { color: Colors.danger },
  chipTextPrimary: { color: Colors.primary },
  actions: {},
});
