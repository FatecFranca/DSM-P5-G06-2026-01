import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Utensils, BookOpen, Home, Grid } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, BorderRadius, Shadow } from '../theme';
import { useApp } from '../context/AppContext';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import GlucoseScreen from '../screens/Glucose/GlucoseScreen';
import FoodDiaryScreen from '../screens/Food/FoodDiaryScreen';
import JournalScreen from '../screens/Journal/JournalScreen';
import MoreScreen from '../screens/More/MoreScreen';

const Tab = createBottomTabNavigator();

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadNotificationsCount } = useApp();

  const tabs = [
    { name: 'HomeTab',    label: 'Início',   icon: Home },
    { name: 'GlucoseTab', label: 'Glicose',  icon: Activity },
    { name: 'FoodTab',    label: 'Alimentos', icon: Utensils },
    { name: 'JournalTab', label: 'Diário',    icon: BookOpen },
    { name: 'MoreTab',    label: 'Mais',      icon: Grid },
  ];

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 12 }]}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        const IconComp = tab.icon;
        const color = isFocused ? Colors.primary : Colors.textLight;
        const showBadge = tab.name === 'MoreTab' && unreadNotificationsCount > 0;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: state.routes[index].key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(tab.name);
              }
            }}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.activeIndicator} />}
            <View style={styles.tabIconWrap}>
              <IconComp size={22} color={color} strokeWidth={isFocused ? 2.5 : 1.8} />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadNotificationsCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab"    component={HomeScreen} />
      <Tab.Screen name="GlucoseTab" component={GlucoseScreen} />
      <Tab.Screen name="FoodTab"    component={FoodDiaryScreen} />
      <Tab.Screen name="JournalTab" component={JournalScreen} />
      <Tab.Screen name="MoreTab"    component={MoreScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    ...Shadow.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    width: 32,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  tabIconWrap: {
    position: 'relative',
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.danger,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.card,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: FontWeight.bold,
  },
});
