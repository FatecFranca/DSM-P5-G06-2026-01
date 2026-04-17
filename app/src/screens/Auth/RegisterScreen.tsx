import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Heart, User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<any>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { registrar } = useAuth();
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await registrar(nome.trim(), email.trim(), senha);
      navigation.replace('Main');
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', err?.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#3B8ED0', '#2563EB']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoCircle}>
          <Heart size={36} color="#fff" />
        </View>
        <Text style={styles.logoTitle}>Criar conta</Text>
        <Text style={styles.headerSub}>Junte-se ao Diabetes Care</Text>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nome */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Nome completo</Text>
          <View style={styles.inputRow}>
            <User size={16} color={Colors.textLight} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={Colors.textLight}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* E-mail */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputRow}>
            <Mail size={16} color={Colors.textLight} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Senha */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputRow}>
            <Lock size={16} color={Colors.textLight} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textLight}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowSenha(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {showSenha ? <EyeOff size={16} color={Colors.textLight} /> : <Eye size={16} color={Colors.textLight} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmar senha */}
        <View style={styles.fieldWrap}>
          <Text style={styles.label}>Confirmar senha</Text>
          <View style={styles.inputRow}>
            <Lock size={16} color={Colors.textLight} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Repita a senha"
              placeholderTextColor={Colors.textLight}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!showConfirmar}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmar(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {showConfirmar ? <EyeOff size={16} color={Colors.textLight} /> : <Eye size={16} color={Colors.textLight} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Register button */}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Criar conta</Text>
          }
        </TouchableOpacity>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 32,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: '#fff',
    marginBottom: 4,
  },
  headerSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  body: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bodyContent: {
    padding: Spacing.xl,
  },
  fieldWrap: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  btn: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});
