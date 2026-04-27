import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dumbbell, Plus, ArrowLeft, Flame, Clock, Zap,
  Edit2, Trash2, X, Check, ChevronDown,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ExerciseEntry } from '../../types';
import type { IntensidadeApp } from '../../services/api';

const { height: SCREEN_H } = Dimensions.get('window');

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS_EXERCICIO = [
  'Corrida', 'Caminhada', 'Ciclismo', 'Natação', 'Musculação',
  'Yoga', 'Futebol', 'Basquete', 'Vôlei', 'Tênis',
  'Pilates', 'HIIT', 'Funcional', 'Dança', 'Outro',
];

const INTENSIDADES: { value: IntensidadeApp; label: string; color: string }[] = [
  { value: 'low',      label: 'Leve',     color: '#4CAF82' },
  { value: 'moderate', label: 'Moderada', color: '#F97316' },
  { value: 'high',     label: 'Intensa',  color: '#EF4444' },
];

function intensidadeLabel(i: IntensidadeApp) {
  return INTENSIDADES.find(x => x.value === i)?.label ?? i;
}
function intensidadeColor(i: IntensidadeApp) {
  return INTENSIDADES.find(x => x.value === i)?.color ?? Colors.primary;
}
function todayString() {
  return new Date().toISOString().split('T')[0];
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}
function dateLabel(date: string) {
  const today = todayString();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (date === today) return 'Hoje';
  if (date === yesterday) return 'Ontem';
  return date.split('-').reverse().join('/');
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  type: string;
  duration: string;
  calories: string;
  date: string;
  time: string;
  intensity: IntensidadeApp;
  notes: string;
}

function emptyForm(): FormState {
  return { type: 'Corrida', duration: '', calories: '', date: todayString(), time: nowTime(), intensity: 'moderate', notes: '' };
}
function entryToForm(e: ExerciseEntry): FormState {
  return { type: e.type, duration: String(e.duration), calories: String(e.calories), date: e.date, time: e.time, intensity: e.intensity, notes: e.notes ?? '' };
}

// ─── Tipo Picker (inline dropdown) ───────────────────────────────────────────

function TypePicker({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity style={fm.picker} onPress={() => setOpen(o => !o)} activeOpacity={0.8}>
        <Text style={fm.pickerText}>{value}</Text>
        <ChevronDown size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
      {open && (
        <View style={fm.dropdown}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {TIPOS_EXERCICIO.map(o => (
              <TouchableOpacity
                key={o}
                style={fm.dropItem}
                onPress={() => { onChange(o); setOpen(false); }}
              >
                <Text style={[fm.dropText, o === value && fm.dropSelected]}>{o}</Text>
                {o === value && <Check size={14} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  entry, onCancel, onConfirm,
}: {
  entry: ExerciseEntry;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={ov.backdrop}>
      <View style={ov.box}>
        <View style={ov.iconWrap}>
          <Trash2 size={24} color="#EF4444" />
        </View>
        <Text style={ov.title}>Excluir exercício</Text>
        <Text style={ov.msg}>Deseja excluir <Text style={{ fontWeight: FontWeight.bold }}>"{entry.type}"</Text>? Esta ação não pode ser desfeita.</Text>
        <View style={ov.btnRow}>
          <TouchableOpacity style={ov.cancelBtn} onPress={onCancel}>
            <Text style={ov.cancelTxt}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ov.deleteBtn} onPress={onConfirm}>
            <Text style={ov.deleteTxt}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const ov = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    paddingHorizontal: 32,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  msg: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelTxt: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  deleteBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.lg,
    backgroundColor: '#EF4444', alignItems: 'center',
  },
  deleteTxt: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
});

// ─── Form Panel (bottom sheet sem Modal nativo) ────────────────────────────

function dateToString(d: Date) {
  return d.toISOString().split('T')[0];
}
function stringToDate(s: string) {
  const d = new Date(s + 'T12:00:00');
  return isNaN(d.getTime()) ? new Date() : d;
}
function formatDateDisplay(s: string) {
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

function ExerciseFormPanel({
  visible, editing, onClose, onSave, loading,
}: {
  visible: boolean;
  editing: ExerciseEntry | null;
  onClose: () => void;
  onSave: (form: FormState) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setForm(editing ? entryToForm(editing) : emptyForm());
      setError('');
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
  }, [visible, editing]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.type.trim()) { setError('Selecione o tipo de exercício.'); return; }
    const dur = Number(form.duration);
    if (!form.duration || isNaN(dur) || dur <= 0) { setError('Informe a duração em minutos (ex: 45).'); return; }
    setError('');
    await onSave(form);
  }

  const dateObj = stringToDate(form.date);

  // Monta Date com hora do form para o time picker
  const timeObj = (() => {
    const [h, m] = form.time.split(':').map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  })();

  if (!visible) return null;

  return (
    <View style={fp.overlay} pointerEvents="box-none">
      <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={fp.kav}
        pointerEvents="box-none"
      >
        <View style={fp.sheet}>
          {/* Header */}
          <View style={fp.header}>
            <Text style={fp.title}>{editing ? 'Editar Exercício' : 'Novo Exercício'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={fp.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {!!error && (
              <View style={fp.errorBox}>
                <Text style={fp.errorText}>{error}</Text>
              </View>
            )}

            {/* Tipo */}
            <Text style={fp.label}>Tipo de Exercício</Text>
            <TypePicker value={form.type} onChange={v => set('type', v)} />

            {/* Intensidade */}
            <Text style={fp.label}>Intensidade</Text>
            <View style={fp.intensRow}>
              {INTENSIDADES.map(i => (
                <TouchableOpacity
                  key={i.value}
                  style={[fp.intensBtn, form.intensity === i.value && { backgroundColor: i.color + '20', borderColor: i.color }]}
                  onPress={() => set('intensity', i.value)}
                  activeOpacity={0.7}
                >
                  <Zap size={14} color={form.intensity === i.value ? i.color : Colors.textLight} />
                  <Text style={[fp.intensText, form.intensity === i.value && { color: i.color, fontWeight: FontWeight.bold }]}>
                    {i.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Duração + Calorias */}
            <View style={fp.row}>
              <View style={fp.half}>
                <Text style={fp.label}>Duração (min)</Text>
                <TextInput
                  style={fp.input}
                  value={form.duration}
                  onChangeText={v => set('duration', v)}
                  keyboardType="numeric"
                  placeholder="45"
                  placeholderTextColor={Colors.textLight}
                  returnKeyType="next"
                />
              </View>
              <View style={fp.half}>
                <Text style={fp.label}>Calorias (kcal)</Text>
                <TextInput
                  style={fp.input}
                  value={form.calories}
                  onChangeText={v => set('calories', v)}
                  keyboardType="numeric"
                  placeholder="300"
                  placeholderTextColor={Colors.textLight}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Data */}
            <Text style={fp.label}>Data</Text>
            <TouchableOpacity
              style={fp.dateBtn}
              onPress={() => { setShowDatePicker(p => !p); setShowTimePicker(false); }}
              activeOpacity={0.8}
            >
              <Text style={fp.dateBtnText}>{formatDateDisplay(form.date)}</Text>
              <ChevronDown size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            {showDatePicker && (
              <View style={fp.pickerWrap}>
                <DateTimePicker
                  value={dateObj}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                  onChange={(_, selected) => {
                    if (selected) {
                      set('date', dateToString(selected));
                      if (Platform.OS === 'android') setShowDatePicker(false);
                    }
                  }}
                  maximumDate={new Date()}
                  locale="pt-BR"
                  style={fp.iosPicker}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={fp.pickerDone} onPress={() => setShowDatePicker(false)}>
                    <Text style={fp.pickerDoneText}>OK</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Hora */}
            <Text style={fp.label}>Hora</Text>
            <TouchableOpacity
              style={fp.dateBtn}
              onPress={() => { setShowTimePicker(p => !p); setShowDatePicker(false); }}
              activeOpacity={0.8}
            >
              <Text style={fp.dateBtnText}>{form.time}</Text>
              <ChevronDown size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            {showTimePicker && (
              <View style={fp.pickerWrap}>
                <DateTimePicker
                  value={timeObj}
                  mode="time"
                  is24Hour
                  display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
                  onChange={(_, selected) => {
                    if (selected) {
                      const h = String(selected.getHours()).padStart(2, '0');
                      const m = String(selected.getMinutes()).padStart(2, '0');
                      set('time', `${h}:${m}`);
                      if (Platform.OS === 'android') setShowTimePicker(false);
                    }
                  }}
                  style={fp.iosPicker}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={fp.pickerDone} onPress={() => setShowTimePicker(false)}>
                    <Text style={fp.pickerDoneText}>OK</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Notas */}
            <Text style={fp.label}>Observações (opcional)</Text>
            <TextInput
              style={[fp.input, fp.textarea]}
              value={form.notes}
              onChangeText={v => set('notes', v)}
              multiline
              numberOfLines={3}
              placeholder="Ex: treino no parque, sem dores..."
              placeholderTextColor={Colors.textLight}
              textAlignVertical="top"
            />

            <View style={{ height: 16 }} />
          </ScrollView>

          {/* Footer */}
          <View style={fp.footer}>
            <TouchableOpacity style={fp.cancelBtn} onPress={onClose}>
              <Text style={fp.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[fp.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Check size={16} color="#fff" />}
              <Text style={fp.saveText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const fp = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_H * 0.92,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  body: { padding: Spacing.lg },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: BorderRadius.md, padding: 10, marginBottom: 12 },
  errorText: { color: '#DC2626', fontSize: FontSize.sm },
  label: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, marginBottom: 6, marginTop: 12,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: FontSize.md, color: Colors.text, backgroundColor: Colors.background,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: Colors.background,
  },
  pickerText: { fontSize: FontSize.md, color: Colors.text },
  dropdown: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    backgroundColor: '#fff', marginTop: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
    zIndex: 999,
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  dropText: { fontSize: FontSize.md, color: Colors.text },
  dropSelected: { fontWeight: FontWeight.bold, color: Colors.primary },
  intensRow: { flexDirection: 'row', gap: 8 },
  intensBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingVertical: 10, backgroundColor: Colors.background,
  },
  intensText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footer: {
    flexDirection: 'row', gap: 12, padding: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  cancelBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border,
  },
  cancelText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  saveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: BorderRadius.lg,
  },
  saveText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#fff' },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: Colors.background,
  },
  dateBtnText: { fontSize: FontSize.md, color: Colors.text },
  pickerWrap: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    backgroundColor: '#fff', marginTop: 4, overflow: 'hidden',
  },
  iosPicker: { alignSelf: 'stretch' },
  pickerDone: {
    alignItems: 'center', paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  pickerDoneText: { color: Colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.md },
});

const fm = StyleSheet.create({
  picker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: 12, paddingVertical: 11, backgroundColor: Colors.background,
  },
  pickerText: { fontSize: FontSize.md, color: Colors.text },
  dropdown: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    backgroundColor: '#fff', marginTop: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
    zIndex: 999,
  },
  dropItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  dropText: { fontSize: FontSize.md, color: Colors.text },
  dropSelected: { fontWeight: FontWeight.bold, color: Colors.primary },
});

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function ExerciseScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { exercises, loadExercicios, exerciciosLoading, addExercise, editExercise, deleteExercise } = useApp();

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<ExerciseEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deletingEntry, setDeletingEntry] = useState<ExerciseEntry | null>(null);

  useFocusEffect(useCallback(() => { loadExercicios(); }, [loadExercicios]));

  const totalSessoes  = exercises.length;
  const totalMinutos  = exercises.reduce((s, e) => s + e.duration, 0);
  const totalCalorias = exercises.reduce((s, e) => s + e.calories, 0);

  const grouped = exercises.reduce<Record<string, ExerciseEntry[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  async function handleSave(form: FormState) {
    setSaving(true);
    setSaveError('');
    try {
      const params = {
        type:      form.type,
        duration:  Number(form.duration),
        calories:  Number(form.calories) || 0,
        date:      form.date,
        time:      form.time,
        intensity: form.intensity,
        notes:     form.notes || undefined,
      };
      if (editing) {
        await editExercise(editing.id, params);
      } else {
        await addExercise(params);
      }
      setFormVisible(false);
      setEditing(null);
    } catch (e: any) {
      setSaveError(e.message ?? 'Não foi possível salvar o exercício.');
    } finally {
      setSaving(false);
    }
  }

  function openEdit(entry: ExerciseEntry) {
    setEditing(entry);
    setSaveError('');
    setFormVisible(true);
  }

  function openAdd() {
    setEditing(null);
    setSaveError('');
    setFormVisible(true);
  }

  function closeForm() {
    setFormVisible(false);
    setEditing(null);
    setSaveError('');
  }

  async function confirmDelete() {
    if (!deletingEntry) return;
    await deleteExercise(deletingEntry.id);
    setDeletingEntry(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={[s.header, { paddingTop: insets.top + 16 }]}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Exercícios</Text>
            <Text style={s.headerSub}>{totalSessoes} sessão{totalSessoes !== 1 ? 'ões' : ''} registrada{totalSessoes !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={s.kpiRow}>
          <View style={s.kpiCard}>
            <Clock size={16} color="rgba(255,255,255,0.8)" />
            <Text style={s.kpiValue}>{totalMinutos < 60 ? `${totalMinutos}min` : `${(totalMinutos / 60).toFixed(1)}h`}</Text>
            <Text style={s.kpiLabel}>Tempo total</Text>
          </View>
          <View style={s.kpiDivider} />
          <View style={s.kpiCard}>
            <Flame size={16} color="rgba(255,255,255,0.8)" />
            <Text style={s.kpiValue}>{totalCalorias.toLocaleString('pt-BR')} kcal</Text>
            <Text style={s.kpiLabel}>Calorias gastas</Text>
          </View>
          <View style={s.kpiDivider} />
          <View style={s.kpiCard}>
            <Dumbbell size={16} color="rgba(255,255,255,0.8)" />
            <Text style={s.kpiValue}>{totalSessoes}</Text>
            <Text style={s.kpiLabel}>Sessões</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Lista */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={exerciciosLoading} onRefresh={loadExercicios} tintColor="#8B5CF6" />}
        keyboardShouldPersistTaps="handled"
      >
        {exerciciosLoading && exercises.length === 0 && (
          <View style={s.centered}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}

        {!exerciciosLoading && exercises.length === 0 && (
          <View style={s.empty}>
            <Dumbbell size={52} color={Colors.border} />
            <Text style={s.emptyTitle}>Nenhum exercício</Text>
            <Text style={s.emptySub}>Toque em + para registrar sua primeira atividade.</Text>
          </View>
        )}

        {saveError ? (
          <View style={s.saveErrBox}>
            <Text style={s.saveErrText}>{saveError}</Text>
          </View>
        ) : null}

        {sortedDates.map(date => (
          <View key={date} style={s.group}>
            <Text style={s.dateLabel}>{dateLabel(date)}</Text>
            {grouped[date].map(entry => {
              const color = intensidadeColor(entry.intensity);
              return (
                <Card key={entry.id} style={s.card} padding={0}>
                  <View style={[s.cardAccent, { backgroundColor: color }]} />
                  <View style={s.cardBody}>
                    <View style={s.cardTop}>
                      <View style={[s.iconWrap, { backgroundColor: color + '18' }]}>
                        <Dumbbell size={18} color={color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.cardTitle}>{entry.type}</Text>
                        <View style={[s.badge, { backgroundColor: color + '18' }]}>
                          <Text style={[s.badgeText, { color }]}>{intensidadeLabel(entry.intensity)}</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={s.action} onPress={() => openEdit(entry)}>
                        <Edit2 size={15} color={Colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={s.action} onPress={() => setDeletingEntry(entry)}>
                        <Trash2 size={15} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>

                    <View style={s.cardStats}>
                      <View style={s.stat}>
                        <Clock size={13} color={Colors.textSecondary} />
                        <Text style={s.statText}>{entry.duration} min</Text>
                      </View>
                      <View style={s.stat}>
                        <Flame size={13} color={Colors.orange} />
                        <Text style={s.statText}>{entry.calories} kcal</Text>
                      </View>
                      <Text style={s.statTime}>{entry.time}</Text>
                    </View>

                    {!!entry.notes && <Text style={s.notes} numberOfLines={2}>{entry.notes}</Text>}
                  </View>
                </Card>
              );
            })}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Overlay: form panel */}
      <ExerciseFormPanel
        visible={formVisible}
        editing={editing}
        onClose={closeForm}
        onSave={handleSave}
        loading={saving}
      />

      {/* Overlay: delete confirm */}
      {deletingEntry && (
        <DeleteConfirm
          entry={deletingEntry}
          onCancel={() => setDeletingEntry(null)}
          onConfirm={confirmDelete}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  kpiRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: BorderRadius.xl, padding: Spacing.md },
  kpiCard: { flex: 1, alignItems: 'center', gap: 4 },
  kpiDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  kpiValue: { fontSize: FontSize.md, fontWeight: FontWeight.extrabold, color: '#fff' },
  kpiLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  content: { padding: Spacing.lg },
  centered: { alignItems: 'center', paddingVertical: 60 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  emptySub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  saveErrBox: { backgroundColor: '#FEE2E2', borderRadius: BorderRadius.md, padding: 12, marginBottom: 12 },
  saveErrText: { color: '#DC2626', fontSize: FontSize.sm },
  group: { marginBottom: Spacing.lg },
  dateLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  card: { marginBottom: 10, flexDirection: 'row', overflow: 'hidden' },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 10, fontWeight: FontWeight.semibold },
  action: { padding: 6 },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  statTime: { marginLeft: 'auto', fontSize: FontSize.xs, color: Colors.textLight },
  notes: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 8, fontStyle: 'italic' },
});
