import { Substance } from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api = {
  searchSubstances: async (query: string): Promise<Substance[]> => {
    try {
      const response = await fetch(`${BASE_URL}/api/substances?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error searching substances:', error);
      return [];
    }
  },

  getAllSubstances: async (limit: number = 1000): Promise<Substance[]> => {
    try {
        const response = await fetch(`${BASE_URL}/api/substances?limit=${limit}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching substances:', error);
        return [];
    }
  },

  getSubstanceDetail: async (name: string): Promise<Substance | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/substances/${encodeURIComponent(name)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching substance detail:', error);
      return null;
    }
  }
};
