export const Colors = {
  primary: '#4CAF82',
  primaryDark: '#388E63',
  primaryLight: '#E8F5EE',
  secondary: '#3B8ED0',
  secondaryDark: '#2A6FAD',
  secondaryLight: '#E3F0FB',
  accent: '#FF6B6B',
  accentLight: '#FFE8E8',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',

  background: '#F7F9FC',
  card: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.06)',

  text: '#1A2332',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#F0F2F5',

  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  orange: '#F97316',
  orangeLight: '#FFF0E5',
  teal: '#14B8A6',
  tealLight: '#CCFBF1',
  pink: '#EC4899',
  pinkLight: '#FCE7F3',

  gradientGreen: ['#4CAF82', '#2E9E6B'],
  gradientBlue: ['#3B8ED0', '#2563EB'],
  gradientPurple: ['#8B5CF6', '#6D28D9'],
  gradientOrange: ['#F97316', '#EA580C'],
  gradientPink: ['#EC4899', '#DB2777'],

  darkBackground: '#0F172A',
  darkCard: '#1E293B',
  darkBorder: '#334155',
  darkText: '#F1F5F9',
  darkTextSecondary: '#94A3B8',
} as const;

export type ColorKey = keyof typeof Colors;
