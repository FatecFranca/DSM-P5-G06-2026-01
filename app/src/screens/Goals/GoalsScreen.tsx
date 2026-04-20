import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Target, CheckCircle2, Plus, Trophy, Pencil, Trash2, X, Check,
  Calendar, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { type CategoriaGoal } from '../../services/api';
import { Goal } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_EMOJIS: Record<CategoriaGoal, string> = {
  glucose: '🩸', weight: '⚖️', exercise: '🏃', water: '💧', sleep: '😴', steps: '👣',
};

const CATEGORY_LABELS: Record<CategoriaGoal, string> = {
  glucose: 'Glicose', weight: 'Peso', exercise: 'Exercício',
  water: 'Água', sleep: 'Sono', steps: 'Passos',
};

const CATEGORIES: CategoriaGoal[] = ['glucose', 'weight', 'exercise', 'water', 'sleep', 'steps'];

const PRESET_COLORS = [
  '#4CAF82', '#3B8ED0', '#F97316', '#8B5CF6',
  '#EC4899', '#EF4444', '#F59E0B', '#14B8A6',
];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// ─── DatePicker ───────────────────────────────────────────────────────────────

function formatDateDisplay(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function DatePicker({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const [visible, setVisible] = useState(false);

  const initYear = value ? parseInt(value.split('-')[0] ?? '0') : new Date().getFullYear();
  const initMonth = value ? parseInt(value.split('-')[1] ?? '0') : new Date().getMonth() + 1;
  const [viewYear, setViewYear] = useState(initYear || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(initMonth || new Date().getMonth() + 1);

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
      <TouchableOpacity style={calStyles.dateBtn} onPress={() => setVisible(true)} activeOpacity={0.7}>
        <Calendar size={16} color={Colors.primary} />
        <Text style={calStyles.dateBtnText}>{value ? formatDateDisplay(value) : 'Selecionar prazo'}</Text>
        <ChevronDown size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setVisible(false)}>
        <View style={calStyles.overlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setVisible(false)} />
          <View style={calStyles.modal}>
            <View style={calStyles.header}>
              <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
                <ChevronLeft size={20} color={Colors.text} />
              </TouchableOpacity>
              <Text style={calStyles.monthYear}>{MONTH_NAMES[viewMonth - 1]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
                <ChevronRight size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={calStyles.dayNames}>
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <Text key={i} style={calStyles.dayNameText}>{d}</Text>
              ))}
            </View>

            <View style={calStyles.grid}>
              {cells.map((day, i) => {
                if (day === null) return <View key={i} style={calStyles.cell} />;
                const iso = padISO(day);
                const isSelected = iso === value;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[calStyles.cell, isSelected && calStyles.cellSelected]}
                    onPress={() => selectDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[calStyles.dayText, isSelected && calStyles.daySelectedText]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={calStyles.closeBtn} onPress={() => setVisible(false)}>
              <Text style={calStyles.closeBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface GoalForm {
  title: string;
  description: string;
  target: string;
  unit: string;
  category: CategoriaGoal;
  deadline: string;
  color: string;
}

const EMPTY_FORM: GoalForm = {
  title: '', description: '', target: '', unit: '',
  category: 'glucose', deadline: '', color: '#4CAF82',
};

function goalToForm(g: Goal): GoalForm {
  return {
    title: g.title,
    description: g.description ?? '',
    target: String(g.target),
    unit: g.unit,
    category: g.category as CategoriaGoal,
    deadline: g.deadline,
    color: g.color,
  };
}

// ─── GoalFormModal ────────────────────────────────────────────────────────────

interface GoalFormModalProps {
  visible: boolean;
  initial?: GoalForm;
  headerTitle: string;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (form: GoalForm) => void;
}

function GoalFormModal({ visible, initial, headerTitle, saving, error, onClose, onSubmit }: GoalFormModalProps) {
  const [form, setForm] = useState<GoalForm>(initial ?? EMPTY_FORM);

  useEffect(() => {
    if (visible) setForm(initial ?? EMPTY_FORM);
  }, [visible]);

  const set = (k: keyof GoalForm) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>{headerTitle}</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {error !== '' && (
              <View style={modalStyles.errorBox}>
                <Text style={modalStyles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={modalStyles.label}>Título *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Ex: Glicose no alvo"
              placeholderTextColor={Colors.textLight}
              value={form.title}
              onChangeText={set('title')}
            />

            <Text style={modalStyles.label}>Descrição</Text>
            <TextInput
              style={[modalStyles.input, { height: 64, textAlignVertical: 'top' }]}
              placeholder="Descreva sua meta..."
              placeholderTextColor={Colors.textLight}
              value={form.description}
              onChangeText={set('description')}
              multiline
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Alvo *</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="Ex: 30"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  value={form.target}
                  onChangeText={set('target')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.label}>Unidade *</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="Ex: kg, copos"
                  placeholderTextColor={Colors.textLight}
                  value={form.unit}
                  onChangeText={set('unit')}
                />
              </View>
            </View>

            <Text style={modalStyles.label}>Prazo *</Text>
            <DatePicker value={form.deadline} onChange={v => setForm(prev => ({ ...prev, deadline: v }))} />

            <Text style={modalStyles.label}>Categoria</Text>
            <View style={modalStyles.categoryRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setForm(prev => ({ ...prev, category: cat }))}
                  style={[
                    modalStyles.categoryChip,
                    form.category === cat && { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
                  ]}
                >
                  <Text style={modalStyles.categoryEmoji}>{CATEGORY_EMOJIS[cat]}</Text>
                  <Text style={[
                    modalStyles.categoryLabel,
                    form.category === cat && { color: Colors.primary, fontWeight: FontWeight.bold },
                  ]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={modalStyles.label}>Cor</Text>
            <View style={modalStyles.colorRow}>
              {PRESET_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setForm(prev => ({ ...prev, color: c }))}
                  style={[modalStyles.colorDot, { backgroundColor: c }]}
                >
                  {form.color === c && <Check size={14} color="#fff" strokeWidth={3} />}
                </TouchableOpacity>
              ))}
            </View>

            <View style={modalStyles.actionRow}>
              <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                <Text style={modalStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.submitBtn, saving && { opacity: 0.6 }]}
                onPress={() => onSubmit(form)}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={modalStyles.submitText}>Salvar</Text>
                }
              </TouchableOpacity>
            </View>

            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ProgressModal ────────────────────────────────────────────────────────────

interface ProgressModalProps {
  visible: boolean;
  goal: Goal | null;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

function ProgressModal({ visible, goal, saving, error, onClose, onSubmit }: ProgressModalProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible && goal) setValue(String(goal.current));
  }, [visible, goal]);

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={[modalStyles.sheet, { maxHeight: 300 }]}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Atualizar progresso</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {goal && (
            <Text style={modalStyles.progressHint}>
              {goal.title} · Alvo: {goal.target} {goal.unit}
            </Text>
          )}

          {error !== '' && (
            <View style={modalStyles.errorBox}>
              <Text style={modalStyles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={modalStyles.label}>Valor atual</Text>
          <TextInput
            style={modalStyles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={setValue}
            autoFocus
          />

          <View style={[modalStyles.actionRow, { marginTop: Spacing.md }]}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.submitBtn, saving && { opacity: 0.6 }]}
              onPress={() => onSubmit(value)}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={modalStyles.submitText}>Atualizar</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── DeleteModal ──────────────────────────────────────────────────────────────

interface DeleteModalProps {
  visible: boolean;
  goal: Goal | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteModal({ visible, goal, deleting, onClose, onConfirm }: DeleteModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={modalStyles.backdrop} onPress={onClose} />
      <View style={[modalStyles.sheet, { maxHeight: 280, alignItems: 'center' }]}>
        <View style={modalStyles.handle} />
        <View style={modalStyles.deleteIconWrap}>
          <Trash2 size={28} color={Colors.danger} />
        </View>
        <Text style={modalStyles.deleteTitle}>Remover meta?</Text>
        <Text style={modalStyles.deleteDesc}>
          {goal?.title ? `"${goal.title}" será removida permanentemente.` : 'Esta meta será removida permanentemente.'}
        </Text>
        <View style={[modalStyles.actionRow, { width: '100%' }]}>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[modalStyles.deleteBtn, deleting && { opacity: 0.6 }]}
            onPress={onConfirm}
            disabled={deleting}
          >
            {deleting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={modalStyles.submitText}>Remover</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── GoalsScreen ──────────────────────────────────────────────────────────────

export default function GoalsScreen() {
  const { goals, updateGoal, addGoal, editGoalFields, deleteGoal, loadGoals, goalsLoading } = useApp();

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const [showCreate, setShowCreate] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [progressGoal, setProgressGoal] = useState<Goal | null>(null);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressError, setProgressError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState(false);

  const completedGoals = goals.filter(g => g.completed);
  const activeGoals    = goals.filter(g => !g.completed);

  function validateForm(form: GoalForm): string {
    if (!form.title.trim()) return 'Título é obrigatório.';
    if (!form.target.trim()) return 'Alvo é obrigatório.';
    const target = parseFloat(form.target);
    if (isNaN(target) || target <= 0) return 'Alvo deve ser um número positivo.';
    if (!form.unit.trim()) return 'Unidade é obrigatória.';
    if (!form.deadline) return 'Prazo é obrigatório.';
    return '';
  }

  const handleCreate = async (form: GoalForm) => {
    const err = validateForm(form);
    if (err) { setCreateError(err); return; }
    setCreateError('');
    setCreateSaving(true);
    try {
      await addGoal({
        title: form.title.trim(),
        description: form.description.trim(),
        target: parseFloat(form.target),
        unit: form.unit.trim(),
        category: form.category,
        deadline: form.deadline,
        color: form.color,
      });
      setShowCreate(false);
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Erro ao criar meta.');
    } finally {
      setCreateSaving(false);
    }
  };

  const handleEdit = async (form: GoalForm) => {
    if (!editGoal) return;
    const err = validateForm(form);
    if (err) { setEditError(err); return; }
    setEditError('');
    setEditSaving(true);
    try {
      await editGoalFields(editGoal.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        target: parseFloat(form.target),
        unit: form.unit.trim(),
        category: form.category,
        deadline: form.deadline,
        color: form.color,
      });
      setEditGoal(null);
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : 'Erro ao editar meta.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleProgress = async (value: string) => {
    if (!progressGoal) return;
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) { setProgressError('Insira um número válido.'); return; }
    setProgressError('');
    setProgressSaving(true);
    try {
      await updateGoal(progressGoal.id, num);
      setProgressGoal(null);
    } catch (e: unknown) {
      setProgressError(e instanceof Error ? e.message : 'Erro ao atualizar.');
    } finally {
      setProgressSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGoal(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (goalsLoading && goals.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <ScreenHeader title="Metas de Saúde" subtitle="Carregando..." />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <GoalFormModal
        visible={showCreate}
        headerTitle="Nova Meta"
        saving={createSaving}
        error={createError}
        onClose={() => { setShowCreate(false); setCreateError(''); }}
        onSubmit={handleCreate}
      />
      <GoalFormModal
        visible={editGoal !== null}
        initial={editGoal ? goalToForm(editGoal) : undefined}
        headerTitle="Editar Meta"
        saving={editSaving}
        error={editError}
        onClose={() => { setEditGoal(null); setEditError(''); }}
        onSubmit={handleEdit}
      />
      <ProgressModal
        visible={progressGoal !== null}
        goal={progressGoal}
        saving={progressSaving}
        error={progressError}
        onClose={() => { setProgressGoal(null); setProgressError(''); }}
        onSubmit={handleProgress}
      />
      <DeleteModal
        visible={deleteTarget !== null}
        goal={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ScreenHeader
        title="Metas de Saúde"
        subtitle={`${completedGoals.length} de ${goals.length} concluídas`}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard} padding={16}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>{completedGoals.length}</Text>
            <Text style={styles.summaryLabel}>Concluídas</Text>
          </Card>
          <Card style={styles.summaryCard} padding={16}>
            <Text style={[styles.summaryValue, { color: Colors.warning }]}>{activeGoals.length}</Text>
            <Text style={styles.summaryLabel}>Em andamento</Text>
          </Card>
          <Card style={styles.summaryCard} padding={16}>
            <Text style={[styles.summaryValue, { color: Colors.secondary }]}>
              {goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%
            </Text>
            <Text style={styles.summaryLabel}>Progresso</Text>
          </Card>
        </View>

        {/* Active goals */}
        {activeGoals.length > 0 && (
          <View>
            <Text style={styles.groupLabel}>EM ANDAMENTO</Text>
            {activeGoals.map(goal => {
              const pct = Math.min(goal.current / goal.target, 1);
              return (
                <Card key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={[styles.goalEmoji, { backgroundColor: goal.color + '20' }]}>
                      <Text style={styles.goalEmojiText}>{CATEGORY_EMOJIS[goal.category as CategoriaGoal] ?? '🎯'}</Text>
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalDesc}>{goal.description}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => { setEditError(''); setEditGoal(goal); }}
                      >
                        <Pencil size={14} color={Colors.secondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, { backgroundColor: Colors.dangerLight }]}
                        onPress={() => setDeleteTarget(goal)}
                      >
                        <Trash2 size={14} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <ProgressBar progress={pct} color={goal.color} height={8} />

                  <View style={styles.goalFooter}>
                    <Text style={styles.goalProgress}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                    <View style={[styles.goalPctBadge, { backgroundColor: goal.color + '20' }]}>
                      <Text style={[styles.goalPctText, { color: goal.color }]}>
                        {Math.round(pct * 100)}%
                      </Text>
                    </View>
                    <Text style={styles.goalDeadline}>
                      até {goal.deadline.split('-').reverse().join('/')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.updateBtn, { borderColor: goal.color }]}
                    onPress={() => { setProgressError(''); setProgressGoal(goal); }}
                  >
                    <Text style={[styles.updateBtnText, { color: goal.color }]}>Atualizar progresso</Text>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        )}

        {/* Completed */}
        {completedGoals.length > 0 && (
          <View>
            <Text style={styles.groupLabel}>CONCLUÍDAS 🏆</Text>
            {completedGoals.map(goal => (
              <Card key={goal.id} style={StyleSheet.flatten([styles.goalCard, styles.goalCardDone])}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalEmoji, { backgroundColor: Colors.primaryLight }]}>
                    <Text style={styles.goalEmojiText}>{CATEGORY_EMOJIS[goal.category as CategoriaGoal] ?? '🎯'}</Text>
                  </View>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalTitle, { color: Colors.primary }]}>{goal.title}</Text>
                    <Text style={styles.goalDesc}>{goal.description}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    <CheckCircle2 size={22} color={Colors.primary} />
                    <TouchableOpacity
                      style={[styles.iconBtn, { backgroundColor: Colors.dangerLight }]}
                      onPress={() => setDeleteTarget(goal)}
                    >
                      <Trash2 size={14} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
                <ProgressBar progress={1} color={Colors.primary} height={6} />
                <Text style={styles.goalCompletedText}>✓ Meta concluída! Parabéns!</Text>
              </Card>
            ))}
          </View>
        )}

        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Target size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Nenhuma meta ainda</Text>
            <Text style={styles.emptyDesc}>Crie sua primeira meta de saúde abaixo</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { setCreateError(''); setShowCreate(true); }}
        >
          <Plus size={20} color={Colors.primary} />
          <Text style={styles.addBtnText}>Nova Meta</Text>
        </TouchableOpacity>

        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.motivCard}>
          <Trophy size={28} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.motivTitle}>Continue assim!</Text>
            <Text style={styles.motivText}>Cada pequena conquista te aproxima de uma vida mais saudável.</Text>
          </View>
        </LinearGradient>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  groupLabel: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary,
    letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  goalCard: { marginBottom: 10, gap: 10 },
  goalCardDone: { opacity: 0.8 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalEmoji: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  goalEmojiText: { fontSize: 22 },
  goalInfo: { flex: 1 },
  goalTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  goalDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  goalFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalProgress: { fontSize: FontSize.xs, color: Colors.textSecondary },
  goalDeadline: { fontSize: FontSize.xs, color: Colors.textSecondary },
  goalPctBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  goalPctText: { fontSize: FontSize.xs, fontWeight: FontWeight.extrabold },
  iconBtn: {
    width: 30, height: 30, borderRadius: BorderRadius.sm,
    backgroundColor: Colors.secondaryLight, alignItems: 'center', justifyContent: 'center',
  },
  updateBtn: { borderWidth: 1, borderRadius: BorderRadius.md, paddingVertical: 9, alignItems: 'center' },
  updateBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  goalCompletedText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 14, backgroundColor: Colors.primaryLight,
  },
  addBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  motivCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: Spacing.lg, borderRadius: BorderRadius.lg,
  },
  motivTitle: { color: '#fff', fontWeight: FontWeight.bold, fontSize: FontSize.md, marginBottom: 2 },
  motivText: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.xs, lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textLight },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.md,
    maxHeight: '92%',
    ...Shadow.lg,
  },
  handle: {
    alignSelf: 'center', width: 40, height: 4,
    borderRadius: 2, backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.divider, alignItems: 'center', justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold,
    color: Colors.textSecondary, marginBottom: 5, marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    fontSize: FontSize.sm, color: Colors.text, backgroundColor: Colors.background,
  },
  errorBox: {
    backgroundColor: Colors.dangerLight, borderRadius: BorderRadius.sm,
    padding: Spacing.sm, marginBottom: Spacing.sm,
  },
  errorText: { fontSize: FontSize.xs, color: Colors.danger },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  categoryEmoji: { fontSize: 13 },
  categoryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: Spacing.md },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  submitBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary, alignItems: 'center',
  },
  deleteBtn: {
    flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md,
    backgroundColor: Colors.danger, alignItems: 'center',
  },
  submitText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
  progressHint: {
    fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm,
  },
  deleteIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.dangerLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs, marginTop: Spacing.xs,
  },
  deleteTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  deleteDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.sm },
});

// ─── Calendar styles ──────────────────────────────────────────────────────────

const calStyles = StyleSheet.create({
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
  },
  dateBtnText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center', padding: Spacing.xl,
  },
  modal: {
    backgroundColor: Colors.card, borderRadius: BorderRadius.xl,
    padding: Spacing.md, width: '100%', maxWidth: 340,
    ...Shadow.lg,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  navBtn: { padding: 8 },
  monthYear: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  dayNames: { flexDirection: 'row', marginBottom: 4 },
  dayNameText: {
    flex: 1, textAlign: 'center',
    fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary,
    paddingVertical: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 100,
  },
  cellSelected: { backgroundColor: Colors.primary },
  dayText: { fontSize: FontSize.sm, color: Colors.text },
  daySelectedText: { color: '#fff', fontWeight: FontWeight.bold },
  closeBtn: {
    marginTop: Spacing.sm, paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  closeBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
