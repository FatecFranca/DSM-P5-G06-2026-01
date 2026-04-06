import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius } from '../../theme';

interface Props {
  progress: number; // 0-1
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar = ({ progress, color = Colors.primary, height = 8, showLabel = false, label }: Props) => {
  const pct = Math.min(Math.max(progress, 0), 1);
  return (
    <View>
      {showLabel && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={[styles.pct, { color }]}>{Math.round(pct * 100)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: color + '20' }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color, borderRadius: height / 2 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  pct: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  track: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
