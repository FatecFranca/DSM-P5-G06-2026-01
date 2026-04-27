import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  User, GlucoseReading, MealEntry, JournalEntry, Notification,
  Medication, WaterLog, Goal, ExerciseEntry, SleepEntry, AppSettings
} from '../types';
import {
  MOCK_WATER_LOG,
} from '../data/mockData';
import { useAuth } from './AuthContext';
import {
  apiListarSono, apiCriarSono, apiAtualizarSono, apiDeletarSono, sonoParaEntry,
  apiListarMetas, apiCriarMeta, apiAtualizarMeta, apiDeletarMeta, metaParaGoal,
  apiListarHidratacao, apiCriarHidratacao, apiAtualizarHidratacao, apiDeletarHidratacao,
  hidratacaoParaWaterLog,
  apiListarGlicose, apiCriarGlicose, apiDeletarGlicose, glicoseParaReading,
  apiListarMedicacao, apiCriarMedicacao, apiAtualizarMedicacao, apiDeletarMedicacao,
  medicacaoParaApp,
  apiListarRefeicoes, apiCriarRefeicao, apiDeletarRefeicao, refeicaoParaMeal,
  apiListarDiarios, apiCriarDiario, apiDeletarDiario, diarioParaEntry,
  apiGetPerfil, apiAtualizarPerfil, usuarioParaUser,
  apiListarNotificacoes, apiMarcarNotificacaoLida, apiMarcarTodasNotificacoesLidas,
  notificacaoParaNotification,
  apiListarExercicios, apiCriarExercicio, apiAtualizarExercicio, apiDeletarExercicio,
  exercicioParaEntry,
  type CategoriaGoal,
  type FoodCategoryApp,
  type HumorApp,
  type TipoDiabetesApp,
  type IntensidadeApp,
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
  addMeal: (meal: Omit<MealEntry, 'id'>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  loadRefeicoes: (date: string) => Promise<void>;
  refeicaoLoading: boolean;
  addJournal: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  loadJournals: () => Promise<void>;
  journalLoading: boolean;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  loadNotificacoes: () => Promise<void>;
  notificacoesLoading: boolean;
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
  updateUser: (u: Partial<User>) => Promise<void>;
  loadPerfil: () => Promise<void>;
  completeOnboarding: () => void;
  updateGoal: (id: string, current: number) => Promise<void>;
  addGoal: (params: { title: string; description?: string; target: number; unit: string; category: CategoriaGoal; deadline: string; color?: string }) => Promise<void>;
  editGoalFields: (id: string, params: { title?: string; description?: string; target?: number; unit?: string; category?: CategoriaGoal; deadline?: string; color?: string }) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  loadGoals: () => Promise<void>;
  goalsLoading: boolean;
  loadExercicios: () => Promise<void>;
  exerciciosLoading: boolean;
  addExercise: (params: { type: string; duration: number; calories: number; date: string; time: string; intensity: IntensidadeApp; notes?: string }) => Promise<void>;
  editExercise: (id: string, params: Partial<{ type: string; duration: number; calories: number; date: string; time: string; intensity: IntensidadeApp; notes: string }>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
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

const defaultUser: User = {
  id: '',
  name: '',
  email: '',
  age: 0,
  weight: 0,
  height: 0,
  diabetesType: 'none',
  targetGlucoseMin: 70,
  targetGlucoseMax: 140,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { usuario } = useAuth();
  const [user, setUser] = useState<User>(defaultUser);
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>([]);
  const [glicoseLoading, setGlicoseLoading] = useState(false);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [refeicaoLoading, setRefeicaoLoading] = useState(false);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificacoesLoading, setNotificacoesLoading] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicacoesLoading, setMedicacoesLoading] = useState(false);
  const [waterLog, setWaterLog] = useState<WaterLog[]>(MOCK_WATER_LOG);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [exerciciosLoading, setExerciciosLoading] = useState(false);
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

  const loadRefeicoes = useCallback(async (date: string) => {
    setRefeicaoLoading(true);
    try {
      const result = await apiListarRefeicoes(1, 100, date);
      setMeals(result.dados.map(r => refeicaoParaMeal(r) as MealEntry));
    } catch {
      // keep current state on error
    } finally {
      setRefeicaoLoading(false);
    }
  }, []);

  const addMeal = useCallback(async (meal: Omit<MealEntry, 'id'>) => {
    const totalProteinas = meal.foods.reduce((s, f) => s + f.protein, 0);
    const totalGorduras  = meal.foods.reduce((s, f) => s + f.fat, 0);
    const refeicao = await apiCriarRefeicao({
      tipo:      meal.type as any,
      data:      meal.date,
      hora:      meal.time,
      alimentos: meal.foods.map(f => ({
        id:           f.id,
        name:         f.name,
        calories:     f.calories,
        carbs:        f.carbs,
        protein:      f.protein,
        fat:          f.fat,
        category:     f.category as FoodCategoryApp,
        portion:      f.portion,
        glycemicIndex: f.glycemicIndex,
      })),
      totalCalorias:  meal.totalCalories,
      totalCarbs:     meal.totalCarbs,
      totalProteinas,
      totalGorduras,
      notas:          meal.notes,
    });
    setMeals(prev => [refeicaoParaMeal(refeicao) as MealEntry, ...prev]);
  }, []);

  const deleteMeal = useCallback(async (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
    try {
      await apiDeletarRefeicao(id);
    } catch {
      // já removido localmente, não precisa reverter
    }
  }, []);

  const loadJournals = useCallback(async () => {
    setJournalLoading(true);
    try {
      const result = await apiListarDiarios(1, 100);
      setJournals(result.dados.map(d => diarioParaEntry(d) as JournalEntry));
    } catch {
      // keep current state on error
    } finally {
      setJournalLoading(false);
    }
  }, []);

  const addJournal = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    const d = await apiCriarDiario({
      titulo:   entry.title,
      conteudo: entry.content,
      humor:    entry.mood as HumorApp,
      sintomas: entry.symptoms,
      tags:     entry.tags,
    });
    setJournals(prev => [diarioParaEntry(d) as JournalEntry, ...prev]);
  }, []);

  const deleteJournal = useCallback(async (id: string) => {
    setJournals(prev => prev.filter(j => j.id !== id));
    await apiDeletarDiario(id);
  }, []);

  const loadNotificacoes = useCallback(async () => {
    setNotificacoesLoading(true);
    try {
      const result = await apiListarNotificacoes(1, 100);
      setNotifications(result.dados.map(notificacaoParaNotification) as Notification[]);
    } catch {
      // keep current state on error
    } finally {
      setNotificacoesLoading(false);
    }
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await apiMarcarNotificacaoLida(id);
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await apiMarcarTodasNotificacoesLidas();
    } catch {
      // optimistic already applied, ignore
    }
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

  useEffect(() => {
    if (usuario) {
      setUser(usuarioParaUser(usuario) as User);
      loadNotificacoes();
      loadExercicios();
    }
  }, [usuario]);

  const loadPerfil = useCallback(async () => {
    if (!user.id) return;
    try {
      const u = await apiGetPerfil(user.id);
      setUser(usuarioParaUser(u) as User);
    } catch {
      // keep current state on error
    }
  }, [user.id]);

  const updateUser = useCallback(async (u: Partial<User>) => {
    setUser(prev => ({ ...prev, ...u }));
    if (!user.id) return;
    try {
      const updated = await apiAtualizarPerfil(user.id, {
        nome:             u.name,
        idade:            u.age,
        peso:             u.weight,
        altura:           u.height,
        diabetesType:     u.diabetesType as TipoDiabetesApp | undefined,
        targetGlucoseMin: u.targetGlucoseMin,
        targetGlucoseMax: u.targetGlucoseMax,
        doctorName:       u.doctorName,
        lastCheckup:      u.lastCheckup,
      });
      setUser(usuarioParaUser(updated) as User);
    } catch {
      // keep optimistic update on error
    }
  }, [user.id]);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...s }));
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

  const loadExercicios = useCallback(async () => {
    setExerciciosLoading(true);
    try {
      const result = await apiListarExercicios(1, 200);
      setExercises(result.dados.map(exercicioParaEntry) as ExerciseEntry[]);
    } catch {
      // keep current state on error
    } finally {
      setExerciciosLoading(false);
    }
  }, []);

  const addExercise = useCallback(async (params: { type: string; duration: number; calories: number; date: string; time: string; intensity: IntensidadeApp; notes?: string }) => {
    const e = await apiCriarExercicio({
      tipo:       params.type,
      duracao:    params.duration,
      calorias:   params.calories,
      data:       params.date,
      hora:       params.time,
      intensidade: params.intensity,
      notas:      params.notes,
    });
    setExercises(prev => [exercicioParaEntry(e) as ExerciseEntry, ...prev]);
  }, []);

  const editExercise = useCallback(async (id: string, params: Partial<{ type: string; duration: number; calories: number; date: string; time: string; intensity: IntensidadeApp; notes: string }>) => {
    const e = await apiAtualizarExercicio(id, {
      tipo:       params.type,
      duracao:    params.duration,
      calorias:   params.calories,
      data:       params.date,
      hora:       params.time,
      intensidade: params.intensity,
      notas:      params.notes,
    });
    setExercises(prev => prev.map(ex => ex.id === id ? (exercicioParaEntry(e) as ExerciseEntry) : ex));
  }, []);

  const deleteExercise = useCallback(async (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
    await apiDeletarExercicio(id);
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
      addGlucoseReading, deleteGlucoseReading, loadGlicose, glicoseLoading,
      addMeal, deleteMeal, loadRefeicoes, refeicaoLoading,
      addJournal, deleteJournal, loadJournals, journalLoading,
      markNotificationRead, markAllNotificationsRead, loadNotificacoes, notificacoesLoading,
      toggleMedication, loadMedicacoes, medicacoesLoading, criarMedicacao, editarMedicacao, deletarMedicacao,
      addWater, getTodayWater, updateSettings, updateUser, loadPerfil,
      completeOnboarding, updateGoal, addGoal, editGoalFields, deleteGoal, loadGoals, goalsLoading,
      loadExercicios, exerciciosLoading, addExercise, editExercise, deleteExercise,
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
