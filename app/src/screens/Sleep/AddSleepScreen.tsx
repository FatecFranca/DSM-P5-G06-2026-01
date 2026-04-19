import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Moon, Clock, Star, FileText, X, Check,
  Calendar, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { SleepEntry } from '../../types';

type QualityKey = SleepEntry['quality'];

const QUALITY_OPTIONS: Array<{ key: QualityKey; label: string; color: string; bg: string; stars: number; desc: string }> = [
  { key: 'excellent', label: 'Excelente', color: Colors.primary,   bg: Colors.primaryLight,  stars: 4, desc: 'Dormiu bem, descansado(a)' },
  { key: 'good',      label: 'Boa',       color: Colors.secondary, bg: Colors.secondaryLight, stars: 3, desc: 'Sono razoável, aceitável' },
  { key: 'fair',      label: 'Regular',   color: Colors.warning,   bg: Colors.warningLight,  stars: 2, desc: 'Sono interrompido ou curto' },
  { key: 'poor',      label: 'Ruim',      color: Colors.danger,    bg: Colors.dangerLight,   stars: 1, desc: 'Não descansou bem' },
];

const DURATION_SHORTCUTS = [5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function calcDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let minutes = (wh * 60 + wm) - (bh * 60 + bm);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 10) / 10;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

function DatePicker({
  value, onChange, disabledDates = [],
}: { value: string; onChange: (d: string) => void; disabledDates?: string[] }) {
  const [visible, setVisible] = useState(false);
  const today = todayStr();
  const init = value ? value.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
  const [viewYear, setViewYear] = useState(init[0] ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(init[1] ?? new Date().getMonth() + 1);

  function prevMonth() {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function padISO(day: number) {
    return `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function selectDay(day: number) {
    onChange(padISO(day));
    setVisible(false);
  }

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setVisible(true)} activeOpacity={0.7}>
        <Calendar size={16} color={Colors.purple} />
        <Text style={styles.dateBtnText}>{value ? formatDateDisplay(value) : 'Selecionar data'}</Text>
        <ChevronDown size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.calendarOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setVisible(false)} />
          <View style={styles.calendarModal}>
            {/* Nav */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.calendarNavBtn}>
                <ChevronLeft size={20} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthYear}>{MONTH_NAMES[viewMonth - 1]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calendarNavBtn}>
                <ChevronRight size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.calendarDayNames}>
              {['D','S','T','Q','Q','S','S'].map((d, i) => (
                <Text key={i} style={styles.calendarDayNameText}>{d}</Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={styles.calendarGrid}>
              {cells.map((day, i) => {
                if (day === null) return <View key={i} style={styles.calendarCell} />;
                const iso = padISO(day);
                const isSelected = iso === value;
                const isToday = iso === today;
                const isDisabled = disabledDates.includes(iso);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.calendarCell,
                      isSelected && styles.calendarCellSelected,
                      isDisabled && styles.calendarCellDisabled,
                    ]}
                    onPress={() => !isDisabled && selectDay(day)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      isToday && !isSelected && styles.calendarDayToday,
                      isSelected && styles.calendarDaySelectedText,
                      isDisabled && styles.calendarDayDisabledText,
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.calendarCloseBtn} onPress={() => setVisible(false)}>
              <Text style={styles.calendarCloseBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddSleepScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { addSleepEntry, updateSleepEntry, sleepEntries } = useApp();

  const editing: SleepEntry | undefined = route.params?.editing;

  const [date, setDate] = useState(editing?.date ?? todayStr());
  const [bedtime, setBedtime] = useState(editing?.bedtime ?? '22:30');
  const [wakeTime, setWakeTime] = useState(editing?.wakeTime ?? '06:30');
  const [quality, setQuality] = useState<QualityKey>(editing?.quality ?? 'good');
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const duration = calcDuration(bedtime, wakeTime);

  const takenDates = sleepEntries
    .filter(e => e.id !== editing?.id)
    .map(e => e.date);

  const dateAlreadyTaken = takenDates.includes(date);

  function applyShortcut(hours: number) {
    const [wh, wm] = wakeTime.split(':').map(Number);
    let totalBedMinutes = (wh * 60 + wm) - hours * 60;
    if (totalBedMinutes < 0) totalBedMinutes += 24 * 60;
    const bh = Math.floor(totalBedMinutes / 60);
    const bm = totalBedMinutes % 60;
    setBedtime(`${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`);
  }

  async function handleSave() {
    if (!bedtime.match(/^([01]\d|2[0-3]):[0-5]\d$/) || !wakeTime.match(/^([01]\d|2[0-3]):[0-5]\d$/)) {
      Alert.alert('Horário inválido', 'Use o formato HH:MM (ex: 22:30)');
      return;
    }
    if (dateAlreadyTaken) {
      Alert.alert('Data já registrada', 'Já existe um registro de sono para esta data.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateSleepEntry(editing.id, {
          date, bedtime, wakeTime, duration, quality,
          notes: notes.trim() || undefined,
        });
      } else {
        await addSleepEntry({
          date, bedtime, wakeTime, duration, quality,
          notes: notes.trim() || undefined,
        });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o registro. Verifique sua conexão.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editing ? 'Editar Sono' : 'Registrar Sono'}</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          disabled={saving}
        >
          <Check size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Duration preview */}
        <Card style={styles.previewCard}>
          <Moon size={28} color={Colors.purple} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewDuration}>{duration}h de sono</Text>
            <Text style={styles.previewSub}>{bedtime} → {wakeTime}</Text>
          </View>
          <View style={[
            styles.previewBadge,
            { backgroundColor: duration >= 7 ? Colors.primaryLight : Colors.warningLight },
          ]}>
            <Text style={[
              styles.previewBadgeText,
              { color: duration >= 7 ? Colors.primary : Colors.warning },
            ]}>
              {duration >= 8 ? 'Ótimo' : duration >= 7 ? 'Bom' : duration >= 6 ? 'Regular' : 'Curto'}
            </Text>
          </View>
        </Card>

        {/* Date picker */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={16} color={Colors.purple} />
            <Text style={styles.sectionTitle}>Data</Text>
          </View>
          <DatePicker value={date} onChange={setDate} disabledDates={takenDates} />
          {dateAlreadyTaken && (
            <Text style={styles.dateError}>Esta data já possui um registro de sono</Text>
          )}
        </Card>

        {/* Times */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color={Colors.purple} />
            <Text style={styles.sectionTitle}>Horários</Text>
          </View>
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>Dormiu às</Text>
              <TextInput
                style={styles.timeInput}
                value={bedtime}
                onChangeText={setBedtime}
                placeholder="22:30"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
            <Moon size={20} color={Colors.purple} />
            <View style={styles.timeField}>
              <Text style={styles.timeLabel}>Acordou às</Text>
              <TextInput
                style={styles.timeInput}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="06:30"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>
        </Card>

        {/* Duration shortcuts */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={16} color={Colors.purple} />
            <Text style={styles.sectionTitle}>Duração rápida (calcula hora de dormir)</Text>
          </View>
          <View style={styles.shortcuts}>
            {DURATION_SHORTCUTS.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.shortcutBtn, duration === h && styles.shortcutBtnActive]}
                onPress={() => applyShortcut(h)}
              >
                <Text style={[styles.shortcutText, duration === h && styles.shortcutTextActive]}>
                  {h}h
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Quality */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={16} color={Colors.purple} />
            <Text style={styles.sectionTitle}>Qualidade do sono</Text>
          </View>
          <View style={styles.qualityOptions}>
            {QUALITY_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.qualityOption,
                  { borderColor: quality === opt.key ? opt.color : Colors.border },
                  quality === opt.key && { backgroundColor: opt.bg },
                ]}
                onPress={() => setQuality(opt.key)}
              >
                <View style={styles.qualityStars}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      color={i < opt.stars ? opt.color : Colors.borderLight}
                      fill={i < opt.stars ? opt.color : 'transparent'}
                    />
                  ))}
                </View>
                <Text style={[styles.qualityOptionLabel, { color: quality === opt.key ? opt.color : Colors.text }]}>
                  {opt.label}
                </Text>
                <Text style={styles.qualityOptionDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Notes */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={16} color={Colors.purple} />
            <Text style={styles.sectionTitle}>Observações (opcional)</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ex: acordei uma vez, pesadelo, muita sede..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.charCount}>{notes.length}/500</Text>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    backgroundColor: Colors.card,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.purple, borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  content: { padding: Spacing.lg, gap: Spacing.md },
  previewCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.purpleLight,
  },
  previewInfo: { flex: 1 },
  previewDuration: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.purple },
  previewSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  previewBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  previewBadgeText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  section: { gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  // Date picker button
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.background, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  dateBtnText: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  dateError: { fontSize: FontSize.xs, color: Colors.danger, marginTop: 2 },
  // Calendar modal
  calendarOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  calendarModal: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: Spacing.md, width: '100%', maxWidth: 340,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 12,
  },
  calendarHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  calendarNavBtn: { padding: 8 },
  calendarMonthYear: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  calendarDayNames: {
    flexDirection: 'row', marginBottom: 4,
  },
  calendarDayNameText: {
    flex: 1, textAlign: 'center',
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary,
    paddingVertical: 4,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarCell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 100,
  },
  calendarCellSelected: { backgroundColor: Colors.purple },
  calendarCellDisabled: { opacity: 0.35 },
  calendarDayText: { fontSize: FontSize.sm, color: Colors.text },
  calendarDayToday: { color: Colors.purple, fontWeight: FontWeight.bold },
  calendarDaySelectedText: { color: '#fff', fontWeight: FontWeight.bold },
  calendarDayDisabledText: { color: Colors.textLight },
  calendarCloseBtn: {
    marginTop: Spacing.sm, paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  calendarCloseBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  // Times
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  timeField: { flex: 1 },
  timeLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  timeInput: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.purple,
    textAlign: 'center',
  },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  shortcutBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: BorderRadius.lg, backgroundColor: Colors.borderLight,
  },
  shortcutBtnActive: { backgroundColor: Colors.purple },
  shortcutText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  shortcutTextActive: { color: '#fff' },
  qualityOptions: { gap: Spacing.sm },
  qualityOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 2, borderColor: Colors.border,
  },
  qualityStars: { flexDirection: 'row', gap: 2 },
  qualityOptionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, flex: 1 },
  qualityOptionDesc: { fontSize: FontSize.xs, color: Colors.textSecondary },
  notesInput: {
    backgroundColor: Colors.background, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: FontSize.md, color: Colors.text,
    minHeight: 80, textAlignVertical: 'top',
  },
  charCount: { fontSize: FontSize.xs, color: Colors.textLight, textAlign: 'right' },
});
