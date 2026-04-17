import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiRegistrar, setApiToken, ApiUsuario } from '../services/api';

const TOKEN_KEY = '@diabecontrol:token';
const USER_KEY = '@diabecontrol:usuario';

interface AuthContextType {
  token: string | null;
  usuario: ApiUsuario | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<ApiUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on startup
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUsuario(JSON.parse(storedUser));
          setApiToken(storedToken);
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
  }, []);

  const registrar = useCallback(async (nome: string, email: string, senha: string) => {
    const data = await apiRegistrar(nome, email, senha);
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
    setApiToken(data.token);
    setToken(data.token);
    setUsuario(data.usuario);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    setApiToken(null);
    setToken(null);
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      token,
      usuario,
      isLoggedIn: !!token,
      isLoading,
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
