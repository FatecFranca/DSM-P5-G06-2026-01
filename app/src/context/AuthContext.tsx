import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiRegistrar, setApiToken, setUnauthorizedHandler, ApiUsuario } from '../services/api';

const TOKEN_KEY = '@diabecontrol:token';
const USER_KEY = '@diabecontrol:usuario';

interface AuthContextType {
  token: string | null;
  usuario: ApiUsuario | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  diagnosticoFeito: boolean;
  marcarDiagnosticoFeito: () => void;
  atualizarUsuario: (usuarioAtualizado: ApiUsuario) => Promise<void>;
  login: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<ApiUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosticoFeito, setDiagnosticoFeito] = useState(false);

  // Restore session on startup
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          const u: ApiUsuario = JSON.parse(storedUser);
          setToken(storedToken);
          setUsuario(u);
          setApiToken(storedToken);
          setDiagnosticoFeito(u.diagnosticoFeito ?? false);
        }
      } catch {
        // ignore storage errors
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const data = await apiLogin(email, senha);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    setApiToken(data.token);
    setToken(data.token);
    setUsuario(data.usuario);
    setDiagnosticoFeito(data.usuario.diagnosticoFeito ?? false);
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    const data = await apiRegistrar(nome, email, senha);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    setApiToken(data.token);
    setToken(data.token);
    setUsuario(data.usuario);
    setDiagnosticoFeito(data.usuario.diagnosticoFeito ?? false);
  }, []);

  const logout = useCallback(async () => {
    setUnauthorizedHandler(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setApiToken(null);
    setToken(null);
    setUsuario(null);
    setDiagnosticoFeito(false);
  }, []);

  const marcarDiagnosticoFeito = useCallback(() => {
    setDiagnosticoFeito(true);
  }, []);

  const atualizarUsuario = useCallback(async (usuarioAtualizado: ApiUsuario) => {
    setUsuario(usuarioAtualizado);
    setDiagnosticoFeito(usuarioAtualizado.diagnosticoFeito ?? false);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuarioAtualizado));
  }, []);

  // Registra o handler de sessão inválida sempre que logout mudar
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      token,
      usuario,
      isLoggedIn: !!token,
      isLoading,
      diagnosticoFeito,
      marcarDiagnosticoFeito,
      atualizarUsuario,
      login,
      registrar,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
