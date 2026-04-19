import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  User, GlucoseReading, MealEntry, JournalEntry, Notification,
  Medication, WaterLog, Goal, ExerciseEntry, SleepEntry, AppSettings
} from '../types';
import {
  MOCK_USER, MOCK_GLUCOSE, MOCK_MEALS, MOCK_JOURNAL,
  MOCK_NOTIFICATIONS, MOCK_MEDICATIONS, MOCK_WATER_LOG,
  MOCK_GOALS, MOCK_EXERCISES,
} from '../data/mockData';
import { apiListarSono, apiCriarSono, apiAtualizarSono, apiDeletarSono, sonoParaEntry } from '../services/api';

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

  addGlucoseReading: (reading: Omit<GlucoseReading, 'id'>) => void;
  deleteGlucoseReading: (id: string) => void;
  addMeal: (meal: Omit<MealEntry, 'id'>) => void;
  deleteMeal: (id: string) => void;
  addJournal: (entry: Omit<JournalEntry, 'id'>) => void;
  deleteJournal: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleMedication: (id: string) => void;
  addWater: (amount: number) => void;
  getTodayWater: () => number;
  updateSettings: (s: Partial<AppSettings>) => void;
  updateUser: (u: Partial<User>) => void;
  completeOnboarding: () => void;
  updateGoal: (id: string, current: number) => void;
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
  const [glucoseReadings, setGlucoseReadings] = useState<GlucoseReading[]>(MOCK_GLUCOSE);
  const [meals, setMeals] = useState<MealEntry[]>(MOCK_MEALS);
  const [journals, setJournals] = useState<JournalEntry[]>(MOCK_JOURNAL);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [waterLog, setWaterLog] = useState<WaterLog[]>(MOCK_WATER_LOG);
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [exercises, setExercises] = useState<ExerciseEntry[]>(MOCK_EXERCISES);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [sleepLoading, setSleepLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [onboarded, setOnboarded] = useState(false);

  const addGlucoseReading = useCallback((reading: Omit<GlucoseReading, 'id'>) => {
    const newReading: GlucoseReading = { ...reading, id: Date.now().toString() };
    setGlucoseReadings(prev => [newReading, ...prev]);
  }, []);

  const deleteGlucoseReading = useCallback((id: string) => {
    setGlucoseReadings(prev => prev.filter(r => r.id !== id));
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

  const toggleMedication = useCallback((id: string) => {
    setMedications(prev => prev.map(m =>
      m.id === id ? { ...m, taken: !m.taken, lastTaken: !m.taken ? new Date().toISOString() : undefined } : m
    ));
  }, []);

  const addWater = useCallback((amount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newLog: WaterLog = {
      id: Date.now().toString(),
      date: today,
      amount,
      time: new Date().toTimeString().slice(0, 5),
    };
    setWaterLog(prev => [newLog, ...prev]);
  }, []);

  const getTodayWater = useCallback(() => {
    const today = '2026-04-06';
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

  const updateGoal = useCallback((id: string, current: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current, completed: current >= g.target } : g));
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
      addGlucoseReading, deleteGlucoseReading, addMeal, deleteMeal,
      addJournal, deleteJournal, markNotificationRead, markAllNotificationsRead,
      toggleMedication, addWater, getTodayWater, updateSettings, updateUser,
      completeOnboarding, updateGoal, addExercise,
      addSleepEntry, updateSleepEntry, deleteSleepEntry, loadSleepEntries, sleepLoading, getAvgSleepDuration,
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
