import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplets, Plus, Edit2, Trash2, X, Check, AlertCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';

const WATER_GOAL = 2500;
const QUICK_AMOUNTS = [150, 200, 300, 500, 750];

interface WaterForm {
  data: string;
  hora: string;
  quantidade: string;
}

const TODAY = () => new Date().toISOString().split('T')[0];
const NOW_TIME = () => new Date().toTimeString().slice(0, 5);

export default function WaterScreen() {
  const {
    waterLog,
    hidratacaoLoading,
    loadHidratacao,
    criarHidratacao,
    atualizarHidratacao,
    deletarHidratacao,
    addWater,
    getTodayWater,
  } = useApp();

  const today = TODAY();
  const todayTotal = getTodayWater();
  const progress = Math.min(todayTotal / WATER_GOAL, 1);
  const remaining = Math.max(WATER_GOAL - todayTotal, 0);
  const todayLogs = [...waterLog]
    .filter(w => w.date === today)
    .sort((a, b) => b.time.localeCompare(a.time));

  const fillColor = progress >= 1 ? Colors.primary : Colors.teal;
  // Inside the filled circle: white when background is dark enough, dark otherwise
  const innerColor = progress >= 0.35 ? '#FFFFFF' : Colors.text;
  const innerSubColor = progress >= 0.35 ? 'rgba(255,255,255,0.75)' : Colors.textSecondary;

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteAmount, setDeleteAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<WaterForm>({
    data: today,
    hora: NOW_TIME(),
    quantidade: '',
  });

  useEffect(() => {
    loadHidratacao();
  }, [loadHidratacao]);

  const getGlassesCount = () => Math.floor(todayTotal / 250);

  const resetForm = useCallback(() => {
    setForm({ data: today, hora: NOW_TIME(), quantidade: '' });
    setFormError(null);
  }, [today]);

  const validateForm = (): boolean => {
    const qty = parseInt(form.quantidade, 10);
    if (!qty || qty <= 0 || qty > 5000) {
      setFormError('Quantidade inválida (1–5000 ml)');
      return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.data)) {
      setFormError('Data deve estar no formato YYYY-MM-DD');
      return false;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.hora)) {
      setFormError('Hora deve estar no formato HH:MM');
      return false;
    }
    return true;
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const openEdit = (id: string) => {
    const entry = waterLog.find(w => w.id === id);
    if (!entry) return;
    setEditId(id);
    setFormError(null);
    setForm({ data: entry.date, hora: entry.time, quantidade: String(entry.amount) });
    setShowEdit(true);
  };

  const openDelete = (id: string, amount: number) => {
    setDeleteId(id);
    setDeleteAmount(amount);
    setShowDelete(true);
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSaving(true);
    setFormError(null);
    try {
      await criarHidratacao({
        data: form.data,
        hora: form.hora,
        quantidade: parseInt(form.quantidade, 10),
      });
      setShowCreate(false);
    } catch (e: any) {
      setFormError(e.message ?? 'Erro ao salvar registro');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editId || !validateForm()) return;
    setSaving(true);
    setFormError(null);
    try {
      await atualizarHidratacao(editId, {
        data: form.data,
        hora: form.hora,
        quantidade: parseInt(form.quantidade, 10),
      });
      setShowEdit(false);
    } catch (e: any) {
      setFormError(e.message ?? 'Erro ao atualizar registro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await deletarHidratacao(deleteId);
      setShowDelete(false);
    } catch (e: any) {
      setFormError(e.message ?? 'Erro ao deletar');
    } finally {
      setSaving(false);
      setDeleteId(null);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    try {
      await addWater(amount);
    } catch {
      // silent
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Hidratação" subtitle="Acompanhe seu consumo de água" />

      {hidratacaoLoading && (
        <View style={styles.loadingBanner}>
          <ActivityIndicator size="small" color={Colors.teal} />
          <Text style={styles.loadingText}>Carregando registros...</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Main meter */}
        <Card style={styles.meterCard}>
          <View style={styles.meterCircleWrap}>
            <View style={styles.meterCircleOuter}>
              <LinearGradient
                colors={['#14B8A6', '#0D9488']}
                style={[styles.meterCircle, { opacity: 0.12 + progress * 0.88 }]}
              />
              <View style={styles.meterInner}>
                <Droplets size={32} color={innerColor} />
                <Text style={[styles.meterValue, { color: innerColor }]}>
                  {(todayTotal / 1000).toFixed(2)}L
                </Text>
                <Text style={[styles.meterGoal, { color: innerSubColor }]}>
                  de {(WATER_GOAL / 1000).toFixed(1)}L
                </Text>
              </View>
            </View>
          </View>

          <ProgressBar
            progress={progress}
            color={fillColor}
            height={10}
            showLabel
            label={`${Math.round(progress * 100)}% da meta diária`}
          />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: fillColor }]}>{getGlassesCount()}</Text>
              <Text style={styles.statLabel}>Copos (250ml)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.warning }]}>{remaining}ml</Text>
              <Text style={styles.statLabel}>Restante</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.teal }]}>{todayLogs.length}</Text>
              <Text style={styles.statLabel}>Registros</Text>
            </View>
          </View>
        </Card>

        {/* Quick add */}
        <Card style={styles.quickCard}>
          <View style={styles.quickHeader}>
            <Text style={styles.sectionTitle}>Adicionar Rápido</Text>
            <TouchableOpacity style={styles.addCustomBtn} onPress={openCreate}>
              <Plus size={16} color={Colors.teal} />
              <Text style={styles.addCustomText}>Personalizado</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.quickGrid}>
            {QUICK_AMOUNTS.map(amount => (
              <TouchableOpacity
                key={amount}
                style={styles.quickBtn}
                onPress={() => handleQuickAdd(amount)}
              >
                <Droplets size={16} color={Colors.teal} />
                <Text style={styles.quickAmount}>{amount}ml</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.quickBtn, styles.quickBtnLarge]}
              onPress={() => handleQuickAdd(1000)}
            >
              <Droplets size={16} color={Colors.primary} />
              <Text style={[styles.quickAmount, { color: Colors.primary }]}>1L</Text>
              <Text style={styles.quickSub}>garrafa</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Glasses visual */}
        <Card>
          <Text style={styles.sectionTitle}>Visualização do dia</Text>
          <View style={styles.glassesGrid}>
            {Array.from({ length: 10 }).map((_, i) => {
              const filled = i < getGlassesCount();
              return (
                <View
                  key={i}
                  style={[
                    styles.glass,
                    filled
                      ? { backgroundColor: Colors.tealLight, borderColor: Colors.teal }
                      : { borderColor: Colors.border },
                  ]}
                >
                  <Droplets size={16} color={filled ? Colors.teal : Colors.border} />
                </View>
              );
            })}
          </View>
          <Text style={styles.glassesNote}>Cada copo = 250ml · Meta: 10 copos por dia</Text>
        </Card>

        {/* Today's log */}
        <Card>
          <View style={styles.logHeader}>
            <Text style={styles.sectionTitle}>Registro de Hoje</Text>
            <TouchableOpacity style={styles.addBtnSmall} onPress={openCreate}>
              <Plus size={14} color={Colors.card} />
            </TouchableOpacity>
          </View>

          {todayLogs.length === 0 ? (
            <View style={styles.emptyLog}>
              <Droplets size={28} color={Colors.border} />
              <Text style={styles.emptyText}>Nenhum registro hoje</Text>
              <Text style={styles.emptySubText}>Toque em "Personalizado" para adicionar</Text>
            </View>
          ) : (
            todayLogs.map(log => (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.logDot} />
                <Text style={styles.logTime}>{log.time}</Text>
                <Text style={styles.logAmount}>{log.amount}ml</Text>
                <View style={styles.logActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => openEdit(log.id)}
                  >
                    <Edit2 size={14} color={Colors.teal} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDelete]}
                    onPress={() => openDelete(log.id, log.amount)}
                  >
                    <Trash2 size={14} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={styles.sectionTitle}>💡 Dicas de Hidratação</Text>
          {[
            'Beba água ao acordar — o corpo fica desidratado durante o sono',
            'Diabéticos precisam de mais água pois urinam mais frequentemente',
            'A desidratação pode elevar a concentração de glicose no sangue',
            'Prefira água ao invés de bebidas açucaradas',
            'Beba um copo antes de cada refeição',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Modal: Criar ─────────────────────────────────────────── */}
      <Modal visible={showCreate} transparent animationType="fade" onRequestClose={() => setShowCreate(false)}>
        <TouchableWithoutFeedback onPress={() => setShowCreate(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Registrar consumo</Text>
                    <TouchableOpacity onPress={() => setShowCreate(false)} style={styles.modalClose}>
                      <X size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <FormFields form={form} setForm={setForm} />

                  {formError && <ErrorBanner message={formError} />}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnSecondary]}
                      onPress={() => setShowCreate(false)}
                      disabled={saving}
                    >
                      <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnPrimary]}
                      onPress={handleCreate}
                      disabled={saving}
                    >
                      {saving
                        ? <ActivityIndicator size="small" color={Colors.card} />
                        : <><Check size={16} color={Colors.card} /><Text style={styles.modalBtnPrimaryText}>Salvar</Text></>
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Modal: Editar ────────────────────────────────────────── */}
      <Modal visible={showEdit} transparent animationType="fade" onRequestClose={() => setShowEdit(false)}>
        <TouchableWithoutFeedback onPress={() => setShowEdit(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Editar registro</Text>
                    <TouchableOpacity onPress={() => setShowEdit(false)} style={styles.modalClose}>
                      <X size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <FormFields form={form} setForm={setForm} />

                  {formError && <ErrorBanner message={formError} />}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnSecondary]}
                      onPress={() => setShowEdit(false)}
                      disabled={saving}
                    >
                      <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnPrimary]}
                      onPress={handleEdit}
                      disabled={saving}
                    >
                      {saving
                        ? <ActivityIndicator size="small" color={Colors.card} />
                        : <><Check size={16} color={Colors.card} /><Text style={styles.modalBtnPrimaryText}>Atualizar</Text></>
                      }
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Modal: Confirmar exclusão ─────────────────────────────── */}
      <Modal visible={showDelete} transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <TouchableWithoutFeedback onPress={() => setShowDelete(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={[styles.modalCard, styles.deleteCard]}>
                <View style={styles.deleteIconWrap}>
                  <Trash2 size={28} color={Colors.danger} />
                </View>
                <Text style={styles.deleteTitle}>Excluir registro</Text>
                <Text style={styles.deleteMsg}>
                  Deseja remover o registro de{' '}
                  <Text style={{ fontWeight: FontWeight.bold, color: Colors.text }}>{deleteAmount}ml</Text>?
                  {'\n'}Esta ação não pode ser desfeita.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnSecondary]}
                    onPress={() => setShowDelete(false)}
                    disabled={saving}
                  >
                    <Text style={styles.modalBtnSecondaryText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.deleteBtnConfirm]}
                    onPress={handleDelete}
                    disabled={saving}
                  >
                    {saving
                      ? <ActivityIndicator size="small" color={Colors.card} />
                      : <Text style={styles.modalBtnPrimaryText}>Excluir</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FormFields({
  form, setForm,
}: {
  form: WaterForm;
  setForm: React.Dispatch<React.SetStateAction<WaterForm>>;
}) {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <View style={styles.formFields}>
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Data</Text>
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.7}
        >
          <Calendar size={16} color={Colors.teal} />
          <Text style={styles.dateBtnText}>{form.data}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Hora</Text>
        <TextInput
          style={styles.formInput}
          value={form.hora}
          onChangeText={v => setForm(p => ({ ...p, hora: v }))}
          placeholder="HH:MM"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Quantidade (ml)</Text>
        <TextInput
          style={styles.formInput}
          value={form.quantidade}
          onChangeText={v => setForm(p => ({ ...p, quantidade: v }))}
          placeholder="Ex: 300"
          placeholderTextColor={Colors.textLight}
          keyboardType="numeric"
        />
      </View>

      <CalendarModal
        visible={showCalendar}
        selected={form.data}
        onSelect={d => { setForm(p => ({ ...p, data: d })); setShowCalendar(false); }}
        onClose={() => setShowCalendar(false)}
      />
    </View>
  );
}

// ─── Custom Calendar ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function CalendarModal({
  visible, selected, onSelect, onClose,
}: {
  visible: boolean;
  selected: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const init = new Date(selected + 'T12:00:00');
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());

  const todayStr = TODAY();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const toDateStr = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={calStyles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={calStyles.card}>
              {/* Navigation */}
              <View style={calStyles.navRow}>
                <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
                  <ChevronLeft size={20} color={Colors.text} />
                </TouchableOpacity>
                <Text style={calStyles.monthTitle}>
                  {MONTH_NAMES[month]} {year}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
                  <ChevronRight size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {/* Day of week headers */}
              <View style={calStyles.weekRow}>
                {DAY_LABELS.map((d, i) => (
                  <Text key={i} style={calStyles.weekLabel}>{d}</Text>
                ))}
              </View>

              {/* Day cells */}
              <View style={calStyles.grid}>
                {cells.map((day, i) => {
                  if (!day) return <View key={i} style={calStyles.cell} />;
                  const ds = toDateStr(day);
                  const isSelected = ds === selected;
                  const isToday = ds === todayStr;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        calStyles.cell,
                        isSelected && calStyles.cellSelected,
                        isToday && !isSelected && calStyles.cellToday,
                      ]}
                      onPress={() => onSelect(ds)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          calStyles.dayNum,
                          isSelected && calStyles.dayNumSelected,
                          isToday && !isSelected && calStyles.dayNumToday,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Footer */}
              <TouchableOpacity style={calStyles.todayBtn} onPress={() => onSelect(todayStr)}>
                <Text style={calStyles.todayBtnText}>Ir para hoje</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner}>
      <AlertCircle size={14} color={Colors.danger} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.lg },

  loadingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.lg, paddingVertical: 8,
    backgroundColor: Colors.tealLight,
  },
  loadingText: { fontSize: FontSize.xs, color: Colors.teal },

  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },

  // Meter
  meterCard: {},
  meterCircleWrap: { alignItems: 'center', marginBottom: Spacing.lg },
  meterCircleOuter: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 3, borderColor: Colors.teal + '30',
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  meterCircle: { ...StyleSheet.absoluteFillObject, borderRadius: 80 },
  meterInner: { alignItems: 'center', gap: 4 },
  meterValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  meterGoal: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },

  // Quick add
  quickCard: {},
  quickHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  addCustomBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.teal + '50', backgroundColor: Colors.tealLight,
  },
  addCustomText: { fontSize: FontSize.xs, color: Colors.teal, fontWeight: FontWeight.semibold },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.teal + '40', backgroundColor: Colors.tealLight,
  },
  quickBtnLarge: { borderColor: Colors.primary + '40', backgroundColor: Colors.primaryLight },
  quickAmount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.teal },
  quickSub: { fontSize: FontSize.xs, color: Colors.textSecondary },

  // Glasses
  glassesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  glass: {
    width: 44, height: 44, borderRadius: BorderRadius.sm,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  glassesNote: { fontSize: FontSize.xs, color: Colors.textSecondary },

  // Log
  logHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  addBtnSmall: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center',
  },
  emptyLog: { alignItems: 'center', paddingVertical: Spacing.xl, gap: 6 },
  emptyText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  emptySubText: { fontSize: FontSize.xs, color: Colors.textLight },
  logRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  logDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.teal },
  logTime: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  logAmount: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  logActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 30, height: 30, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center',
  },
  actionBtnDelete: { backgroundColor: Colors.dangerLight },

  // Tips
  tipsCard: {},
  tipRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, backgroundColor: Colors.teal },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  // Modal overlay
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalCard: {
    width: '100%', maxWidth: 400, backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl, padding: Spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 12,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  modalClose: { padding: 4 },

  // Form
  formFields: { gap: Spacing.md },
  formGroup: { gap: 6 },
  formLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  formInput: {
    backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, fontSize: FontSize.md, color: Colors.text,
  },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dateBtnText: { fontSize: FontSize.md, color: Colors.text, flex: 1 },

  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.sm, padding: Spacing.sm,
    backgroundColor: Colors.dangerLight, borderRadius: BorderRadius.sm,
  },
  errorText: { fontSize: FontSize.xs, color: Colors.danger, flex: 1 },

  // Modal actions
  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  modalBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: BorderRadius.md,
  },
  modalBtnSecondary: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  modalBtnSecondaryText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  modalBtnPrimary: { backgroundColor: Colors.teal },
  modalBtnPrimaryText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.card },

  // Delete modal
  deleteCard: { alignItems: 'center' },
  deleteIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  deleteTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  deleteMsg: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  deleteBtnConfirm: { backgroundColor: Colors.danger },
});

// ─── Calendar Styles ─────────────────────────────────────────────────────────

const CELL_SIZE = 40;

const calStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    width: '100%', maxWidth: 340, backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl, padding: Spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  monthTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text,
  },
  weekRow: {
    flexDirection: 'row', marginBottom: Spacing.sm,
  },
  weekLabel: {
    width: CELL_SIZE, textAlign: 'center',
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: CELL_SIZE, height: CELL_SIZE,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  cellSelected: { backgroundColor: Colors.teal },
  cellToday: { borderWidth: 1.5, borderColor: Colors.teal },
  dayNum: {
    fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium,
  },
  dayNumSelected: { color: '#FFFFFF', fontWeight: FontWeight.bold },
  dayNumToday: { color: Colors.teal, fontWeight: FontWeight.bold },
  todayBtn: {
    marginTop: Spacing.md, alignSelf: 'center',
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.tealLight,
  },
  todayBtnText: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.teal,
  },
});
