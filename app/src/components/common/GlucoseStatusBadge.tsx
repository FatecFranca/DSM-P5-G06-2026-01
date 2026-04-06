import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlucoseStatus } from '../../types';
import { getGlucoseStatusColor, getGlucoseStatusLabel } from '../../utils/helpers';
import { FontSize, FontWeight, BorderRadius } from '../../theme';

interface Props {
  status: GlucoseStatus;
  size?: 'sm' | 'md';
}

export const GlucoseStatusBadge = ({ status, size = 'md' }: Props) => {
  const color = getGlucoseStatusColor(status);
  const label = getGlucoseStatusLabel(status);
  const small = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }, small && styles.small]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, small && styles.smallText]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 5,
  },
  small: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  smallText: {
    fontSize: FontSize.xs,
  },
});
