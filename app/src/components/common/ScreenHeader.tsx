import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  backgroundColor?: string;
  light?: boolean;
}

export const ScreenHeader = ({ title, subtitle, showBack = true, rightElement, backgroundColor = Colors.card, light = false }: Props) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const textColor = light ? Colors.textInverse : Colors.text;

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top + 8 }]}>
      <StatusBar barStyle={light ? 'light-content' : 'dark-content'} backgroundColor={backgroundColor} />
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={22} color={textColor} />
          </TouchableOpacity>
        ) : <View style={styles.backBtn} />}

        <View style={styles.center}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: light ? 'rgba(255,255,255,0.75)' : Colors.textSecondary }]}>{subtitle}</Text>}
        </View>

        <View style={styles.backBtn}>
          {rightElement}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.xs,
    marginTop: 1,
  },
});
