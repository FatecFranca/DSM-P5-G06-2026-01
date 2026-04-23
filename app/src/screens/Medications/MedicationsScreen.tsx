import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Pill, Check, Clock, Plus, Info, Pencil, Trash2, X, ChevronDown } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Medication } from '../../types';

type MedType = 'insulin' | 'oral' | 'supplement' | 'other';

const TYPE_LABELS: Record<MedType, string> = {
  insulin: 'Insulina', oral: 'Oral', supplement: 'Suplemento', other: 'Outro',
};

const PRESET_COLORS = ['#4CAF82', '#3B8ED0', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

const EMPTY_FORM = {
  nome: '', dosagem: '', frequencia: '', horarios: ['08:00'], tipo: 'oral' as MedType,
  notas: '', cor: PRESET_COLORS[0],
};

export default function MedicationsScreen() {
  const {
    medications, medicacoesLoading, loadMedicacoes,
    toggleMedication, criarMedicacao, editarMedicacao, deletarMedicacao,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => { loadMedicacoes(); }, []);

  const takenCount = medications.filter(m => m.taken).length;
  const pendingMeds = medications.filter(m => !m.taken);
  const takenMeds = medications.filter(m => m.taken);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErr('');
    setShowForm(true);
  };

  const openEdit = (med: Medication) => {
    setEditingId(med.id);
    setForm({
      nome: med.name,
      dosagem: med.dosage,
      frequencia: med.frequency,
      horarios: med.times.length > 0 ? med.times : ['08:00'],
      tipo: med.type as MedType,
      notas: med.notes ?? '',
      cor: med.color,
    });
    setFormErr('');
    setShowForm(true);
  };

  const addHorario = () => setForm(p => ({ ...p, horarios: [...p.horarios, '08:00'] }));
  const removeHorario = (i: number) =>
    setForm(p => ({ ...p, horarios: p.horarios.filter((_, idx) => idx !== i) }));
  const updateHorario = (i: number, v: string) =>
    setForm(p => ({ ...p, horarios: p.horarios.map((h, idx) => idx === i ? v : h) }));

  const handleSave = useCallback(async () => {
    if (!form.nome.trim()) { setFormErr('Nome é obrigatório'); return; }
    if (!form.dosagem.trim()) { setFormErr('Dosagem é obrigatória'); return; }
    if (!form.frequencia.trim()) { setFormErr('Frequência é obrigatória'); return; }
    if (form.horarios.length === 0) { setFormErr('Informe pelo menos um horário'); return; }
    setSaving(true);
    try {
      const params = {
        nome: form.nome.trim(),
        dosagem: form.dosagem.trim(),
        frequencia: form.frequencia.trim(),
        horarios: form.horarios,
        tipo: form.tipo,
        notas: form.notas.trim() || undefined,
        cor: form.cor,
      };
      if (editingId) {
        await editarMedicacao(editingId, params);
      } else {
        await criarMedicacao(params);
      }
      setShowForm(false);
    } catch {
      setFormErr('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [form, editingId, criarMedicacao, editarMedicacao]);

  const handleDelete = useCallback(async (id: string) => {
    try { await deletarMedicacao(id); } catch { /* ignore */ }
    setDeleteTarget(null);
  }, [deletarMedicacao]);

  const MedCard = ({ med, pending }: { med: Medication; pending: boolean }) => (
    <Card style={pending ? styles.medCard : StyleSheet.flatten([styles.medCard, styles.medCardTaken])} padding={16}>
      <View style={styles.medRow}>
        <View style={[styles.medDot, { backgroundColor: pending ? med.color : Colors.border }]} />
        <View style={styles.medInfo}>
          <View style={styles.medNameRow}>
            <Text style={pending ? styles.medName : styles.medNameTaken}>{med.name}</Text>
            {pending && (
              <View style={[styles.typeTag, { backgroundColor: med.color + '20' }]}>
                <Text style={[styles.typeText, { color: med.color }]}>{TYPE_LABELS[med.type as MedType]}</Text>
              </View>
            )}
          </View>
          <Text style={styles.medDosage}>{med.dosage} · {med.frequency}</Text>
          {pending && (
            <View style={styles.timesRow}>
              {med.times.map(t => (
                <View key={t} style={styles.timeChip}>
                  <Clock size={10} color={Colors.textSecondary} />
                  <Text style={styles.timeText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          {med.notes && pending && <Text style={styles.medNote}>{med.notes}</Text>}
          {!pending && med.lastTaken && (
            <Text style={styles.takenTime}>
              ✓ Tomado às {med.lastTaken.includes('T') ? med.lastTaken.split('T')[1]?.slice(0, 5) : med.lastTaken.slice(-5)}
            </Text>
          )}
        </View>
        <View style={styles.actions}>
          {pending ? (
            <TouchableOpacity style={[styles.takeBtn, { backgroundColor: med.color }]} onPress={() => toggleMedication(med.id)}>
              <Check size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.undoBtn} onPress={() => toggleMedication(med.id)}>
              <Text style={styles.undoText}>Desfazer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(med)}>
            <Pencil size={15} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setDeleteTarget(med.id)}>
            <Trash2 size={15} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Medicações" subtitle="Controle seus remédios" />

      {medicacoesLoading && medications.length === 0 ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Progress */}
          {medications.length > 0 && (
            <Card style={{}}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressTitle}>Progresso de hoje</Text>
                  <Text style={styles.progressSub}>{takenCount} de {medications.length} tomadas</Text>
                </View>
                <View style={[styles.progressCircle, { backgroundColor: takenCount === medications.length ? Colors.primaryLight : Colors.warningLight }]}>
                  <Text style={[styles.progressPct, { color: takenCount === medications.length ? Colors.primary : Colors.warning }]}>
                    {medications.length > 0 ? Math.round((takenCount / medications.length) * 100) : 0}%
                  </Text>
                </View>
              </View>
              <ProgressBar
                progress={medications.length > 0 ? takenCount / medications.length : 0}
                color={takenCount === medications.length ? Colors.primary : Colors.warning}
                height={10}
              />
              {takenCount === medications.length && medications.length > 0 && (
                <View style={styles.allDoneRow}>
                  <Check size={16} color={Colors.primary} />
                  <Text style={styles.allDoneText}>Todas as medicações do dia tomadas! 🎉</Text>
                </View>
              )}
            </Card>
          )}

          {/* Pending */}
          {pendingMeds.length > 0 && (
            <View>
              <Text style={styles.groupLabel}>PENDENTES</Text>
              {pendingMeds.map(med => <MedCard key={med.id} med={med} pending />)}
            </View>
          )}

          {/* Taken */}
          {takenMeds.length > 0 && (
            <View>
              <Text style={styles.groupLabel}>TOMADAS HOJE</Text>
              {takenMeds.map(med => <MedCard key={med.id} med={med} pending={false} />)}
            </View>
          )}

          {medications.length === 0 && (
            <Card style={styles.emptyCard}>
              <Pill size={36} color={Colors.textLight} style={{ alignSelf: 'center', marginBottom: 8 }} />
              <Text style={styles.emptyText}>Nenhuma medicação cadastrada</Text>
              <Text style={styles.emptySub}>Toque em "+ Adicionar" para começar</Text>
            </Card>
          )}

          {/* Info */}
          <Card style={{}}>
            <View style={styles.infoHeader}>
              <Info size={18} color={Colors.secondary} />
              <Text style={styles.infoTitle}>Importante</Text>
            </View>
            <Text style={styles.infoText}>
              Nunca altere sua medicação sem orientação médica. Se esquecer uma dose, consulte seu médico sobre o que fazer.
            </Text>
          </Card>

          {/* Add button */}
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Plus size={20} color={Colors.primary} />
            <Text style={styles.addBtnText}>Adicionar Medicação</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Editar Medicação' : 'Nova Medicação'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <X size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md }}>
              <View>
                <Text style={styles.label}>Nome *</Text>
                <TextInput
                  style={styles.input}
                  value={form.nome}
                  onChangeText={v => { setForm(p => ({ ...p, nome: v })); setFormErr(''); }}
                  placeholder="Ex: Metformina"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Dosagem *</Text>
                  <TextInput style={styles.input} value={form.dosagem} onChangeText={v => setForm(p => ({ ...p, dosagem: v }))} placeholder="Ex: 500mg" placeholderTextColor={Colors.textLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Frequência *</Text>
                  <TextInput style={styles.input} value={form.frequencia} onChangeText={v => setForm(p => ({ ...p, frequencia: v }))} placeholder="Ex: 2x ao dia" placeholderTextColor={Colors.textLight} />
                </View>
              </View>

              {/* Tipo */}
              <View>
                <Text style={styles.label}>Tipo *</Text>
                <View style={styles.tipoRow}>
                  {(['oral', 'insulin', 'supplement', 'other'] as MedType[]).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.tipoChip, form.tipo === t && { backgroundColor: form.cor, borderColor: form.cor }]}
                      onPress={() => setForm(p => ({ ...p, tipo: t }))}
                    >
                      <Text style={[styles.tipoText, form.tipo === t && { color: '#fff' }]}>{TYPE_LABELS[t]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Horários */}
              <View>
                <Text style={styles.label}>Horários *</Text>
                {form.horarios.map((h, i) => (
                  <View key={i} style={styles.horarioRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={h}
                      onChangeText={v => updateHorario(i, v)}
                      placeholder="HH:MM"
                      placeholderTextColor={Colors.textLight}
                    />
                    {form.horarios.length > 1 && (
                      <TouchableOpacity onPress={() => removeHorario(i)} style={styles.removeBtn}>
                        <X size={16} color={Colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity style={styles.addHorarioBtn} onPress={addHorario}>
                  <Plus size={14} color={Colors.primary} />
                  <Text style={styles.addHorarioText}>Adicionar horário</Text>
                </TouchableOpacity>
              </View>

              {/* Cor */}
              <View>
                <Text style={styles.label}>Cor</Text>
                <View style={styles.colorRow}>
                  {PRESET_COLORS.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorDot, { backgroundColor: c }, form.cor === c && styles.colorDotSelected]}
                      onPress={() => setForm(p => ({ ...p, cor: c }))}
                    />
                  ))}
                </View>
              </View>

              {/* Observações */}
              <View>
                <Text style={styles.label}>Observações</Text>
                <TextInput
                  style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
                  value={form.notas}
                  onChangeText={v => setForm(p => ({ ...p, notas: v }))}
                  placeholder="Ex: Tomar com alimento"
                  placeholderTextColor={Colors.textLight}
                  multiline
                />
              </View>

              {formErr ? <Text style={styles.errorText}>{formErr}</Text> : null}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirm */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Trash2 size={32} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={styles.confirmTitle}>Excluir medicação?</Text>
            <Text style={styles.confirmSub}>Esta ação não pode ser desfeita.</Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteTarget(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtnConfirm} onPress={() => deleteTarget && handleDelete(deleteTarget)}>
                <Text style={styles.deleteBtnText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.md },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  progressTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  progressSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  progressCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  progressPct: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  allDoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  allDoneText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  groupLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.sm },
  medCard: { marginBottom: 8 },
  medCardTaken: { opacity: 0.65 },
  medRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  medDot: { width: 10, borderRadius: 3, alignSelf: 'stretch', minHeight: 40 },
  medInfo: { flex: 1 },
  medNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  medName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  medNameTaken: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textSecondary, textDecorationLine: 'line-through' },
  typeTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  typeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  medDosage: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  timesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  timeText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  medNote: { fontSize: FontSize.xs, color: Colors.textLight, fontStyle: 'italic', marginTop: 4 },
  takenTime: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  takeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  undoBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  undoText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  iconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  emptyCard: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textAlign: 'center' },
  emptySub: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 4, textAlign: 'center' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  infoTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  infoText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: 14, backgroundColor: Colors.primaryLight },
  addBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', flex: 0.9 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  modalFooter: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.text, backgroundColor: Colors.background },
  row2: { flexDirection: 'row', gap: 12 },
  tipoRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tipoChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  tipoText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  horarioRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  removeBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  addHorarioBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  addHorarioText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: Colors.text },
  errorText: { fontSize: FontSize.sm, color: '#EF4444' },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
  confirmBox: { backgroundColor: '#fff', margin: 24, borderRadius: 20, padding: 24 },
  confirmTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center', marginBottom: 6 },
  confirmSub: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  confirmBtns: { flexDirection: 'row', gap: 12 },
  deleteBtnConfirm: { flex: 1, paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: '#EF4444', alignItems: 'center' },
  deleteBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: '#fff' },
});
