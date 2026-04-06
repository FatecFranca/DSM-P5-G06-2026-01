import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  gradient?: string[];
}

export const Button = ({
  title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, gradient,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const heights = { sm: 38, md: 48, lg: 56 };
  const fontSizes = { sm: FontSize.sm, md: FontSize.md, lg: FontSize.lg };

  const containerStyle = [
    styles.base,
    { height: heights[size], borderRadius: BorderRadius.md },
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    { fontSize: fontSizes[size] },
    variant === 'outline' && { color: Colors.primary },
    variant === 'ghost' && { color: Colors.primary },
    (variant === 'outline' || variant === 'ghost') && styles.darkText,
  ];

  if (variant === 'primary' || gradient) {
    const colors = gradient || Colors.gradientGreen;
    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled} style={[containerStyle, { overflow: 'hidden' }]}>
        <LinearGradient
          colors={isDisabled ? ['#B0B0B0', '#A0A0A0'] : colors as [string, string]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[styles.text, { fontSize: fontSizes[size] }]}>{title}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const bgColors: Record<string, string> = {
    secondary: Colors.secondary,
    outline: 'transparent',
    ghost: 'transparent',
    danger: Colors.danger,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        containerStyle,
        { backgroundColor: bgColors[variant] || Colors.primary },
        variant === 'outline' && styles.outline,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#fff'} size="small" />
        : <Text style={textStyle}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  gradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  text: {
    color: Colors.textInverse,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
  },
  darkText: {
    color: Colors.text,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
