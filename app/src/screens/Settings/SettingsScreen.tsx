import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell, Moon, Activity, Database, Shield, Info,
  ChevronRight, LogOut, Trash2, Globe, Ruler, ArrowLeft,
} from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggle = (key: keyof typeof settings) =>
    updateSettings({ [key]: !settings[key] } as any);

  const handleClearData = () => {
    // TODO: implementar limpeza de dados
  };

  const row = (icon: React.ReactNode, label: string, sublabel?: string, right?: React.ReactNode, onPress?: () => void) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sublabel && <Text style={styles.settingSub}>{sublabel}</Text>}
      </View>
      {right || (onPress && <ChevronRight size={18} color={Colors.textLight} />)}
    </TouchableOpacity>
  );

  const divider = () => <View style={styles.divider} />;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setShowLogoutModal(false)}>
        <Pressable style={modalStyles.backdrop} onPress={() => setShowLogoutModal(false)} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.iconWrap}>
            <LogOut size={28} color={Colors.danger} />
          </View>
          <Text style={modalStyles.title}>Sair da conta?</Text>
          <Text style={modalStyles.desc}>Você precisará fazer login novamente para acessar o aplicativo.</Text>
          <View style={modalStyles.btnRow}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => setShowLogoutModal(false)}>
              <Text style={modalStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.confirmBtn} onPress={() => { setShowLogoutModal(false); logout(); }}>
              <Text style={modalStyles.confirmText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <LinearGradient
        colors={['#1A2332', '#2D3748']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Configurações</Text>
            <Text style={styles.headerSub}>Personalize o aplicativo</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Appearance */}
        <Text style={styles.groupLabel}>APARÊNCIA</Text>
        <Card style={styles.group}>
          {row(
            <Moon size={18} color={Colors.secondary} />,
            'Modo Escuro',
            'Tema escuro para os olhos',
            <Switch
              value={settings.darkMode}
              onValueChange={() => toggle('darkMode')}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={settings.darkMode ? Colors.primary : '#fff'}
            />
          )}
          {divider()}
          {row(
            <Globe size={18} color={Colors.teal} />,
            'Idioma',
            'Português (Brasil)',
            undefined,
            () => {}
          )}
          {divider()}
          {row(
            <Ruler size={18} color={Colors.purple} />,
            'Unidade de Glicose',
            settings.glucoseUnit,
            <TouchableOpacity
              style={styles.unitToggle}
              onPress={() => updateSettings({ glucoseUnit: settings.glucoseUnit === 'mg/dL' ? 'mmol/L' : 'mg/dL' })}
            >
              <Text style={styles.unitToggleText}>
                {settings.glucoseUnit === 'mg/dL' ? 'mg/dL' : 'mmol/L'}
              </Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Notifications */}
        <Text style={styles.groupLabel}>NOTIFICAÇÕES</Text>
        <Card style={styles.group}>
          {row(
            <Bell size={18} color={Colors.warning} />,
            'Notificações',
            'Ativar todas as notificações',
            <Switch
              value={settings.notifications}
              onValueChange={() => toggle('notifications')}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={settings.notifications ? Colors.primary : '#fff'}
            />
          )}
          {divider()}
          {row(
            <Activity size={18} color={Colors.primary} />,
            'Lembrete de Glicose',
            'Medir glicose no horário certo',
            <Switch
              value={settings.reminderGlucose}
              onValueChange={() => toggle('reminderGlucose')}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={settings.reminderGlucose ? Colors.primary : '#fff'}
              disabled={!settings.notifications}
            />
          )}
          {divider()}
          {row(
            <Bell size={18} color={Colors.orange} />,
            'Lembrete de Refeição',
            'Registrar refeições no horário',
            <Switch
              value={settings.reminderMeal}
              onValueChange={() => toggle('reminderMeal')}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={settings.reminderMeal ? Colors.primary : '#fff'}
              disabled={!settings.notifications}
            />
          )}
          {divider()}
          {row(
            <Bell size={18} color={Colors.purple} />,
            'Lembrete de Medicação',
            'Não esqueça seus remédios',
            <Switch
              value={settings.reminderMedication}
              onValueChange={() => toggle('reminderMedication')}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={settings.reminderMedication ? Colors.primary : '#fff'}
              disabled={!settings.notifications}
            />
          )}
        </Card>

        {/* Data */}
        <Text style={styles.groupLabel}>DADOS</Text>
        <Card style={styles.group}>
          {row(
            <Database size={18} color={Colors.teal} />,
            'Backup automático',
            'Salvar dados na nuvem',
            <Switch
              value={settings.backupEnabled}
              onValueChange={() => toggle('backupEnabled')}
              trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
              thumbColor={settings.backupEnabled ? Colors.primary : '#fff'}
            />
          )}
          {divider()}
          {row(
            <Database size={18} color={Colors.secondary} />,
            'Exportar Dados',
            'Baixar relatório em PDF',
            undefined,
            () => Alert.alert('Em breve', 'Exportação em PDF estará disponível na próxima versão.')
          )}
          {divider()}
          {row(
            <Trash2 size={18} color={Colors.danger} />,
            'Apagar todos os dados',
            'Esta ação não pode ser desfeita',
            undefined,
            handleClearData
          )}
        </Card>

        {/* About */}
        <Text style={styles.groupLabel}>SOBRE</Text>
        <Card style={styles.group}>
          {row(
            <Info size={18} color={Colors.secondary} />,
            'Sobre o App',
            'Diabetes Care v1.0.0',
            undefined,
            () => Alert.alert('Diabetes Care', 'Versão 1.0.0\n\nDesenvolvido para ajudar no controle do diabetes.\n\n© 2026 Diabetes Care')
          )}
          {divider()}
          {row(
            <Shield size={18} color={Colors.primary} />,
            'Política de Privacidade',
            'Como usamos seus dados',
            undefined,
            () => {}
          )}
        </Card>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogoutModal(true)}
        >
          <LogOut size={18} color={Colors.danger} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Diabetes Care v1.0.0 · Feito com ❤️ para sua saúde</Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: Spacing.sm },
  backBtn: { width: 36 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  content: { padding: Spacing.lg },
  groupLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md, letterSpacing: 1 },
  group: { marginBottom: Spacing.sm, padding: 0 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  settingText: { flex: 1 },
  settingLabel: { fontSize: FontSize.md, color: Colors.text, fontWeight: FontWeight.medium },
  settingSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 66 },
  unitToggle: { backgroundColor: Colors.primaryLight, paddingHorizontal: 12, paddingVertical: 5, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.primary },
  unitToggleText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: Colors.danger + '40', borderRadius: BorderRadius.md,
    paddingVertical: 14, marginTop: Spacing.md, backgroundColor: Colors.dangerLight,
  },
  logoutText: { fontSize: FontSize.md, color: Colors.danger, fontWeight: FontWeight.semibold },
  versionText: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textLight, marginTop: Spacing.xl },
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
    alignItems: 'center',
    gap: Spacing.sm,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  desc: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', paddingHorizontal: Spacing.md,
  },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%', marginTop: Spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  cancelText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  confirmBtn: {
    flex: 1, paddingVertical: 13, borderRadius: BorderRadius.md,
    backgroundColor: Colors.danger, alignItems: 'center',
  },
  confirmText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#fff' },
});
