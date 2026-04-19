import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ShieldCheck, HelpCircle, Bell, Settings, User, TrendingUp,
  Droplets, Pill, Target, Lightbulb, Dumbbell, Moon, ChevronRight,
} from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { RootStackParamList } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: number | string;
  color: string;
  onPress: () => void;
}

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const { user, unreadNotificationsCount } = useApp();
  const insets = useSafeAreaInsets();

  const sections: Array<{ title: string; items: MenuItem[] }> = [
    {
      title: 'Saúde',
      items: [
        {
          icon: <Droplets size={20} color="#fff" />,
          label: 'Hidratação',
          sublabel: 'Controle seu consumo de água',
          color: Colors.teal,
          onPress: () => navigation.navigate('Water' as any),
        },
        {
          icon: <Pill size={20} color="#fff" />,
          label: 'Medicações',
          sublabel: 'Seus remédios do dia',
          color: Colors.purple,
          onPress: () => navigation.navigate('Medications' as any),
        },
        {
          icon: <Target size={20} color="#fff" />,
          label: 'Metas',
          sublabel: 'Acompanhe seus objetivos',
          color: Colors.orange,
          onPress: () => navigation.navigate('Goals' as any),
        },
        {
          icon: <Moon size={20} color="#fff" />,
          label: 'Sono',
          sublabel: 'Monitore seu descanso',
          color: Colors.purple,
          onPress: () => navigation.navigate('Sleep' as any),
        },
        {
          icon: <TrendingUp size={20} color="#fff" />,
          label: 'Relatórios',
          sublabel: 'Gráficos e análises detalhadas',
          color: Colors.purple,
          onPress: () => navigation.navigate('Reports' as any),
        },
      ],
    },
    {
      title: 'Ferramentas',
      items: [
        {
          icon: <ShieldCheck size={20} color="#fff" />,
          label: 'Pré-Diagnóstico',
          sublabel: 'Avalie seu risco para diabetes',
          color: Colors.primary,
          onPress: () => navigation.navigate('Diagnosis' as any),
        },
        {
          icon: <Lightbulb size={20} color="#fff" />,
          label: 'Dicas & Artigos',
          sublabel: 'Conteúdo educativo sobre diabetes',
          color: Colors.warning,
          onPress: () => navigation.navigate('Tips' as any),
        },
        {
          icon: <HelpCircle size={20} color="#fff" />,
          label: 'FAQ',
          sublabel: 'Perguntas frequentes',
          color: Colors.teal,
          onPress: () => navigation.navigate('FAQ' as any),
        },
      ],
    },
    {
      title: 'Conta',
      items: [
        {
          icon: <User size={20} color="#fff" />,
          label: 'Perfil',
          sublabel: user.name,
          color: Colors.secondary,
          onPress: () => navigation.navigate('Profile' as any),
        },
        {
          icon: <Bell size={20} color="#fff" />,
          label: 'Notificações',
          sublabel: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} não lidas` : 'Sem notificações novas',
          badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
          color: Colors.warning,
          onPress: () => navigation.navigate('Notifications' as any),
        },
        {
          icon: <Settings size={20} color="#fff" />,
          label: 'Configurações',
          sublabel: 'Personalize o app',
          color: '#4B5563',
          onPress: () => navigation.navigate('Settings' as any),
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Profile mini card */}
      <LinearGradient
        colors={['#1A2332', '#2D3748']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileSub}>{user.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile' as any)}
          >
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <Card style={styles.sectionCard} padding={0}>
              {section.items.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                    <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                      {item.icon}
                    </View>
                    <View style={styles.menuText}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.sublabel && <Text style={styles.menuSub} numberOfLines={1}>{item.sublabel}</Text>}
                    </View>
                    {item.badge !== undefined && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight size={18} color={Colors.textLight} />
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </Card>
          </View>
        ))}

        <Text style={styles.versionText}>Diabetes Care v1.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  profileSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.full },
  editBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  content: { padding: Spacing.lg },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, letterSpacing: 1, marginBottom: Spacing.sm },
  sectionCard: {},
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 14 },
  menuIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  menuSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  badge: { backgroundColor: Colors.danger, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: FontWeight.bold },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 70 },
  versionText: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textLight, marginTop: Spacing.md },
});
