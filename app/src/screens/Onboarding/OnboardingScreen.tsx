import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, Utensils, Heart, TrendingUp, ShieldCheck } from 'lucide-react-native';

const slides = [
  {
    id: '1',
    gradient: ['#4CAF82', '#2E9E6B'] as [string, string],
    icon: <Heart size={64} color="#fff" />,
    title: 'Bem-vindo ao\nDiabetes Care',
    subtitle: 'Seu companheiro completo para o controle do diabetes. Monitoramento, alimentação e saúde em um só lugar.',
  },
  {
    id: '2',
    gradient: ['#3B8ED0', '#2563EB'] as [string, string],
    icon: <Activity size={64} color="#fff" />,
    title: 'Monitore sua\nGlicose',
    subtitle: 'Registre suas medições, acompanhe a evolução em gráficos e receba alertas personalizados.',
  },
  {
    id: '3',
    gradient: ['#F97316', '#EA580C'] as [string, string],
    icon: <Utensils size={64} color="#fff" />,
    title: 'Diário\nAlimentar',
    subtitle: 'Registre suas refeições, conheça o índice glicêmico dos alimentos e faça escolhas mais saudáveis.',
  },
  {
    id: '4',
    gradient: ['#8B5CF6', '#6D28D9'] as [string, string],
    icon: <TrendingUp size={64} color="#fff" />,
    title: 'Relatórios\nDetalhados',
    subtitle: 'Visualize sua evolução com gráficos completos e compartilhe dados com seu médico.',
  },
  {
    id: '5',
    gradient: ['#EC4899', '#DB2777'] as [string, string],
    icon: <ShieldCheck size={64} color="#fff" />,
    title: 'Pré-Diagnóstico\nInteligente',
    subtitle: 'Faça um questionário rápido e descubra seu nível de risco para diabetes. Sempre com orientação médica.',
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation<Nav>();
  const { completeOnboarding } = useApp();
  const insets = useSafeAreaInsets();
  const currentSlide = useMemo(() => slides[currentIndex], [currentIndex]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeOnboarding();
      navigation.replace('Main');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    navigation.replace('Main');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={currentSlide.gradient} style={[styles.slide, { paddingTop: insets.top + 60 }]}>
        <View style={styles.logoArea}>
          <View style={styles.iconCircle}>
            {currentSlide.icon}
          </View>
          <View style={styles.logoTextWrap}>
            <Text style={styles.logoApp}>DIABETES</Text>
            <Text style={styles.logoCare}>CARE</Text>
          </View>
        </View>

        <View style={styles.textArea}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
        </View>
      </LinearGradient>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
                { backgroundColor: currentSlide.gradient[0] },
                i !== currentIndex && { backgroundColor: Colors.border, opacity: 0.5 },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: currentSlide.gradient[0] }]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Começar!' : 'Próximo'}
          </Text>
        </TouchableOpacity>

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  logoTextWrap: { alignItems: 'center' },
  logoApp: {
    fontSize: 28, fontWeight: FontWeight.extrabold, color: '#fff',
    letterSpacing: 6,
  },
  logoCare: {
    fontSize: 14, fontWeight: FontWeight.medium, color: 'rgba(255,255,255,0.8)',
    letterSpacing: 8, marginTop: -4,
  },
  textArea: { paddingHorizontal: 40, alignItems: 'center' },
  title: {
    fontSize: 30, fontWeight: FontWeight.extrabold, color: '#fff',
    textAlign: 'center', lineHeight: 38, marginBottom: 16,
  },
  subtitle: {
    fontSize: FontSize.md, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', lineHeight: 24,
  },
  bottom: {
    backgroundColor: Colors.card,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: Spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  nextBtn: {
    width: '100%', height: 52, borderRadius: BorderRadius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  nextText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  skipBtn: { paddingVertical: Spacing.sm },
  skipText: { color: Colors.textSecondary, fontSize: FontSize.md },
});
