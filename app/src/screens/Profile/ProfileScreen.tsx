import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User, Edit3, Heart, Calendar, Weight, Ruler,
  Stethoscope, ChevronRight, Award, TrendingUp, Activity, ArrowLeft,
} from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { GlucoseChart } from '../../components/charts/GlucoseChart';
import { RootStackParamList } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getGlucoseAverage } from '../../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DIABETES_LABELS: Record<string, string> = {
  none: 'Sem diagnóstico',
  type1: 'Diabetes Tipo 1',
  type2: 'Diabetes Tipo 2',
  gestational: 'Diabetes Gestacional',
  prediabetes: 'Pré-diabetes',
};

export default function ProfileScreen() {
  const { user, glucoseReadings } = useApp();
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);
  const bmiStatus = parseFloat(bmi) < 18.5 ? 'Abaixo do peso' : parseFloat(bmi) < 25 ? 'Normal' : parseFloat(bmi) < 30 ? 'Sobrepeso' : 'Obesidade';
  const bmiColor = parseFloat(bmi) < 25 ? Colors.primary : parseFloat(bmi) < 30 ? Colors.warning : Colors.danger;

  const avg7 = getGlucoseAverage(glucoseReadings.slice(0, 7));
  const avg30 = getGlucoseAverage(glucoseReadings.slice(0, 14));
  const inTarget = glucoseReadings.filter(r => r.status === 'normal').length;
  const inTargetPct = glucoseReadings.length > 0 ? Math.round((inTarget / glucoseReadings.length) * 100) : 0;

  const stats = [
    { label: 'Média 7 dias', value: `${avg7}`, unit: 'mg/dL', color: Colors.primary },
    { label: 'Média 30 dias', value: `${avg30}`, unit: 'mg/dL', color: Colors.secondary },
    { label: 'No alvo', value: `${inTargetPct}%`, unit: '', color: Colors.success },
    { label: 'Medições', value: `${glucoseReadings.length}`, unit: 'total', color: Colors.purple },
  ];

  const infoRows = [
    { icon: <Calendar size={18} color={Colors.secondary} />, label: 'Idade', value: `${user.age} anos` },
    { icon: <Weight size={18} color={Colors.orange} />, label: 'Peso', value: `${user.weight} kg` },
    { icon: <Ruler size={18} color={Colors.teal} />, label: 'Altura', value: `${user.height} cm` },
    { icon: <Activity size={18} color={Colors.primary} />, label: 'IMC', value: `${bmi} — ${bmiStatus}`, valueColor: bmiColor },
    { icon: <Heart size={18} color={Colors.pink} />, label: 'Tipo de Diabetes', value: DIABETES_LABELS[user.diabetesType] },
    { icon: <Stethoscope size={18} color={Colors.purple} />, label: 'Médico', value: user.doctorName || 'Não informado' },
    { icon: <Calendar size={18} color={Colors.warning} />, label: 'Última consulta', value: user.lastCheckup ? user.lastCheckup.split('-').reverse().join('/') : 'Não informado' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#3B8ED0', '#2563EB']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Edit3 size={14} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.diabetesTag}>
            <Heart size={14} color="#fff" />
            <Text style={styles.diabetesTagText}>{DIABETES_LABELS[user.diabetesType]}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Edit button */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile' as any)}
          >
            <Edit3 size={16} color={Colors.primary} />
            <Text style={styles.editBtnText}>Editar Perfil</Text>
          </TouchableOpacity>

          {/* Stats */}
          <Card style={styles.statsCard}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Estatísticas de Glicose</Text>
            </View>
            <View style={styles.statsGrid}>
              {stats.map(s => (
                <View key={s.label} style={styles.statItem}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  {s.unit && <Text style={styles.statUnit}>{s.unit}</Text>}
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
            {glucoseReadings.length > 1 && (
              <View style={{ marginTop: 12 }}>
                <GlucoseChart data={glucoseReadings} height={120} compact />
              </View>
            )}
          </Card>

          {/* Personal info */}
          <Card style={styles.infoCard}>
            <View style={styles.sectionHeader}>
              <User size={18} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            </View>
            {infoRows.map((row, i) => (
              <View key={i} style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}>
                <View style={styles.infoIcon}>{row.icon}</View>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={[styles.infoValue, row.valueColor ? { color: row.valueColor } : {}]}>{row.value}</Text>
              </View>
            ))}
          </Card>

          {/* Target ranges */}
          <Card style={styles.targetCard}>
            <View style={styles.sectionHeader}>
              <Activity size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Metas de Glicose</Text>
            </View>
            <View style={styles.targetRow}>
              <View style={[styles.targetItem, { backgroundColor: Colors.primaryLight }]}>
                <Text style={styles.targetLabel}>Mínimo</Text>
                <Text style={[styles.targetValue, { color: Colors.primary }]}>{user.targetGlucoseMin}</Text>
                <Text style={styles.targetUnit}>mg/dL</Text>
              </View>
              <View style={styles.targetArrow}>
                <Text style={styles.targetArrowText}>←  Alvo  →</Text>
              </View>
              <View style={[styles.targetItem, { backgroundColor: Colors.primaryLight }]}>
                <Text style={styles.targetLabel}>Máximo</Text>
                <Text style={[styles.targetValue, { color: Colors.primary }]}>{user.targetGlucoseMax}</Text>
                <Text style={styles.targetUnit}>mg/dL</Text>
              </View>
            </View>
          </Card>

          {/* Achievements */}
          <Card style={styles.achievCard}>
            <View style={styles.sectionHeader}>
              <Award size={18} color={Colors.warning} />
              <Text style={styles.sectionTitle}>Conquistas</Text>
            </View>
            <View style={styles.achievGrid}>
              {[
                { emoji: '🏃', label: '7 dias ativo', unlocked: true },
                { emoji: '💧', label: 'Hidratado', unlocked: true },
                { emoji: '📊', label: '10 medições', unlocked: true },
                { emoji: '🥗', label: 'Semana saudável', unlocked: false },
                { emoji: '😴', label: 'Sono em dia', unlocked: false },
                { emoji: '🎯', label: 'Meta atingida', unlocked: false },
              ].map(a => (
                <View key={a.label} style={[styles.achievItem, !a.unlocked && styles.achievItemLocked]}>
                  <Text style={[styles.achievEmoji, !a.unlocked && styles.achievEmojiLocked]}>{a.emoji}</Text>
                  <Text style={[styles.achievLabel, !a.unlocked && styles.achievLabelLocked]}>{a.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: 36, alignItems: 'center' },
  headerBackBtn: { alignSelf: 'flex-start', marginBottom: Spacing.sm },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 32, fontWeight: FontWeight.extrabold, color: '#fff' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  userName: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  diabetesTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  diabetesTagText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, gap: Spacing.lg },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: BorderRadius.md,
    paddingVertical: 12, backgroundColor: Colors.primaryLight,
  },
  editBtnText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  statsCard: {},
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  statItem: { width: '50%', alignItems: 'center', paddingVertical: 10 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold },
  statUnit: { fontSize: FontSize.xs, color: Colors.textSecondary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  infoCard: {},
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  infoIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, textAlign: 'right', maxWidth: 160 },
  targetCard: {},
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  targetItem: { flex: 1, alignItems: 'center', padding: 14, borderRadius: BorderRadius.md },
  targetLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  targetValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold },
  targetUnit: { fontSize: FontSize.xs, color: Colors.textSecondary },
  targetArrow: { alignItems: 'center' },
  targetArrowText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  achievCard: {},
  achievGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievItem: {
    width: '30%', alignItems: 'center', padding: 12,
    borderRadius: BorderRadius.md, backgroundColor: Colors.primaryLight,
    borderWidth: 1, borderColor: Colors.primary + '30',
  },
  achievItemLocked: { backgroundColor: Colors.borderLight, borderColor: Colors.border },
  achievEmoji: { fontSize: 28, marginBottom: 4 },
  achievEmojiLocked: { opacity: 0.3 },
  achievLabel: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium, textAlign: 'center' },
  achievLabelLocked: { color: Colors.textLight },
});
