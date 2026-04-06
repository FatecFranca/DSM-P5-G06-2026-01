import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Shadow, BorderRadius } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
}

export const Card = ({ children, style, padding = 16, shadow = 'md' }: CardProps) => {
  return (
    <View style={[
      styles.card,
      { padding },
      shadow !== 'none' && Shadow[shadow],
      style,
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
