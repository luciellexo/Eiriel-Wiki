import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoseLog } from '../types';
import uuid from 'react-native-uuid';

interface DoseState {
  logs: DoseLog[];
  addLog: (log: Omit<DoseLog, 'id'>) => void;
  removeLog: (id: string) => void;
  updateLog: (id: string, updates: Partial<DoseLog>) => void;
  clearLogs: () => void;
}

export const useDoseStore = create<DoseState>()(
  persist(
    (set) => ({
      logs: [],
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
    }),
    {
      name: 'dose-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
