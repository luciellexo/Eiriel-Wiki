import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoseLog } from '../types';
import uuid from 'react-native-uuid';
import { ThemeColors, lightTheme } from '../constants/theme';

export type ThemeMode = 'light' | 'dark' | 'custom';

interface DoseState {
  logs: DoseLog[];
  favorites: string[]; 
  themeMode: ThemeMode;
  customTheme: Partial<ThemeColors>;
  addLog: (log: Omit<DoseLog, 'id'>) => void;
  removeLog: (id: string) => void;
  updateLog: (id: string, updates: Partial<DoseLog>) => void;
  clearLogs: () => void;
  toggleFavorite: (name: string) => void;
  isFavorite: (name: string) => boolean;
  setThemeMode: (mode: ThemeMode) => void;
  updateCustomTheme: (colors: Partial<ThemeColors>) => void;
}

export const useDoseStore = create<DoseState>()(
  persist(
    (set, get) => ({
      logs: [],
      favorites: [],
      themeMode: 'light',
      customTheme: {},
      addLog: (log) => set((state) => ({
        logs: [{ ...log, id: uuid.v4() as string }, ...state.logs]
      })),
      removeLog: (id) => set((state) => ({
        logs: state.logs.filter((l) => l.id !== id)
      })),
      updateLog: (id, updates) => set((state) => ({
        logs: state.logs.map((l) => (l.id === id ? { ...l, ...updates } : l))
      })),
      clearLogs: () => set({ logs: [] }),
      toggleFavorite: (name) => set((state) => {
        const exists = state.favorites.includes(name);
        return {
          favorites: exists 
            ? state.favorites.filter(n => n !== name)
            : [...state.favorites, name]
        };
      }),
      isFavorite: (name) => get().favorites.includes(name),
      setThemeMode: (mode) => set({ themeMode: mode }),
      updateCustomTheme: (colors) => set((state) => ({
        customTheme: { ...state.customTheme, ...colors }
      })),
    }),
    {
      name: 'dose-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
