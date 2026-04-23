import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  User, GlucoseReading, MealEntry, JournalEntry, Notification,
  Medication, WaterLog, Goal, ExerciseEntry, SleepEntry, AppSettings
} from '../types';
import {
  MOCK_USER, MOCK_GLUCOSE, MOCK_MEALS, MOCK_JOURNAL,
  MOCK_NOTIFICATIONS, MOCK_WATER_LOG,
  MOCK_EXERCISES,
} from '../data/mockData';
import {
  apiListarSono, apiCriarSono, apiAtualizarSono, apiDeletarSono, sonoParaEntry,
  apiListarMetas, apiCriarMeta, apiAtualizarMeta, apiDeletarMeta, metaParaGoal,
  apiListarHidratacao, apiCriarHidratacao, apiAtualizarHidratacao, apiDeletarHidratacao,
  hidratacaoParaWaterLog,
  apiListarGlicose, apiCriarGlicose, apiDeletarGlicose, glicoseParaReading,
  apiListarMedicacao, apiCriarMedicacao, apiAtualizarMedicacao, apiDeletarMedicacao,
  medicacaoParaApp,
  type CategoriaGoal,
} from '../services/api';

interface AppContextType {
  user: User;
  glucoseReadings: GlucoseReading[];
  meals: MealEntry[];
  journals: JournalEntry[];
  notifications: Notification[];
  medications: Medication[];
  waterLog: WaterLog[];
  goals: Goal[];
  exercises: ExerciseEntry[];
  sleepEntries: SleepEntry[];
  settings: AppSettings;
  onboarded: boolean;

  addGlucoseReading: (reading: Omit<GlucoseReading, 'id'>) => Promise<void>;
  deleteGlucoseReading: (id: string) => Promise<void>;
  loadGlicose: () => Promise<void>;
  glicoseLoading: boolean;
  addMeal: (meal: Omit<MealEntry, 'id'>) => void;
  deleteMeal: (id: string) => void;
  addJournal: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteJournal: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleMedication: (id: string) => Promise<void>;
  loadMedicacoes: () => Promise<void>;
  medicacoesLoading: boolean;
  criarMedicacao: (params: { nome: string; dosagem: string; frequencia: string; horarios: string[]; tipo: 'insulin' | 'oral' | 'supplement' | 'other'; notas?: string; cor?: string }) => Promise<void>;
  editarMedicacao: (id: string, params: { nome?: string; dosagem?: string; frequencia?: string; horarios?: string[]; tipo?: 'insulin' | 'oral' | 'supplement' | 'other'; notas?: string; cor?: string }) => Promise<void>;
  deletarMedicacao: (id: string) => Promise<void>;
  addWater: (amount: number) => Promise<void>;
  getTodayWater: () => number;
  loadHidratacao: () => Promise<void>;
  hidratacaoLoading: boolean;
  criarHidratacao: (params: { data: string; hora: string; quantidade: number }) => Promise<void>;
  atualizarHidratacao: (id: string, params: { data?: string; hora?: string; quantidade?: number }) => Promise<void>;
  deletarHidratacao: (id: string) => Promise<void>;
  updateSettings: (s: Partial<AppSettings>) => void;
  updateUser: (u: Partial<User>) => void;
  completeOnboarding: () => void;
  updateGoal: (id: string, current: number) => Promise<void>;
  addGoal: (params: { title: string; description?: string; target: number; unit: string; category: CategoriaGoal; deadline: string; color?: string }) => Promise<void>;
  editGoalFields: (id: string, params: { title?: string; description?: string; target?: number; unit?: string; category?: CategoriaGoal; deadline?: string; color?: string }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  loadGoals: () => Promise<void>;
  goalsLoading: boolean;
  addExercise: (entry: Omit<ExerciseEntry, 'id'>) => void;
  addSleepEntry: (entry: Omit<SleepEntry, 'id'>) => Promise<void>;
  updateSleepEntry: (id: string, updates: Omit<SleepEntry, 'id'>) => Promise<void>;
  deleteSleepEntry: (id: string) => Promise<void>;
  loadSleepEntries: () => Promise<void>;
  sleepLoading: boolean;
  getAvgSleepDuration: () => number;
  unreadNotificationsCount: number;
}

const defaultSettings: AppSettings = {
  darkMode: false,
  notifications: true,
  glucoseUnit: 'mg/dL',
  reminderGlucose: true,
  reminderMeal: true,
  reminderMedication: true,
  language: 'pt-BR',
  backupEnabled: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [glicoseLoading, setGlicoseLoading] = useState(false);
  const [meals, setMeals] = useState<MealEntry[]>(MOCK_MEALS);
  const [journals, setJournals] = useState<JournalEntry[]>(MOCK_JOURNAL);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicacoesLoading, setMedicacoesLoading] = useState(false);
  const [waterLog, setWaterLog] = useState<WaterLog[]>(MOCK_WATER_LOG);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [exercises, setExercises] = useState<ExerciseEntry[]>(MOCK_EXERCISES);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [sleepLoading, setSleepLoading] = useState(false);
  const [hidratacaoLoading, setHidratacaoLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [onboarded, setOnboarded] = useState(false);

  const loadGlicose = useCallback(async () => {
    setGlicoseLoading(true);
    try {
      const result = await apiListarGlicose(1, 200);
      setGlucoseReadings(result.dados.map(g => glicoseParaReading(g) as GlucoseReading));
    } catch {
      // keep current state on error
    } finally {
      setGlicoseLoading(false);
    }
  }, []);

  const addGlucoseReading = useCallback(async (reading: Omit<GlucoseReading, 'id'>) => {
    const g = await apiCriarGlicose({
      valor: reading.value,
      contexto: reading.context as any,
      data: reading.date,
      hora: reading.time,
      notas: reading.notes,
    });
    setGlucoseReadings(prev => [glicoseParaReading(g) as GlucoseReading, ...prev]);
  }, []);

  const deleteGlucoseReading = useCallback(async (id: string) => {
    setGlucoseReadings(prev => prev.filter(r => r.id !== id));
    await apiDeletarGlicose(id);
  }, []);

  const addMeal = useCallback((meal: Omit<MealEntry, 'id'>) => {
    const newMeal: MealEntry = { ...meal, id: Date.now().toString() };
    setMeals(prev => [newMeal, ...prev]);
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  }, []);

  const addJournal = useCallback((entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = { ...entry, id: Date.now().toString() };
    setJournals(prev => [newEntry, ...prev]);
  }, []);

  const deleteJournal = useCallback((id: string) => {
    setJournals(prev => prev.filter(j => j.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const loadMedicacoes = useCallback(async () => {
    setMedicacoesLoading(true);
    try {
      const result = await apiListarMedicacao(1, 200);
      setMedications(result.dados.map(m => medicacaoParaApp(m) as Medication));
    } catch {
      // keep current state on error
    } finally {
      setMedicacoesLoading(false);
    }
  }, []);

  const toggleMedication = useCallback(async (id: string) => {
    const current = medications.find(m => m.id === id);
    if (!current) return;
    const novoTomado = !current.taken;
    const ultimaTomada = novoTomado ? new Date().toISOString() : null;
    setMedications(prev => prev.map(m =>
      m.id === id ? { ...m, taken: novoTomado, lastTaken: ultimaTomada ?? undefined } : m
    ));
    try {
      await apiAtualizarMedicacao(id, { tomado: novoTomado, ultimaTomada });
    } catch {
      setMedications(prev => prev.map(m =>
        m.id === id ? { ...m, taken: current.taken, lastTaken: current.lastTaken } : m
      ));
    }
  }, [medications]);

  const criarMedicacao = useCallback(async (params: { nome: string; dosagem: string; frequencia: string; horarios: string[]; tipo: 'insulin' | 'oral' | 'supplement' | 'other'; notas?: string; cor?: string }) => {
    const m = await apiCriarMedicacao(params);
    setMedications(prev => [medicacaoParaApp(m) as Medication, ...prev]);
  }, []);

  const editarMedicacao = useCallback(async (id: string, params: { nome?: string; dosagem?: string; frequencia?: string; horarios?: string[]; tipo?: 'insulin' | 'oral' | 'supplement' | 'other'; notas?: string; cor?: string }) => {
    const m = await apiAtualizarMedicacao(id, params);
    setMedications(prev => prev.map(med => med.id === id ? (medicacaoParaApp(m) as Medication) : med));
  }, []);

  const deletarMedicacao = useCallback(async (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
    await apiDeletarMedicacao(id);
  }, []);

  const loadHidratacao = useCallback(async () => {
    setHidratacaoLoading(true);
    try {
      const result = await apiListarHidratacao(1, 200);
      setWaterLog(result.dados.map(hidratacaoParaWaterLog) as WaterLog[]);
    } catch {
      // keep current state on error
    } finally {
      setHidratacaoLoading(false);
    }
  }, []);

  const addWater = useCallback(async (amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().slice(0, 5);
    const h = await apiCriarHidratacao({ data: today, hora: now, quantidade: amount });
    setWaterLog(prev => [hidratacaoParaWaterLog(h) as WaterLog, ...prev]);
  }, []);

  const criarHidratacao = useCallback(async (params: { data: string; hora: string; quantidade: number }) => {
    const h = await apiCriarHidratacao(params);
    setWaterLog(prev => [hidratacaoParaWaterLog(h) as WaterLog, ...prev]);
  }, []);

  const atualizarHidratacao = useCallback(async (id: string, params: { data?: string; hora?: string; quantidade?: number }) => {
    const h = await apiAtualizarHidratacao(id, params);
    setWaterLog(prev => prev.map(w => w.id === id ? (hidratacaoParaWaterLog(h) as WaterLog) : w));
  }, []);

  const deletarHidratacao = useCallback(async (id: string) => {
    setWaterLog(prev => prev.filter(w => w.id !== id));
    await apiDeletarHidratacao(id);
  }, []);

  const getTodayWater = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return waterLog.filter(w => w.date === today).reduce((sum, w) => sum + w.amount, 0);
  }, [waterLog]);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  const updateUser = useCallback((u: Partial<User>) => {
    setUser(prev => ({ ...prev, ...u }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboarded(true);
  }, []);

  const loadGoals = useCallback(async () => {
    setGoalsLoading(true);
    try {
      const result = await apiListarMetas(1, 100);
      setGoals(result.dados.map(m => metaParaGoal(m) as Goal));
    } catch {
      // keep current state on error
    } finally {
      setGoalsLoading(false);
    }
  }, []);

  const updateGoal = useCallback(async (id: string, current: number) => {
    const existing = goals.find(g => g.id === id);
    const completed = existing ? current >= existing.target : false;
    const meta = await apiAtualizarMeta(id, { current, completed });
    setGoals(prev => prev.map(g => g.id === id ? (metaParaGoal(meta) as Goal) : g));
  }, [goals]);

  const addGoal = useCallback(async (params: { title: string; description?: string; target: number; unit: string; category: CategoriaGoal; deadline: string; color?: string }) => {
    const meta = await apiCriarMeta(params);
    setGoals(prev => [metaParaGoal(meta) as Goal, ...prev]);
  }, []);

  const editGoalFields = useCallback(async (id: string, params: { title?: string; description?: string; target?: number; unit?: string; category?: CategoriaGoal; deadline?: string; color?: string }) => {
    const meta = await apiAtualizarMeta(id, params);
    setGoals(prev => prev.map(g => g.id === id ? (metaParaGoal(meta) as Goal) : g));
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    await apiDeletarMeta(id);
  }, []);

  const addExercise = useCallback((entry: Omit<ExerciseEntry, 'id'>) => {
    const newEntry: ExerciseEntry = { ...entry, id: Date.now().toString() };
    setExercises(prev => [newEntry, ...prev]);
  }, []);

  const loadSleepEntries = useCallback(async () => {
    setSleepLoading(true);
    try {
      const result = await apiListarSono(1, 100);
      setSleepEntries(result.dados.map(sonoParaEntry) as SleepEntry[]);
    } catch {
      // keep current state on error
    } finally {
      setSleepLoading(false);
    }
  }, []);

  const addSleepEntry = useCallback(async (entry: Omit<SleepEntry, 'id'>) => {
    const sono = await apiCriarSono(entry);
    const newEntry = sonoParaEntry(sono) as SleepEntry;
    setSleepEntries(prev => [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const updateSleepEntry = useCallback(async (id: string, updates: Omit<SleepEntry, 'id'>) => {
    const sono = await apiAtualizarSono(id, updates);
    const updated = sonoParaEntry(sono) as SleepEntry;
    setSleepEntries(prev => prev.map(s => s.id === id ? updated : s).sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const deleteSleepEntry = useCallback(async (id: string) => {
    setSleepEntries(prev => prev.filter(s => s.id !== id));
    await apiDeletarSono(id);
  }, []);

  const getAvgSleepDuration = useCallback(() => {
    if (sleepEntries.length === 0) return 0;
    const total = sleepEntries.reduce((sum, s) => sum + s.duration, 0);
    return Math.round((total / sleepEntries.length) * 10) / 10;
  }, [sleepEntries]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      user, glucoseReadings, meals, journals, notifications, medications,
      waterLog, goals, exercises, sleepEntries, settings, onboarded,
      addGlucoseReading, deleteGlucoseReading, loadGlicose, glicoseLoading, addMeal, deleteMeal,
      addJournal, deleteJournal, markNotificationRead, markAllNotificationsRead,
      toggleMedication, loadMedicacoes, medicacoesLoading, criarMedicacao, editarMedicacao, deletarMedicacao,
      addWater, getTodayWater, updateSettings, updateUser,
      completeOnboarding, updateGoal, addGoal, editGoalFields, deleteGoal, loadGoals, goalsLoading, addExercise,
      addSleepEntry, updateSleepEntry, deleteSleepEntry, loadSleepEntries, sleepLoading, getAvgSleepDuration,
      loadHidratacao, hidratacaoLoading, criarHidratacao, atualizarHidratacao, deletarHidratacao,
      unreadNotificationsCount,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
