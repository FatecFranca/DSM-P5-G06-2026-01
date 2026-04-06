import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

const DIABETES_TYPES = [
  { key: 'none', label: 'Sem diagnóstico' },
  { key: 'type1', label: 'Tipo 1' },
  { key: 'type2', label: 'Tipo 2' },
  { key: 'gestational', label: 'Gestacional' },
  { key: 'prediabetes', label: 'Pré-diabetes' },
];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useApp();
  const [form, setForm] = useState({
    name: user.name,
    age: String(user.age),
    weight: String(user.weight),
    height: String(user.height),
    diabetesType: user.diabetesType,
    email: user.email,
    doctorName: user.doctorName || '',
    targetGlucoseMin: String(user.targetGlucoseMin),
    targetGlucoseMax: String(user.targetGlucoseMax),
  });
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      updateUser({
        name: form.name.trim(),
        age: parseInt(form.age) || user.age,
        weight: parseFloat(form.weight) || user.weight,
        height: parseInt(form.height) || user.height,
        diabetesType: form.diabetesType as any,
        email: form.email.trim(),
        doctorName: form.doctorName.trim() || undefined,
        targetGlucoseMin: parseInt(form.targetGlucoseMin) || user.targetGlucoseMin,
        targetGlucoseMax: parseInt(form.targetGlucoseMax) || user.targetGlucoseMax,
      });
      setLoading(false);
      navigation.goBack();
    }, 500);
  };

  const field = (label: string, key: keyof typeof form, opts?: { keyboardType?: any; placeholder?: string }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={form[key]}
        onChangeText={v => setForm(prev => ({ ...prev, [key]: v }))}
        keyboardType={opts?.keyboardType || 'default'}
        placeholder={opts?.placeholder}
        placeholderTextColor={Colors.textLight}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title="Editar Perfil" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          {field('Nome completo', 'name')}
          {field('Idade', 'age', { keyboardType: 'number-pad' })}
          {field('E-mail', 'email', { keyboardType: 'email-address' })}
          {field('Peso (kg)', 'weight', { keyboardType: 'decimal-pad' })}
          {field('Altura (cm)', 'height', { keyboardType: 'number-pad' })}
          {field('Nome do médico', 'doctorName', { placeholder: 'Ex: Dra. Ana Silva' })}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Diabetes</Text>
          <View style={styles.typeGrid}>
            {DIABETES_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeBtn, form.diabetesType === t.key && styles.typeBtnActive]}
                onPress={() => setForm(prev => ({ ...prev, diabetesType: t.key as any }))}
              >
                <Text style={[styles.typeText, form.diabetesType === t.key && styles.typeTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Metas de Glicose</Text>
          <View style={styles.targetRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Mínimo (mg/dL)</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.targetGlucoseMin}
                onChangeText={v => setForm(prev => ({ ...prev, targetGlucoseMin: v }))}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.targetDash}><Text style={styles.dashText}>—</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Máximo (mg/dL)</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.targetGlucoseMax}
                onChangeText={v => setForm(prev => ({ ...prev, targetGlucoseMax: v }))}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          <Button title="Salvar Alterações" onPress={handleSave} loading={loading} />
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
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  field: { marginBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, fontWeight: FontWeight.medium },
  fieldInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: FontSize.md, color: Colors.text },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  typeTextActive: { color: Colors.primary },
  targetRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  targetDash: { paddingBottom: 12 },
  dashText: { fontSize: FontSize.xl, color: Colors.textSecondary },
  actions: {},
});
