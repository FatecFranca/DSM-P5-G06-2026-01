import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Activity, Utensils, Pill, Calendar, Lightbulb, Target,
  CheckCheck, Bell, ArrowLeft,
} from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { Notification } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TYPE_ICONS: Record<Notification['type'], React.ReactNode> = {
  glucose:     <Activity size={18} color={Colors.primary} />,
  meal:        <Utensils size={18} color={Colors.orange} />,
  medication:  <Pill size={18} color={Colors.purple} />,
  appointment: <Calendar size={18} color={Colors.secondary} />,
  tip:         <Lightbulb size={18} color={Colors.warning} />,
  goal:        <Target size={18} color={Colors.teal} />,
};

const TYPE_COLORS: Record<Notification['type'], string> = {
  glucose:     Colors.primary,
  meal:        Colors.orange,
  medication:  Colors.purple,
  appointment: Colors.secondary,
  tip:         Colors.warning,
  goal:        Colors.teal,
};

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationsCount } = useApp();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const key = n.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  const dateLabel = (date: string) => {
    if (date === '2026-04-06') return 'Hoje';
    if (date === '2026-04-05') return 'Ontem';
    return date.split('-').reverse().join('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Notificações</Text>
            <Text style={styles.headerSub}>
              {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} não lida(s)` : 'Tudo em dia!'}
            </Text>
          </View>
          {unreadNotificationsCount > 0 ? (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllNotificationsRead}>
              <CheckCheck size={16} color={Colors.warning} />
              <Text style={styles.markAllText}>Marcar todas</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 36 }} />}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(date => (
          <View key={date} style={styles.group}>
            <Text style={styles.dateLabel}>{dateLabel(date)}</Text>
            {grouped[date].map(n => {
              const color = TYPE_COLORS[n.type];
              return (
                <TouchableOpacity
                  key={n.id}
                  activeOpacity={0.8}
                  onPress={() => markNotificationRead(n.id)}
                >
                  <Card
                    style={StyleSheet.flatten([styles.notifCard, n.read ? undefined : styles.notifUnread, n.read ? undefined : { borderLeftColor: color }]) as any}
                    padding={14}
                  >
                    <View style={styles.notifRow}>
                      <View style={[styles.notifIcon, { backgroundColor: color + '15' }]}>
                        {TYPE_ICONS[n.type]}
                      </View>
                      <View style={styles.notifContent}>
                        <View style={styles.notifHeaderRow}>
                          <Text style={[styles.notifTitle, !n.read && styles.notifTitleBold]}>{n.title}</Text>
                          {!n.read && <View style={[styles.unreadDot, { backgroundColor: color }]} />}
                        </View>
                        <Text style={styles.notifMessage}>{n.message}</Text>
                        <Text style={styles.notifTime}>{n.time}</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyWrap}>
            <Bell size={48} color={Colors.border} />
            <Text style={styles.emptyTitle}>Sem notificações</Text>
            <Text style={styles.emptyText}>Você não tem notificações no momento.</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitles: { flex: 1 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#fff', marginBottom: 2 },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  markAllText: { fontSize: FontSize.sm, color: Colors.warning, fontWeight: FontWeight.semibold },
  content: { padding: Spacing.lg },
  group: { marginBottom: Spacing.lg },
  dateLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  notifCard: { marginBottom: 8 },
  notifUnread: { borderLeftWidth: 3 },
  notifRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  notifIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  notifTitle: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  notifTitleBold: { fontWeight: FontWeight.bold },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifMessage: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: FontSize.xs, color: Colors.textLight },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 16, marginBottom: 4 },
  emptyText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
